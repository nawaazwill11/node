// globals
const async = require('async');
// const Busboy = require('busboy');
const db = require('./db');
const drive = require('./drive_api');
const formidable = require('formidable');
const fs = require('fs');
const mv = require('mv');
const path = require('path');
const { Readable } = require('stream');
// const tinify = require('./tinify');

function emptyUploads() {
    let upload_dir = './uploads';
    for (file of fs.readdirSync('./uploads')) {
        fs.unlink(path.join(upload_dir, file), (error) => {
            if (error) throw error;
        });
        console.log('uploads empty');
    }
}
emptyUploads();

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

function bufferToStream(buffer) {
    const readableInstanceStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });
    return readableInstanceStream;
}

function upload(request, response) {
    // const busboy = new Busboy({headers: request.headers});
    let form = new formidable.IncomingForm();
    let tags;
    let files = [];
    emptyUploads();
    form.multiples = true;
    form.parse(request);
    
    form.on('field', function (name, field) {
        tags = field;
    });

    form.on('file', function (name, file) {
        let file_obj = {
            buffer: fs.readFileSync(file.path),
            name: file.name,
            size: file.size,
            type: file.type
        }
        files.push(file_obj);
        // let write_stream = fs.createWriteStream('./uploads/' + file.name);
        // write_stream.write(file_obj.file_buffer);
    });

    form.on('end', function() {
       uploadProcessor(tags, files, response);
    });

    // request.pipe(busboy);
}

function uploadProcessor(tags, files, response) {
    let tag_error = validateTags(tags);
    if (tag_error) {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.end(JSON.stringify({ error: error }));
    }
    else {
        let file_error = [];
        async.waterfall([
            function validityCheck(callback) {
                let valid_files = []
                for(file of files) {
                    if (validFile(file.type)) {
                        valid_files.push(file);
                    }
                    else {
                        file_error.push({
                            file: file.name,
                            error: 0
                        })
                    }
                }
                callback(null, valid_files);
            },
            function uploadToDrive(files, callback) {
                let uploaded_files = [];
    
                drive.initiateAuthorization(function (error, oAuthClient) {
                    if (error) return callback(error);
                    console.log('access token acquired');
                    drive.getFolder(oAuthClient, 'figa', function (error, folder_id) {
                        if (error) return callback(error);
                        async.each(files, function (file, callback) {
                            console.log('Pushing file to drive with name ', file.name);
                            file['stream'] = bufferToStream(file.buffer);
                            drive.uploadFiles(oAuthClient, folder_id, file, function (error, record) {
                                if (error) {
                                    callback(error);
                                }
                                else {
                                    file['id'] = record.id;
                                    uploaded_files.push(file);
                                    console.log('pushed');
                                    callback();
    
                                }
                            });
                        }, function (error) {
                            // create records of each uploaded file
                            if (error) return callback(error + ' an error occured');
                            else {
                                console.log('All files uploaded to drive.')
                                console.log('Initiating storing files to db...')
                                callback(null, uploaded_files);
                            }
                        });
                    });
                });
            },
            function addFileRecord(files, callback) {
                tags = tags.split(',');
                db.getPool(function (pool) {
                    async.each(files, function(file, callback){
                        db.addFileRecord(pool, tags, file, function (error) {
                            if (error) return callback(error);
                            console.log('File record inserted into db ', file.name);
                            callback();
                        })
                    }, function (error) {
                        if (error) return callback(error);
                        callback(null, 'done');
                    })
                })
            },
            // function cleanUp(callback) {
            //     // cleanup code
            //     callback();
            // }
        ], function onError(error) {
            if (error) {
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.end(error.toString());
            }
            else if (file_error.length > 0) {
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.end(JSON.stringify(file_error));
            }
            else {
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.end('Uploaded.');
            }
            console.log('Done form parsing.');
        });
    }
}

module.exports = { upload }