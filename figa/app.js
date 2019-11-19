'use strict';

const dotenv = require('dotenv'); // environment variable access instance
dotenv.config(); // loading env variables
const route = require('./route'); // process incoming route requests
const server = require('http').createServer(); // http server handler

server.on('request', function (request, response){
    route(request, response);
});
server.listen(process.env.PORT);

console.log(process.env.PORT);