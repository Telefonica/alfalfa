'use strict';

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

function getMongoVersion() {
  return db().admin().buildInfo()
    .then(info => info.version)
    .catch(err => {
      throw new Therror.ServerError.ServiceUnavailable(err, 'Mongo Error');
    });
}

app.use(therrorHandler());

module.exports = app;
