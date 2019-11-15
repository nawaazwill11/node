'use strict';

const server = require('http').createServer();
const Router = require('router');
const router = Router();
const fs = require('fs');
const fh = require('finalhandler');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, './uploads');
    },
    filename: function (request, file, callback) {
        console.log(file.originalname);
        callback(null, file.originalname);
    }
});
const upload = multer({
    storage: storage
}).array('images');

const template = {
    '/': 'index.html',
}

server.on('request', function (request, response){
    console.log(request.url);
    router(request, response, fh(request, response));
});
server.listen(8000);

router.get('/', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream(template['/']).pipe(response);
});

router.get(/css\/\w+\.css/, (request, response) => {
    fs.readdir('css', (error, files) => {
        if (error) return console.error(error);
        for (let i = 0; i < files.length; i++) {
            console.log(`/css/${files[i]}`);
            if (`/css/${files[i]}` === request.url) {
                response.writeHead(200, {'Content-type': 'text/css'});
                fs.createReadStream(request.url.slice(1,)).pipe(response);
                return true;
            }
        }
        response.writeHead(404);
        response.end();
    });
});


router.get(/js\/[\w.-]+\.js/, (request, response) => {
    fs.readdir('js', (error, files) => {
        if (error) return console.error(error);
        for (let i = 0; i < files.length; i++) {
            console.log(`/js/${files[i]}`);
            if (`/js/${files[i]}` === request.url) {
                response.writeHead(200, {'Content-type': 'text/css'});
                fs.createReadStream(request.url.slice(1,)).pipe(response);
                return true;
            }
        }
        response.writeHead(404);
        response.end();
    });
});

router.post('/upload', (request, response) => {
    upload(request, response, function (error) {
        console.log(request.file);
        if (error) response.end('Something went wrong');
        return response.end('Files uploaded!');
    });
});