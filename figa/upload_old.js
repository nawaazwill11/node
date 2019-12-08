const Busboy = require('busboy'); // busboy class
const fs = require('fs');    
     // access file system
const DB = require('./db');
const path = require('path');
// const tinify = require('./tinify');
let files_list = [];               // stores uploaded files names
let duplicates = [];              // stores duplicate file during form parsing
let db;                          // globally accessible json database
let tag_added;
// stores file and field error during form parsing
let error = {
    'file_error': null,
    'field_error': null,
    refresh() {
        this['file_error'] = null;
        this['field_error'] = null;
    }
}
// supported file types
let file_types = [
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/gif'
];

let flag = false;   // indicated error occurrence

function emptyUploads() {
    let upload_dir = './uploads';
    fs.readdir('./uploads', (error, files) => {
        if (error) throw error;
        for (let file of files) {
            fs.unlink(path.join(upload_dir, file), (error) => {
                if (error) throw error;
            });
        }
        console.log('uploads empty');
    })
}

function validFileType(filetype) {
    for (let i = 0; i < file_types.length; i++) {
        if (file_types[i] === filetype) {
            return true;
        }
    }
    return null;
}

// checks if the tag field parsed in the form if valid
function tagError(tags) {
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

// return the id of the latest entry from the database
function getLastId() {
    return db.lastId;
}

// returns a new file object
function newFileObj(filename, tags) {
    // if (obj) {
    //     let newTags = []
    //     for (let i = 0; i < db.files[i].tags.length; i++) {
    //         for (let j = 0; j < tags; j++) {
    //             if (tags[j] !== db.files[i].tags[i]) {
    //                 newTags.push(tags[j]);
    //             }
    //         }
    //     }
    // }

    let id = 1
    if (!db.files.length == 0) {
        id = db.files[db.files.length - 1].id + 1;
    }
    return {
        "id": id,
        "filename": filename,
        "originalname": filename,
        "tags": tags
    }
}


// update tags list
function updateTags(tags, filename) {
    for (let i = 0; i < tags.length; i++) {
        for (let j = 0; j < db.tags.length; j++) {
            if (tags[i] == db.tags[j].tagname) {
                db.tags[j].assocfiles.push(filename);
                console.log(`${filename} added to tags`);
                break;
            }
        }
    }
}

// updates the database with new file object
function updateFileToDB(filename, tags, callback) {
    console.log('adding new file object');
    db.files.push(newFileObj(filename, tags));
    updateTags(tags, filename);
    DB.updateDB(db)
        .then(db => {
            console.log('Promise complete.');
        })
        .catch(err => {
            callback(err);
        });
    callback(null);
}

// saves files to disk
function saveFile(file, tags, callback) {
    new Promise((resolve, reject) => {
        try {
            file['file'].pipe(fs.createWriteStream(`${process.cwd()}/uploads/${file.filename}`))
            resolve(file);
        }
        catch (err) {
            console.log(err);
            reject(err);
        }
    })
    .then(file => {
        updateFileToDB(file.filename, tags, err => {
            if (err) {
                callback(err);
                return false;
            }
            if (!tag_added) {
                addTags(tags);
            } 
            console.log(file.filename, ' added to db');
        });
        callback(null);

    })
    .catch(err => {
        callback(err);
    })
    
}

function fileExists(filename) {
    for (let i = 0; i < db.files.length; i++) {
        if (db.files[i].filename === filename) {
            duplicates.push(filename);
            console.log('duplicate found ', filename);
            return true;
        }
    }
    return false;
}

// calls functions to store files to disk
async function uploadFiles(file, tags) {
    if (fileExists(file.filename)) {
        file.file.resume();
        return '';
    }
    await saveFile(file, tags, err => {
        if (err) {
            error['file_error'] = err;
            return false;
        }
        console.log(file.filename, ' saved to uploads directory.');
    });
}

// adds new tags to db
function tagExists(tag) {
    for (let j = 0; j < db.tags.length; j++) {
        if (tag === db.tags[j].tagname) {
            return true
        }
    }
    return false;
}

// creates new tag object
function newTagObj(tag) {
    let id = 1;
    if (!db.tags.length == 0) {
        id = db.tags[db.tags.length - 1].id + 1;
    }
    return {
        id: id,
        tagname: tag,
        assocfiles: []
    }
}

// adds new tags to db
function addTags(tags) {
    for (let i = 0; i < tags.length; i++) {
        if(!tagExists(tags[i])) {
            db.tags.push(newTagObj(tags[i]));
            tag_added = true;
        }
    }
}

// adds new error to error object
function addError(message, type) {
    if (message){
        error[type] = message;
        flag = true;
        return true;
    }
    return false;
}

// generate error response
function errorReporter() {
    console.log(error);
    let errors_list = [];
    for (let e in error) {
        if (error[e] && e != 'refresh') {
            errors_list.push(error[e]);
        }
    }
    return errors_list;
}

// checks duplicates and notifies
function finalOp(error, response) {
    let errors_list = errorReporter();
    if (errors_list.length > 0) {
        response.writeHead(500, {'Content-type': 'text/plain'});
        response.end(errors_list.toString());
    }
    else if (duplicates.length > 0) {
        response.writeHead(207, {'Content-Type': 'text/plain'});
        response.end(JSON.stringify({
            "duplicates": duplicates
        }));
    }
    else {
        response.writeHead(200, {'Content-type': 'text/plain' });
        response.end('Uploaded.');
    }
}

// main function to process form parsing and uploading files
async function upload(request, response) {
    let busboy = new Busboy({headers: request.headers}); // busboy instance for body parsing
    let tags = [];                                      // stores tags from form
    tag_added = false;
    duplicates = [];                                     // empties the duplicate array on each uplaod request
    flag = false;
    db = await DB.getDB();                                     // database current state
    error.refresh();
    emptyUploads();
    // parsing fields in the incoming form
    busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encdoing, mimetype) => {
        // validation for incoming field
        if (!flag) {
            if (fieldname == 'tags') { 
                if (!addError(tagError(val), 'field_error')) {
                    val.split(',').forEach(tag => {
                        tags.push(tag.trim());
                    });
                }
            }
            else {
                addError('Internal error: Invalid tag input. Please retry.', 'field_error');
            }    
        }
        else {
            addError('Internal error: Unresolved errors. Please refresh the page and retry.', 'field_error');
        }    
        
    });
    // parsing files 
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        try {    
            if (!flag) {
                if (validFileType(mimetype)) {
                    uploadFiles({
                        filename: filename,
                        file: file,
                    }, tags);
                }
                else {
                    addError('Internal error: Unsupported file type. Please retry.', 'file_error');
                    file.resume();
                }
            }
            else {
                addError('Internal error: Unresolved errors. Please refresh the page and retry.', 'field_error');
                file.resume();
            }
        }
        catch (e) {
            console.log("Error handled: ", e);
        }
    });
    // parsing ends
    busboy.on('finish', async function() {
        // await tinify.compress(error, response)
        // .then(() => {
        //     console.log('compression process complete')
        //     finalOp(error, response);
        // });
        finalOp(error, response);
        console.log('Done parsing form!');
    });
    request.pipe(busboy);
}
 
function done() {}
module.exports = { upload } // upload function accessible using form.upload