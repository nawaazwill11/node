const jimp = require('jimp');
const fs = require('fs');
const async = require('async');

function makeThumbnail(file_buffer, callback) {
    jimp.read(file_buffer)
    .then(image => {
        image
        .resize(100, 100)
        .getBuffer(jimp.MIME_PNG, function (error, buffer) {
            callback(null, buffer);
        });
    })
    .catch (error => {
        callback(error);
    });
}

module.exports = function (buffer, callback) {
    return makeThumbnail(buffer, callback);
}