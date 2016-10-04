'use strict';

const MongoClient = require('mongodb').MongoClient;
const db = require('./db');

let connect = MongoClient.connect;

MongoClient.connect = function() {
  return connect.apply(this, arguments)
    .then(database => db.database = database);
}

module.exports = MongoClient;
