const jimp = require('jimp');
const fs = require('fs');
const async = require('async');

function validFile(type) {
    let valid_ft = [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/gif'
    ];
    for (vfilet of valid_ft) {
        if (type === vfilet) {
            return true
        }
    }
    return false;
}

function makeThumbnail(file_buffer, type, callback) {
    if (validFile(type)) {
        jimp.read(file_buffer)
        .then(image => {
            image
            .resize(100, 100)
            .getBuffer(jimp.MIME_PNG, function (error, buffer) {
                callback(null, buffer);
            });
        })
        .catch (error => {
            console.log('error here');
            callback(error);
        });
    }
    callback(null, buffer);
}

module.exports = function (buffer, callback) {
    return makeThumbnail(buffer, callback);
}