'use strict';

const MongoClient = require('mongodb').MongoClient;
const config = require('./config');

const client = new MongoClient(config.get('db'));

module.exports = client;
