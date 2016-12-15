'use strict';

const http = require('http');

/** Create a KeepAlived agent to have always connected sockets */
var agent = new http.Agent({ keepAlive: true });

module.exports = agent;
