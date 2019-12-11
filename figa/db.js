const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'admin',
    host: '127.0.0.1',
    database: 'figa',
    password: '00009658',
    port: 5432,
  });

function getDriveCredentials(callback) {
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

function getAuthToken(callback) {
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

function setAuthToken(token, callback) {
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

// pool
// .query("SELECT credentials FROM drive_credentials")
// .then(result => {
//     console.log(result.rows[0]);
// });

module.exports = { getDriveCredentials, getAuthToken, setAuthToken };