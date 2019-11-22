const fs = require('fs');
const db_path = './data.json';
let db;

async function getFilesList(response) {
    new Promise((resolve, reject) => {
        fs.readFile(db_path, 'utf8', (error, data) => {
            if (error) {
                console.log(error);
                reject(error)
            } 
            resolve(data)
        });
    })
    .then(data => {
        data = JSON.parse(data);
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end(data.files_list.toString());
    })
    .catch(error => {
        console.log(error);
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.end('Internal Error Occured: ', error);
    });
}

module.exports = getFilesList