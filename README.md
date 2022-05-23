![Alfalfa Logo][alfalfalogo]
# alfalfa [![npm version](https://badge.fury.io/js/alfalfa.svg)](http://badge.fury.io/js/alfalfa) ![Typescript](https://img.shields.io/badge/TypeScript-.ts-blue.svg)

*Opinionated startup for node applications. Get rid of boilerplate.*

> Alfalfa comes from Alpha. _Because this will become the very beginning of every Node.js service you create_

## Usage

```js
import alfalfa from 'alfalfa';
import express from 'express';
import http from 'http';

const app = express();

let app = express(); // use your favorite framework
let server = http.createServer(app); // your app will be exposed as an http server
let agent = new http.Agent({ keepAlive: true });

// Create a startup way to bring up your service
let startup = alfalfa.Startup();

// Check some preconditions before starting

// Configure the runners you want to use
startup.use(alfalfa.AgentRunner({ agent }));
startup.use(alfalfa.ServerRunner({ server, port: 3000 }));

startup.bootstap('Service'); // Yeah! Create the process with title 'Service'
```

What's is going on here? Alfalfa bootstraps your app by starting each one of the runners defined.
Each runner is a proven block that saves you from writing boilerplate and error-prone code again and again.
There are several runners available. More on this can be found in the [example folder](./example/).

Moreover, alfafa also prints traces for monitoring the startup, and manages the operating system
signals and unhandled exceptions/rejections/warnings.

```sh
node server.js

HTTPServer listening on http://0.0.0.0:3001
HTTPServer ready
MyService ready
<-- Crtl-C
Stopping MyService. SIGINT received
Stopping HTTPServer
Stopping HTTPAgent
MyService stopped
````

## Available Runners

### ServerRunner
Starts a node server in the specified port. Features:
 - Adds listeners to the server to print its lifecycle, allowing monitorization.
 - Adds support for a graceful shutdown, with a 9.5s grace period.

### AgentRunner
Tracks a KeepAlived [http.Agent](https://nodejs.org/api/http.html#http_new_agent_options). Features:
 - Destroys the keep alived sokets when the service shutdows

## LICENSE

Copyright 2022 [Telefónica I+D](http://www.tid.es)

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
