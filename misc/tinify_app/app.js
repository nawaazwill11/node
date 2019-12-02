const tinify = require('tinify');
tinify.key = 'yGnKjQ2B62VWs5kSy4rBZ32lRdXcdDHX';
const file_name = 'arrow.svg';
const path = '/home/walker/workspace/node/figa/uploads/'
try {
    const source = tinify.fromFile(path + file_name);
    source.toFile(`./compressed/${file_name}`)
    .catch(error => {
        console.log('error occured');
    });
    let compressionsThisMonth = tinify.compressionCount;
    console.log('compressed: ', compressionsThisMonth);
}
catch (e) {
    console.log('error occured');
}
