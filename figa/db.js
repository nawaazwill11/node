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
    .query('SELECT credentials FROM drive_credentials where id=1;')
    .then(result => {
        console.log(result.rows[0].credentials);
        callback(null, result.rows[0].credentials);
    })
    .catch (error => {
        callback(error);
    });
}

function getAuthToken(callback) {
    console.log('getting auth token');
    pool
    .query('SELECT credentials FROM drive_credentials where id=2;')
    .then(result => {
        if (result.rows.length > 1){
            console.log('found access token');
            callback(null, result.rows[1]);
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
    .query('INSERT INTO drive_credentials(credentials) VALUES ($1)', [JSON.stringify(token)])
    .then(() => {
        console.log('access token set');
        callback();
    })
    .catch(error => {
        console.log(error);
    });
}

module.exports = { getDriveCredentials, getAuthToken, setAuthToken };