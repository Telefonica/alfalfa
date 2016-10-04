'use strict';

const alfalfa = require('../lib');
const server = require('./server');
const client = require('./mongoclient');
const config = require('./config');

let startup = new alfalfa.Startup();

startup.check(() => config.validate());

startup.use(new alfalfa.ServerRunner({
  server,
  port: config.get('port')
}));

startup.use(new alfalfa.MongoRunner({
  client,
  uri: config.get('db')
}));

module.exports = startup;
