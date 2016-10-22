'use strict';

/**
 * The Express APP related code.
 *
 * Having this isolated in a file will allow us to require it in our tests
 * without bringing up a server
 */
const express = require('express');
const logger = require('logops');
const Therror = require('therror');
const therrorHandler = require('therror-connect');
const db = require('./db');

Therror.Loggable.logger = logger;

let app = express();

app.get('/', function(req, res, next) {
  getMongoVersion()
    .then(version => res.send(`Conected to mongo v${version}`))
    .catch(next);
});

app.get('/slow', function(req, res, next) {
  getMongoVersion()
  .then(version =>  setTimeout(() => res.send(`Conected to mongo v${version}`), 5000))
  .catch(next);
});

app.get('/error', function(req, res) {
  process.nextTick(function() {
    throw new Error('BUM! This was not expected');
  });
});

app.use((function(err, req, res, next) {
  if (err.name === 'MongoError') {
    return next(new Therror.ServerError.ServiceUnavailable(err, 'Mongo Error'));
  }
  next(err);
}));

app.use(therrorHandler());

function getMongoVersion() {
  return db().admin().buildInfo()
    .then(info => info.version);
}

module.exports = app;
