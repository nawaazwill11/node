const Pool = require('pg').Pool; // pool connection instance

// creates a pool connection
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

// fetches drive authetication object from database
function getDriveCredentials(pool, callback) {
    pool
    .query("SELECT credentials->'installed' as installed FROM drive_credentials")
    .then(result => {
        console.log('Credentials acquired successfully');
        callback(null, result.rows[0]);
    })
    .catch (error => {
        callback(`Failed to acquire credentials\n${error}`);
    });
}

// gets drive access token from database
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
        callback(`Failed to fetch drive credentials from database\n${error}`);
    });
}

// inserts new auth token after deleting the previous one
function setAuthToken(pool, token, callback) {
    pool
    .query("UPDATE drive_credentials SET credentials = (credentials - 'token');") // delete token if present
    .then(() => {
        token = {
            token: token
        };
        pool.query('UPDATE drive_credentials SET credentials = credentials || $1', [JSON.stringify(token)]) // add new token
        .then(() => {
            console.log('access token set');
            callback(null);
        })
        .catch(error => {
            callback(`Failed to add token to database\n${error}`);
        });
    })
    .catch(error => {
        callback(`Failed to remove old token from database\n${error}`);
    });
}

// gets folder id from database
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
        callback(`Failed to fetch folder id from database\n${error}`);
    });
}

// inserts a new folder id after deleting the previous one
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
            console.log('Folder id saved to database for future use');
            callback();
        })
        .catch(error => {
            callback(`Failed to add folder id to database\n${error}`);
        });
    })
    .catch(error => {
        callback(`Failed to remove old folder id from database\n${error}`);
    })
}

// inserts new file object to database
function addFileRecord(pool, tags, file, callback) {
    let meta_string = {
        id: file.id,
        name: file.name,
        size: file.size,
        tags: tags,
        type: file.type
    };
    pool
    .query("INSERT INTO files(meta, thumbnail) VALUES($1, $2)", [JSON.stringify(meta_string), file.thumbnail])
    .then(() => {
        callback(null);
    })
    .catch(error => {
        callback(`Failed to insert new file record of file ${file.name} to database\n${error}`);
    })
}

// removes all records from files and tags table
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
        })
        .catch(error => {
            callback(`Failed to delete records from tags table\n${error}`);
        })
    })
    .catch(error => {
        callback(`Failed to delete records from files table\n${error}`);
    });
}

getPool()
.query('SELECT thumbnail from files where id=30')
.then(result => {
    console.log(result.rows);
})

module.exports = { getPool, getDriveCredentials, getAuthToken, setAuthToken, getFolderId, setFolderId, addFileRecord, emptyTagsFiles }; 