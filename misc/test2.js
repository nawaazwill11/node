const fs = require('fs');
const thumbnail = require('./thumbnail');
let file_buffer = fs.readFileSync('./uploads/ss.png');
let callback = function (error, buffer) {
    if (error) return console.error(error);
    console.log(buffer);
}
thumbnail(file_buffer, callback);
