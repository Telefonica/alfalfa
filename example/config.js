'use strict';

require('dotenv').config({ silent: true });
const convict = require('convict');
const validator = require('validator');

convict.addFormat({
    name: 'mongo-uri',
    validate: function(val) {
        if (!validator.isURL(val, {protocols: ['mongodb']})) {
            throw new Error('must be a MongoDB URI');
        }
    }
});


// convict is a module that enforces configuration
// in code, avoiding imperative definitions in config files
// and with validation incorporated
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
