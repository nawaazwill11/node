const Busboy = require('busboy');
const fs = require('fs');
let db;
let db_file = './data.json';
let matched_list = [];

function getDB() {
    return new Promise((resolve, reject) => {
        fs.readFile(db_file, 'utf8', (error, data) => {
            if (error) {
                console.log("error occurred");
                reject(error);
            }
            resolve(data)
        });
    })
    .catch(error => {
        console.log('error in catch');
        console.log(error);
    });
}

function getMatchingTags(tag) {
    let temp = tag.split(',');
    tag = temp[temp.length - 1].trim();
    console.log('tag: ', tag );
    if (tag.length > 0) {
        for (let i = 0; i < db.tags.length; i++) {
            if (db.tags[i].tagname.search(new RegExp(tag)) >= 0) {
                console.log(db.tags[i].tagname);
                matched_list.push(db.tags[i].tagname);
            }
        }
    }
}

async function matchedTags(request, response) {
    db = JSON.parse(await getDB());
    let busboy = new Busboy({headers: request.headers});
    busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encdoing, mimetype) => {
        if (fieldname === 'search_tags') {
            getMatchingTags(val);
        }
    });
    busboy.on('finish', function() {
        response.writeHead(200, {'Content-Type': 'text/plain'})
        response.end(matched_list.toString());
        matched_list = [];
    });
    request.pipe(busboy);
}

module.exports = matchedTags