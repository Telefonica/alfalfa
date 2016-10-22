'use strict';

/**
 * This file is required to implement server resilence to late mongo startup.
 * Exposes a factory pattern to get the current mongodb connection from your code,
 * throwing a well known exception when mongo is not available yet, so you can return
 * a 503 ServiceUnavailable error to your clients
 * @example
 * ```js
 * const db = require('./db');
 * db().collection('cars').find(...);
 * ```
 */
const Therror = require('therror');

class DatabaseConnectionError extends Therror.ServerError.ServiceUnavailable {}

let database;

function getDatabase() {
  if (!database) {
    throw new DatabaseConnectionError('There is not any active connection to a database');
  }
  return database;
}

function setDatabase(db) {
  database = db;
  return database;
}

module.exports = getDatabase;
module.exports.setDatabase = setDatabase;
