'use strict';

const express = require('express');
const logger = require('logops');
const therror = require('therror');
const therrorHandler = require('therror-connect');
const db = require('./db');

therror.Loggable.logger = logger;

let app = express();

app.get('/', function(req, res) {
  db();
  res.send('Hello World!');
});

app.get('/slow', function(req, res) {
  db();
  setTimeout(function() {
    res.send('Hello Slow World!');
  }, 5000);
});

app.get('/error', function(req, res) {
  process.nextTick(function() {
    throw new Error('BUM! This was not expected');
  });
});

app.use(therrorHandler());

module.exports = app;
