'use strict';

const dotenv = require('dotenv');
dotenv.config();
const route = require('./route');
const server = require('http').createServer();

server.on('request', function (request, response){
    route(request, response);
});
server.listen(process.env.PORT);
console.log(process.env.PORT);