'use strict';

// Resilent implementation for a
const Therror = require('therror');

module.exports = getDatabase;
module.exports.database = null;

function getDatabase() {
  if (!module.exports.database) {
    throw new Therror.ServerError.ServiceUnavailable('There is not any active connection to a database');
  }
  return module.exports.database;
}
