/**
 * The Express APP related code.
 *
 * Having this isolated in a file will allow us to require it in our tests
 * without bringing up a server
 */
import express from 'express';
import http from 'http';

const app = express();

app.get('/', (req, res, next) => {
  res.send('Hello!');
});

app.get('/slow', (req, res, next) => {
  let { delay } = req.query;
  delay = delay ? Number(delay) * 1000 : 5000;
  setTimeout(() => res.send(`Slow ${delay}`), delay);
});

app.get('/error', function(req, res) {
  process.nextTick(function() {
    throw new Error('BUM! This was not expected');
  });
});

export const server = http.createServer(app);
