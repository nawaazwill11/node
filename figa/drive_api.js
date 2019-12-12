const fs = require('fs');
const Busboy = require('busboy');
const readline = require('readline');
const { google } = require('googleapis');
const db = require('./db');
const pool = db.getPool();

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
];

const callback = {
    upload: uploadFiles,
    download: downloadFiles,
    list: listFiles,
    search: searchFiles 
};

function initiateAuthorization(callback) {
    console.log('init authentication');
    let initAuth = function (error, credentials) {
        if (error) return callback(error);
        authorize(credentials, callback);
    }
    db.getDriveCredentials(pool, initAuth);
}

function authorize(credentials, callback) {
    console.log('authorizing');
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    
    const cb = function (error, token) {
        if (error) return callback(error);
        if (!token) {
            console.log('creating new token');
            getAccessToken(oAuth2Client, callback)
        }
        else {
            oAuth2Client.setCredentials(token);
            callback(null, oAuth2Client);
        }
    }
    db.getAuthToken(pool, cb);
}

function getAccessToken(oAuth2Client, callback) {
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
            if (error) return callback('Error retrieving access token :' + error);
            oAuth2Client.setCredentials(token);

            let cb = function (error) {
                if (error) return callback(error);
                callback(null, oAuth2Client);
            }
            db.setAuthToken(pool, token, cb);

            // fs.writeFile(TOKEN_PATH, JSON.stringify(token), (error) => {
            //     if (error) return console.error(error);
            //     console.log('Token stored to ', TOKEN_PATH);
            // });
            
        });
    });
}



function searchFiles(auth) {
    // code to be
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

function uploadFiles(auth, parent, file, callback) {
    console.log('uploading files');
    const drive = google.drive({version: 'v3', auth});
    let fileMetaData = {
        'name': file.name,
        parents: [parent]
    };
    let media = {
        mimetype: file.type,
        body: file.stream
    }
    drive.files.create({
        resource: fileMetaData,
        media: media,
        fields: 'id' 
    }, function (error, file) {
        if (error) return callback('Could not upload file, ' + error);
        console.log('File uploaded with id: ', file.data);
        callback(null, file.data);
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

function getFolder(auth, foldername, callback) {
    console.log('Getting folder');
    db.getFolderId(pool, function (error, folder_id) {
        if (error) return callback(error);
        console.log('Folder found in database');
        const drive = google.drive({ version: 'v3', auth });
        drive.files.list({
            q: `mimeType = 'application/vnd.google-apps.folder' and name='${foldername}' and trashed=false`,
            fields: 'files(id)',
            spaces: 'drive'
        }, function (error, response) {
            if (error) {
                console.log(error);
                callback(error);
            } else {
                let folder = response.data.files;
                if (folder.length > 0) {
                    drive_folder_id = folder[folder.length - 1].id
                    console.log('Folder found on drive');
                    if (drive_folder_id === folder_id) {
                        console.log('Folders match, uploading in same folder');
                        callback(null, folder_id);
                    }
                    else {
                        console.log('Folders dont match');
                        db.emptyTagsFiles(null, function (error) {
                            makeFolder(auth, foldername, callback, drive);
                        });
                    }
                }
                else {
                    console.log('No folder found in db');
                    makeFolder(auth, foldername, callback, drive);
                }
            }
        }); 
    });
}

function makeFolder(auth, foldername, callback, drv) {
    console.log('Making folder');
    const drive = drv || google.drive({ version: 'v3', auth });
    let fileMetaData = {
        'name': foldername,
        'mimeType': 'application/vnd.google-apps.folder'
    }
    drive.files.create({
        resource: fileMetaData,
        fields: 'id'
    }, function (error, file) {
        if (error) return callback(error);
        console.log('Folder made');
        db.setFolderId(pool, file.data.id, function (error) {
            if (error) return callback(error);
            callback(null, file.data.id);   
        })
    });
}

// initiateAuthorization(function (error, auth) {
//     if (error) return console.log(error);
//     makeFolder(auth, 'figa', function (error, data) {
//         if (error) return console.log(error);
//         console.log(data);
//     });
// })


// initiateAuthorization(function (error, auth) {
//     if (error) return console.log(error);
//     getFolder(auth, 'figa', function (error, data) {
//         if (error) return console.log(error);
//         console.log(data);
//     });
// })

module.exports = { initiateAuthorization, uploadFiles, getFolder };