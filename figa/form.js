const Busboy = require('busboy'); // busboy class
const fs = require('fs'); // access file system
const db_file = './data.json';
let duplicates = []; 
let db = {}; //globally accessible json database

function getReadFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (error, data) => {
            if (error) reject(error)
            resolve(data)
        });
    });   
}

function uploadFile(file, callback) {
    //
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
    .catch(error => {
        console.error(error);
    });
    callback(null);
}

async function upload(request, response) {
    let busboy = new Busboy({headers: request.headers});    
    db = JSON.parse(await getReadFile(db_file));
    let files = [];
    let fields = [];
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        files.push({
            filename: filename,
            file: file,
        });
        updateDB(filename, tags=['mandap'], function(error) {
            if (error) console.error(error)
            console.log(filename, ' added to db');
            // uploadFile(file, filename);
        });
        file.resume();
        // console.log(db);
        // console.log(`Fieldname: ${fieldname}\nFile: ${filename}\nEncoding: ${encoding}\nMime type: ${mimetye}`);
        // file.pipe(fs.createWriteStream(`./uploads/${filename}`));
    });
    busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encdoing, mimetype) => {
        console.log('has fields');
        fields.push({
            fieldname: fieldname,
            value: val
        });
    });
    busboy.on('finish', function() {
        console.log('Done parsing form!');
        console.log(duplicates);
        // files.forEach(file => {
        //     console.log(file);
        // });
        fields.forEach(field => {
            console.log('field',field);
        });
        if (duplicates.length > 0) {
            response.writeHead(207, {'Content-Type': 'text/plain'});
            response.end(JSON.stringify({
                "duplicates": duplicates
            }));
        }
        else{
            response.writeHead(200, { Connection: 'close', Location: '/' });
            response.end();
        }
        duplicates = [];
    });
    request.pipe(busboy);
}

module.exports = { upload }