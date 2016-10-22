'use strict';

/**
 * Mongo initialization code
 */
const MongoClient = require('mongodb').MongoClient;
const db = require('./db');

let connect = MongoClient.connect;

MongoClient.connect = function() {
  return connect.apply(this, arguments)
    // after connected, let out app know which is the connected database it should use
    .then(database => db.setDatabase(database));
}

module.exports = MongoClient;
