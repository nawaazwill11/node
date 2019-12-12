const jimp = require('jimp');

function validFile(type) {
    let valid_ft = [
        'image/jpeg',
        'image/png',
        'image/gif'
    ];
    for (vfilet of valid_ft) {
        if (type === vfilet) {
            console.log(true);
            return true
        }
    }
    console.log(true);
    return false;
}

function generateThumbnail(file_buffer, type, callback) {
    if (validFile(type)) {
        jimp.read(file_buffer)
        .then(image => {
            image
            .resize(100, 100)
            .getBuffer(jimp.MIME_PNG, function (error, buffer) {
                console.log('here');
                callback(null, buffer);
            });
        })
        .catch (error => {
            console.log('error here');
            callback(error);
        });
    }
    else {
        callback(null, file_buffer);
    }
}

module.exports = { generateThumbnail };