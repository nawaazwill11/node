const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'admin',
    host: '127.0.0.1',
    database: 'figa',
    password: '00009658',
    port: 5432,
  })
let file_obj = {
    name: 'arrow.svg',
    type: 'image/svg+xml',
    size: '4040',
    tags: ['svg', 'figa']
}
pool
    
    // client.query('INSERT INTO files (meta) VALUES ($1)', [file_obj], (error, result) => {
    //     if (error) throw error;
    //     console.log(result);
    // });
    .query('SELECT files.meta FROM files')
    .then (result => {
        console.log(result.rows);
    })
    .catch (error => {
        console.error(error);
    });

pool.end();