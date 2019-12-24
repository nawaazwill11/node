// globals
const async = require('async');
const db = require('./db');
const drive = require('./drive_api');
const formidable = require('formidable');
const fs = require('fs');
const mv = require('mv');
const path = require('path');
const { Readable } = require('stream');
const thumbnail = require('./thumbnail');

// empties the upload folder on every load.
function emptyUploads() {
    let upload_dir = './uploads';
    for (file of fs.readdirSync('.')) {
        if (file === 'uploads') {
            fs.unlink(path.join(upload_dir, file), (error) => {
                if (error) throw error;
            });
            console.log('uploads empty');
        }
    }
}
emptyUploads();

// return whether the tags are valid or not
function validateTags(tags) {
    let error = null;
    if (tags.length === 0) {
        error = 'Error: Please add one or more tags.';
    }
    else {
        let split_tags = tags.split(',');
        for (let i = 0; i < split_tags.length; i++) {
            tag = split_tags[i].trim();
            if (tag.length < 2) {
                error = 'Error: Each tag should have at least 2 characters.'
                break;
            }
            else if (!/^\w|\w$/.test(tag)) {
                error = 'Error: Tags should begin or end only with alphabets, numbers or an underscore.' 
                break;
            }
            else if (/\s/.test(tag)) {
                error = 'Error: Tags cannot contain spaces.';
            }
        }
    }
    return error;
}

// uploads only these file types.
function validFile(filetype) {
    let file_types = [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/gif'
    ];
    for (let i = 0; i < file_types.length; i++) {
        if (file_types[i] === filetype) {
            return true;
        }
    }
    return null;
}

// converts buffer (binary) to stream data
function bufferToStream(buffer) {
    const readableInstanceStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });
    return readableInstanceStream;
}

// the main function called on /upload request
function upload(request, response) {
    let form = new formidable.IncomingForm(); // form instance to parse forms
    let tags; // stores tags of the current upload session
    let files = []; // stores file objects of uploaded files
    emptyUploads();
    form.multiples = true; // accept multiple files from form
    form.parse(request);
    
    // grabs the text (tag) field from the form
    form.on('field', function (name, field) {
        tags = field;
    });

    //grabs the files from the form
    form.on('file', function (name, file) {
        // file object to be used during upload
        let file_obj = {
            buffer: fs.readFileSync(file.path),
            name: file.name,
            size: file.size,
            type: file.type
        }
        files.push(file_obj);

    });

    form.on('end', function() {
        // initiates the upload process when form parsing ends.
       uploadProcessor(tags, files, response);
    });
}

// uploads files to drive, stores tag and file records to database, sends final response
function uploadProcessor(tags, files, response) {
    let tag_error = validateTags(tags);
    if (tag_error) {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.end(JSON.stringify({ error: tag_error }));
    }
    // only proceed if tags are valid. else respond with error
    else {
        let files_with_error = [];
        // upload process in a sequence
        async.waterfall([
            //checks file validity by checking its mimetype
            function validityCheck(callback) {
                let valid_files = []; // all valid files will be passed on the next function
                for(file of files) {
                    if (validFile(file.type)) {
                        valid_files.push(file);
                    }
                    else {
                        files_with_error.push({
                            file: file.name,
                            message: 'Invalid file'
                        });
                    }
                }
                callback(null, valid_files);
            },
            // uploads all valid files to drive and adds file id to file object
            function uploadToDrive(files, callback) {
                let uploaded_files = []; // stores all uploads files
                // return an oAuthv3 authentication object
                drive.initiateAuthorization(function (error, oAuthClient) {
                    if (error) return callback(error);
                    console.log('access token acquired');
                    // gets the folder id
                    drive.getFolder(oAuthClient, 'figa', function (error, folder_id) {
                        if (error) return callback(error);
                        // iterates through each file in parallel and passes them to the upload function
                        async.each(files, function (file, callback) {
                            console.log('Uploading file to drive with name ', file.name);
                            file['stream'] = bufferToStream(file.buffer); // creating files buffer to stream to uploads to drive
                            // function that actually uploads the file and gets the uploaded file's id
                            drive.uploadFiles(oAuthClient, folder_id, file, function (error, record) {
                                if (error) {
                                    files_with_error.push({
                                        file: file.name,
                                        message: 'Drive upload failed'
                                    });
                                    return callback(`Failed to upload ${file.name} to drive\n${error}`); //each
                                }
                                console.log('File ' + file.name + ' successfully uploaded')
                                file['id'] = record.id; // file id stored in file object 
                                uploaded_files.push(file); // pushed upload files to a list for storing them in database
                                callback(); // each
                            });
                        }, function (error) {
                            if (error) return callback(error);
                            console.log('All files uploaded to drive.');
                            console.log('Inserting file records in db...');
                            callback(null, uploaded_files); //waterfall
                        });
                    });
                });
            },
            // create records of each uploaded file
            function addFileRecord(files, callback) {
                tags = tags.split(',');
                // gets a pool object and uses the same for all file record insertion instead of creating a new one everytime
                db.getPool(function (pool) {
                    // iterates through all file objects and stores them to database
                    let count = 0;
                    async.each(files, function(file, callback){
                        console.log('Thumbnailing file ', file.name);
                        thumbnail.generateThumbnail(file.buffer, file.type, function (error, thumbnail) {
                            if (error) {
                                files_with_error.push({
                                    file: file.name,
                                    message: 'Cannot create thumbnail'
                                });
                                return callback(error); // each
                            }
                            console.log('Thumbnail fetched');
                            file['thumbnail'] = thumbnail;
                            // inserts file meta to database
                            db.addFileRecord(pool, tags, file, function (error) {
                                if (error) {
                                    files_with_error.push({
                                        file: file.name,
                                        message: 'Database insertion failed'
                                    });
                                    console.log(error);
                                    return callback(error); // each
                                }
                                console.log('File ' + file.name + ' record inserted into db ');
                                callback(); // each
                            });
                        });
                    }, function (error) {
                        if (error) return callback(error); // waterfall
                        console.log('All files record successfully inserted in db.');
                        console.log('Files that failed to upload due to error\n', files_with_error);
                        callback(); // waterfall

                    });
                });
            }
        ], function onError(error) {
            // unsolvable error return server error
            if (error) {
                response.writeHead(500, {'Content-Type': 'text/plain'});
                let data = {
                    success: false,
                    error: error
                }
                response.end(JSON.stringify(data));
            }
            // partial success error
            else if (files_with_error.length > 0) {
                response.writeHead(207, {'Content-Type': 'text/plain'});
                let data = {
                    success: 'partial',
                    error: files_with_error
                }
                response.end(JSON.stringify(data));
            }
            // all process successfully executed
            else {
                response.writeHead(200, {'Content-Type': 'text/plain'});
                let data = {
                    success: true
                }
                response.end(JSON.stringify(data));
            }
            console.log('Done processing.');
        });
    }
}

module.exports = { upload }