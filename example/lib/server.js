'use strict';

const http = require('http');
const app = require('./app');

// Create your http server that you are exposing, and add the logic (express app in this example)
let server = http.createServer(app);

module.exports = server;
