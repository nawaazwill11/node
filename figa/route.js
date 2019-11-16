const fs = require('fs');
const Router = require('router');
const router = Router();
const fh = require('finalhandler');
const form = require('./form');
const template = {
    '/': 'index.html',
}

router.get('/', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream(template['/']).pipe(response);
});

router.get(/css\/\w+\.css/, (request, response) => {
    fs.readdir('css', (error, files) => {
        if (error) return console.error(error);
        for (let i = 0; i < files.length; i++) {
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
            if (`/js/${files[i]}` === request.url) {
                response.writeHead(200, {'Content-type': 'text/js'});
                fs.createReadStream(request.url.slice(1,)).pipe(response);
                return true;
            }
        }
        response.writeHead(404);
        response.end();
    });
});
// upload form parsing
router.post('/upload', (request, response) => {
    form.upload(request, response);
});

module.exports = function (request, response) {
    console.log(request.url);
    router(request, response, fh(request, response));
}