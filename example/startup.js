'use strict';

const alfalfa = require('../lib');
const server = require('./server');
const config = require('./config');

let startup = new alfalfa.Startup();

startup.use(new alfalfa.ConfigRunner(config));

startup.use(new alfalfa.ServerRunner({
  server: server,
  port: config.get('port')
}));

module.exports = startup;
