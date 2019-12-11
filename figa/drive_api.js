const fs = require('fs');
const Busboy = require('busboy');
const readline = require('readline');
const { google } = require('googleapis');
const db = require('./db');

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
];

const TOKEN_PATH = 'token.json';
const callback = {
    upload: uploadFiles,
    download: downloadFiles,
    list: listFiles,
    search: searchFiles 
};

function inititalUpload(operation, file, root_callback) {
    console.log('init upload');
    let initAuth = function (error, credentials) {
        if (error) return root_callback(error);
        let resource = {
            callback: callback[operation],
            file: file,
            root_callback: root_callback
        }
        authorize(credentials, resource);
    }
    db.getDriveCredentials(initAuth);
}

function authorize(credentials, resource) {
    console.log('authorizing');
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    
    const callback = function (error, token) {
        if (error) return resource.root_callback(error);
        if (!token) {
            console.log('calling getaccesstoken');
            getAccessToken(oAuth2Client, resource)
        }
        oAuth2Client.setCredentials(token);
        resource.callback(oAuth2Client, resource);
    }
    console.log('...');
    db.getAuthToken(callback);

    // fs.readFile(TOKEN_PATH, (error, token) => {
    //     if (error) return getAccessToken(oAuth2Client, callback);
    //     oAuth2Client.setCredentials(JSON.parse(token));
    //     callback(oAuth2Client);
    // });
}

function getAccessToken(oAuth2Client, resource) {
    console.log('getting access token');
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from the page here:', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (error, token) => {
            if (error) return console.error('Error retrieving access token', error);
            oAuth2Client.setCredentials(token);

            let callback = function () {
                resource.callback(oAuth2Client, resource);
            }
            db.setAuthToken(token, callback);

            // fs.writeFile(TOKEN_PATH, JSON.stringify(token), (error) => {
            //     if (error) return console.error(error);
            //     console.log('Token stored to ', TOKEN_PATH);
            // });
            
        });
    });
}

function searchFiles(auth) {
    
}

function downloadFiles(auth) {
    const drive = google.drive({version: 'v3', auth});
    let fileId = '1KP4aE4u8EXx3XHcWHgiPWRt8YA4OE8H1';
    let downloadDir = './downloads';
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }
    let dest = fs.createWriteStream(`./${downloadDir}/eye.svg`);
    drive.files.get(
        { fileId: fileId, alt: 'media' }, { responseType: 'stream' }, 
        function (error, res) {
            if (error) return console.error(error);
            res.data
                .on('end', function () {
                    console.log('Done');
                })
                .on('error', function (err) {
                console.log('Error during download', err);
                })
                .pipe(dest);
        }
    );
}

function uploadFiles(auth, resource) {
    console.log('uploading files');
    const drive = google.drive({version: 'v3', auth});
    let fileMetaData = {
        'name': resource.file.name
    };
    let media = {
        mimetype: resource.file.type,
        body: resource.file.stream
    }
    drive.files.create({
        resource: fileMetaData,
        media: media,
        fields: 'id' 
    }, function (error, file) {
        if (error) return resource.root_callback('Could not upload file, ' + error);
        console.log('File uploaded with id: ', file.data.id);
        resource.root_callback(null, file.data);
    });
}

function listFiles(auth) {
    const drive = google.drive({version: 'v3', auth});
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)'
    }, (error, res) => {
        if (error) return console.error('The API returned an error: ' + error);
        const files = res.data.files;
        if (files.length) {
            console.log('Files: ');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    });
}

function redirect(response, html) {
    response.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream(html).pipe(response);
}

function test(request, response, html) {
    console.log(request.url);
    const busboy = new Busboy({headers: request.headers});
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        try {
            console.log(encoding);
            console.log(mimetype);
            console.log(file);
            file.pipe(fs.createWriteStream('./uploads/' + filename));
        }
        catch (e) {
            console.log(e);
        }
        finally {
            redirect(response, html);
        }
    }); 
    request.pipe(busboy);
}

module.exports = inititalUpload