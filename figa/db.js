const Pool = require('pg').Pool;

function getPool (callback) {
    const pool = new Pool({
        user: 'admin',
        host: '127.0.0.1',
        database: 'figa',
        password: '00009658',
        port: 5432,
    });
    if (callback) {
        callback(pool)
    }
    return pool;
}

function getDriveCredentials(pool, callback) {
    pool
    .query("SELECT credentials->'installed' as installed FROM drive_credentials")
    .then(result => {
        console.log('Credentials acquired successfully');
        callback(null, result.rows[0]);
    })
    .catch (error => {
        console.log('Failed to acquire credentials');
        callback(error);
    });
}

function getAuthToken(pool, callback) {
    console.log('getting auth token');
    pool
    .query("SELECT credentials->'token' as token FROM drive_credentials;")
    .then(result => {
        if (result.rows.length > 0){
            console.log('found access token');
            callback(null, result.rows[0].token);
        }
        else {
            console.log('no access token found');
            callback(null, false);
        }
    })
    .catch (error => {
        callback(error);
    });
}

function setAuthToken(pool, token, callback) {
    pool
    .query("UPDATE drive_credentials SET credentials = (credentials - 'token');") // delete token if present
    .then(() => {
        token = {
            token: token
        }
        pool.query('UPDATE drive_credentials SET credentials = credentials || $1', [JSON.stringify(token)]) // add new token
        .then(() => {
            console.log('access token set');
            callback(null);
        })
        .catch(error => {
            console.log(error);
            callback(error);
        });
    })
    .catch(error => {
        console.log(error);
        callback(error);
    });
}

function getFolderId(pool, callback) {
    pool
    .query("SELECT credentials->'folder' as folder FROM drive_credentials")
    .then(result => {
        if (result.rows.length > 0){
            console.log(result.rows[0].folder.id);
            callback(null, result.rows[0].folder.id);
        }
        else {
            console.log('returning empty');
            callback(null, null);
            
        }
    })
    .catch(error => {
        callback(error);
    });
}

function setFolderId(pool, folder_id, callback) {
    let folder = {
        folder: {
            id: folder_id
        }
    }
    pool
    .query("UPDATE drive_credentials SET credentials = (credentials - 'folder')")
    .then(() => {
        pool
        .query("UPDATE drive_credentials SET credentials = credentials || $1", [JSON.stringify(folder)])
        .then(() => {
            callback();
        })
        .catch(error => {
            callback(error);
        });
    })
    .catch(error => {
        callback(error);
    })
}

function addFileRecord(pool, tags, file, callback) {
    let meta_string = {
        id: file.id,
        name: file.name,
        size: file.size,
        tags: tags,
        type: file.type
    };
    pool
    .query("INSERT INTO files(meta) VALUES($1)", [JSON.stringify(meta_string)])
    .then(() => {
        callback(null);
    })
    .catch(error => {
        callback(error);
    })
}

function emptyTagsFiles(pl, callback) {
    const pool = pl || getPool();
    pool
    .query('DELETE FROM files')
    .then(() => {
        console.log('All records removed from files table');
        pool
        .query('DELETE from tags')
        .then(() => {
            console.log('All records removed from tags table');
            callback();
        });
    });
}

module.exports = { getPool, getDriveCredentials, getAuthToken, setAuthToken, getFolderId, setFolderId, addFileRecord, emptyTagsFiles };