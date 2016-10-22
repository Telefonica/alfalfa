'use strict';

require('dotenv').config({ silent: true });
const convict = require('convict');
const Joi = require('joi');

convict.addFormat({
  name: 'mongo-uri',
  validate: function(url) {
    Joi.assert(url, Joi.string().uri({
      scheme: ['mongodb']
    }));
  }
});

// convict is a module that enforces configuration
// in code, avoiding imperative definitions in config files
// and with validation incorporated
// Unifies in your code different ways of configuring your app
// so one configuration parameter can come from file as `port`,
// from command line as `server-port` or from `environment` vars
// as `ALFALFA_PORT`, but you always will use in your code `config.get('port')`
let config = convict({
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 3000,
    arg: 'port',
    env: 'ALFALFA_PORT'
  },
  db: {
    doc: 'The mongo URL',
    format: 'mongo-uri',
    default: 'mongodb://localhost:27017/alfalfa',
    arg: 'db-uri',
    env: 'ALFALFA_DB'
  }
});

module.exports = config;
