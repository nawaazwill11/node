const Busboy = require('busboy');
const fs = require('fs');
// let DB = require('./db');
let db;

function makeTagsList() {
    
    return db.tags.map(tagObj => tagObj.tagname);
}

function getMatchingFiles(tags) {
    tags = tags.split(',').map(tag => tag.trim());
    // let db_tags = makeTagsList();
    let matched_files = []
    db.files.forEach(fileObj => {
        let count = 0;
        tags.forEach(tag => {
            fileObj.tags.forEach(file_tag => {
                if (file_tag === tag) {
                    count += 1;
                }
            });
        });
        if (count === tags.length) {
            matched_files.push(fileObj.filename);
        }
    });
    console.log(matched_files);
    return matched_files;
}

async function tagSearch(request, response) {
    let matched_files;
    db = await DB.getDB();
    let busboy = new Busboy({headers: request.headers});
    busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encdoing, mimetype) => {
        if (fieldname === 'search_tags') {
            matched_files = getMatchingFiles(val);
        }
    });
    busboy.on('finish', function() {
        response.writeHead(200, {'Content-Type': 'text/plain'})
        response.end(matched_files.toString());
    });
    request.pipe(busboy);
}

async function suggestions(response) {
    db = await DB.getDB();
    response.writeHead(200, {'Content-Type': 'text/plain'})
    response.end(makeTagsList().toString());
}

module.exports = { suggestions, tagSearch }