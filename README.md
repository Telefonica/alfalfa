![Alfalfa Logo][alfalfalogo]
# alfalfa

*Opinionated startup for node services and applications to remove plumbing and boilerplate*

Alfalfa = Alphalpha = AlphAlphA = Alpha Alpha = 2*Alpha
_Because this will become the very beginning of every Node.js service you create_

[![npm version](https://badge.fury.io/js/therror.svg)](http://badge.fury.io/js/therror)
![Typescript](https://img.shields.io/badge/TypeScript-.ts-blue.svg)

## Usage
```js
const express = require('express');
const http = require('http');
const alfalfa = require('alfalfa');

let app = express(); // or any other fw... just an example
let server = http.createServer(app); // your app will be exposed as an http server

// Create a startup way to bring up your service
let startup = new alfalfa.Startup(); 

// Our service has to run a Server....
startup.use(new alfalfa.ServerRunner({
  server: server, // tell the server
  port: 3000 // in the bort
}));

startup.bootstap(); // Yeah! 
```

```sh
node server.js 
# --> INFO  Server listening { address: '::', family: 'IPv6', port: 3000 }                                                                                                                                  
# --> INFO  Service ready                                                                                                                                                                                   
# <-- Crtl-C
# --> WARN  Stopping service                                                                                                                                                                              
# --> INFO  Ordered shutdown                                                                                                                                                                                
# --> INFO  Server closed 
```

What's is going on there? Alfalfa will bootstrap your service by starting each one of the steps defined.
Each step (that _****Runner_ thing) configures itself, and when it becomes ready, the next step will be started.
Alfafa also prints traces for monitoring the startup, and manages the Operating System signals and unhandled exceptions/rejections

Think this way: I've a simple service: An HTTP server 
When staring my service in a resilent fail-fast way, these are my preconditions
* Ensure I have a valid configuration (<- a `Runner`)
* Start the HTTP Server to accept incoming connections (<- a `Runner`)

And when I want to stop the service, this are my postconditions:
* Stop accepting new connections and wait util current request are resolved

_That is managed by Runners_

Related to the process lifecicle, this is the current behaviour:
* Listen to signals to stop the service
* Caught unhandled exceptions (or rejections) and stop the service
* Add names to the process for identifying in the PIDs stacks

_That is managed by Startup_

How to express this in `alfalfa` ?
```js
const alfalfa = require('../lib');
const server = require('./server');
const config = require('./config');

let startup = new alfalfa.Startup();

startup.use(new alfalfa.ConfigRunner(config));

startup.use(new alfalfa.ServerRunner({
  server: server,
  port: config.get('port')
}));

startup.bootstrap();
```

More on this can be found in the [example directory](example/)

### Runners

#### ServerRunner
Runs a node server in the specified port. Features:
 - adds listeners to the server to print the server lifecycle, allowing monitorization
 - adds support for a graceful shutdown, with a 10s grace period

#### ConfigRunner
Validates a service configuration. It merely be used as a pre-condition check to other runners.
The configuration module must have a `validate()` method that throws when the validation didn't succeed

__COMMING SOON__
`MongoRunner`


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