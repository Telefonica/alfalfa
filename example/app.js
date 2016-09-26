'use strict';

const express = require('express');

let app = express();

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/slow', function(req, res) {
  setTimeout(function() {
    res.send('Hello Slow World!');
  }, 5000);
});

app.get('/error', function(req, res) {
  process.nextTick(function() {
    throw new Error('BUM! This was not expected');
  });
});

module.exports = app;
