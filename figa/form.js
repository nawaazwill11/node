const Busboy = require('busboy'); // busboy class
const fs = require('fs'); // access file system
const db_file = './data.json';
let count = 0;
let duplicates = []; 
let db = {}; //globally accessible json database
let error = {
    'file_error': null,
    'field_error': null
}

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

function getReadFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (error, data) => {
            if (error) reject(error)
            resolve(data)
        });
    });   
}

function getLastId() {
    return db.lastId;
}

function newFileObj (filename, tags) {
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

    let id = getLastId() + 1;
    return {
        "id": id,
        "filename": filename,
        "originalname": filename,
        "tags": tags
    }
}

function updateDB(filename, tags, callback) {
    for (let i = 0; i < db.files.length; i++) {
        if (db.files[i].filename === filename) {
            duplicates.push(filename);
            console.log('duplicate found ', filename);
            return '';
        }
    }
    console.log('adding new file object');
    db.files.push(newFileObj(filename, tags));
    db.lastId += 1;
    new Promise((resolve, reject) => {
        fs.writeFile(db_file, JSON.stringify(db, null, 4), error => {
            if (error) reject(error);
            resolve(db);
        });
    })
    .then(db => {
        console.log('Promise complete.');
    })
    .catch(err => {
        callback(err);
    });
    callback(null);
}

function saveFile(file, tags, callback) {
    try {
        file['file'].pipe(fs.createWriteStream(`./uploads/${file.filename}`));
        updateDB(file.filename, tags, err => {
            if (err) {
                error.field_error = err;
                return false;
            }
            console.log(file.filename, ' added to db');
        });
        callback(null);
    }
    catch (err) {
        callback(err);
    }
}

function uploadFiles(file, tags) {
    saveFile(file, tags, err => {
        if (err) {
            error['file_error'] = err;
            return false;
        }
        console.log(file.filename, ' saved to uploads directory.');
    });

}

function errorCheck(error, response) {
    console.log(error);
    for (let e in error) {
        if (error[e]) {
            response.writeHead(500, {'Content-type': 'text/plain'});
            response.end(error[e]);

        }
    }
}

function finalOp(response) {
    if (duplicates.length > 0) {
        response.writeHead(207, {'Content-Type': 'text/plain'});
        response.end(JSON.stringify({
            "duplicates": duplicates
        }));
    }
    else{
        response.writeHead(200, {'Content-type': 'text/html' });
        response.end('Uploaded.');
    }
}


async function upload(request, response) {
    duplicates = [];
    let busboy = new Busboy({headers: request.headers});    
    db = JSON.parse(await getReadFile(db_file));
    let file;
    let tags = [];
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        uploadFiles({
            filename: filename,
            file: file,
        }, tags);
    });
    busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encdoing, mimetype) => {
        if (fieldname == 'tags') {
            error['field_error'] = tagError(val);
            if (!error['field_error']) {
                val.split(',').forEach(tag => {
                    tags.push(tag.trim());
                });
            }
        }
    });
    busboy.on('finish', function() {
        count++;
        console.log(count);
        errorCheck(error, response);
        finalOp(response);
        console.log('Done parsing form!');
    });
    request.pipe(busboy);
}

module.exports = { upload }