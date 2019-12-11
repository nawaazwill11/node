const fs = require('fs');
const { Readable } = require('stream');

function bufferToStream(buffer) {
    const readableInstanceStream = new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });
    return readableInstanceStream;
}

let file = fs.readFileSync('./uploads/ss.png');
bufferToStream(file).pipe(fs.createWriteStream('./uploads/ss2.png'));