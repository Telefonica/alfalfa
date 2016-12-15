'use strict';

const alfalfa = require('alfalfa');
const server = require('./server');
const client = require('./mongoclient');
const httpAgent = require('./httpagent');
const config = require('./config');

let startup = new alfalfa.Startup();

startup.check(() => config.validate());

startup.use(new alfalfa.HTTPAgentRunner({
  name: 'KeepAlivedHTTPAgent',
  agent: httpAgent
}));

startup.use(new alfalfa.ServerRunner({
  name: 'MyServer',
  server,
  port: config.get('port')
}));

startup.use(new alfalfa.MongoRunner({
  client,
  uri: config.get('db')
}));

module.exports = startup;
