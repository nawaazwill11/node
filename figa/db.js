const fs = require('fs');
let db_file = './data.json';

function getDB() {
    return new Promise((resolve, reject) => {
        fs.readFile(db_file, 'utf8', (error, data) => {
            if (error) {
                console.log("error has occurred while fetching database.");
                reject(error);
            }
            resolve(data)
        });
    })
    .then(data => {
        return JSON.parse(data);
    })
    .catch(error => {
        console.log('error in catch');
        console.log(error);
    });
}

function updateDB(db) {
    if (typeof(db) !== 'object') {
        return ;
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(db_file, JSON.stringify(db, null, 4), error => {
            if (error) reject(error);
            resolve(db);
        });
    })
}
module.exports = { getDB, updateDB }