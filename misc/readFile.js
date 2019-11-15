const fs = require('fs');

function getReadFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (error, data) => {
            if (error) reject(error)
            resolve(data)
        });
    });   
}

async function printFileContent(path) {
    const file = JSON.parse(await getReadFile(path));
    console.log(file);
}

printFileContent('./data.json');