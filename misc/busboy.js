const fs = require('fs'); // access file system
const fh = require('finalhandler'); // finalhandler instance
const Router = require('router'); // router class
const router = Router(); // router instance
const server = require('http').createServer(); // http server instance
const Busboy = require('busboy');
const PORT = 8080

server.on('request', function (request, response){
    console.log(request.url);
    router(request, response, fh(request, response));
});
server.listen(PORT);

// root
router.get('/', (request, response) => {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream('./index.html').pipe(response);
});
// css
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
// js
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
router.post('/upload', function (request, response) {
    upload(request, response);
});

function upload(request, response) {
    let busboy = new Busboy({headers: request.headers});
    let fields = [];
    let files = [];
    busboy.on('field', (fieldname, val) => {
        fields.push({
            fieldname: fieldname,
            value: val
        })
        console.log(`Fieldname: ${fieldname}\nValue: ${val}`);
    });
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        files.push({
            filename: filename,
            file: file,
        });
        file.pipe(fs.createWriteStream(`./uploads/${filename}`));
        console.log(`${filename} uploaded`);
    });
    busboy.on('finish', () => {

        response.writeHead(200);
        response.end(JSON.stringify(fields));
    });
    request.pipe(busboy);
}