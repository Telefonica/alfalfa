'use strict';

require('dotenv').config({ silent: true });
const convict = require('convict');

// convict is a module that enforces configuration
// in code, avoiding imperative definitions in config files
// and with validation incorporated
let config = convict({
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 3000,
    arg: 'port',
    env: 'PORT'
  }
});

module.exports = config;
