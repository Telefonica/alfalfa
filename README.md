![Alfalfa Logo][alfalfalogo]
# alfalfa [![npm version](https://badge.fury.io/js/alfalfa.svg)](http://badge.fury.io/js/alfalfa) ![Typescript](https://img.shields.io/badge/TypeScript-.ts-blue.svg)

*Opinionated startup for node applications. Get rid of boilerplate.*

> Alfalfa comes from Alpha. _Because this will become the very beginning of every Node.js service you create_

## Usage

```js
const express = require('express');
const http = require('http');
const alfalfa = require('alfalfa');

const config = require('./config');

let app = express(); // use your favorite framework
let server = http.createServer(app); // your app will be exposed as an http server

// Create a startup way to bring up your service
let startup = new alfalfa.Startup();

// Configure the runners you want to use
startup.use(new alfalfa.ConfigRunner(config));
startup.use(new alfalfa.ServerRunner({ server, port: 3000 }));

startup.bootstap(); // Yeah!
```

What's is going on here? Alfalfa bootstraps your app by starting each one of the runners defined. Each runner is a proven block that saves you from writing boilerplate and error-prone code again and again. There are several runners available. More on this can be found in the [example folder](example/).

Moreover, alfafa also prints traces for monitoring the startup, and manages the operating system signals and unhandled exceptions/rejections.


```sh
node server.js

INFO  Server listening { address: '::', family: 'IPv6', port: 3000 }
INFO  Service ready
^Crtl-C
WARN  Stopping service
INFO  Ordered shutdown
INFO  Server closed
````

## Available Runners

### ServerRunner
Runs a node server in the specified port. Features:
 - Adds listeners to the server to print the server lifecycle, allowing monitorization.
 - Adds support for a graceful shutdown, with a 10s grace period.

### ConfigRunner
Takes care of the app configuration. Features:
- Validates that the configuration is valid. It merely be used as a pre-condition check to other runners.
- The configuration module must have a `validate()` method that throws when the validation didn't succeed

### MongoRunner
Comming soon. Will take care of the database connection.

## LICENSE

Copyright 2016 [Telefónica I+D](http://www.tid.es)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[alfalfalogo]: art/alfalfa-githubbanner.png
