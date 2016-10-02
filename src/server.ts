/**
 * @license
 * Copyright 2016 Telefónica I+D
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import enableTerminate from 'server-terminate';
import { Server } from 'http';
import Therror, { Classes }  from 'therror';

import { Runner, logger } from './';
import { Errors } from './errors';

export interface ServerRunnerOptions {
  /** The http(s) server to run */
  server: Server;
  /** The port (or path) the server will listen to */
  port?: number | string;
}

/**
 * Runs a node server in the specified port. Features:
 * - adds listeners to the server to print the server lifecycle, allowing monitorization
 * - adds support for a graceful shutdown, with a 10s grace period
 */
export class ServerRunner extends Runner<Server> {
  server: Server;
  port: number | string;

  constructor(opt: ServerRunnerOptions) {
    super('Server');
    this.server = opt.server;
    this.port = opt.port;

    enableTerminate(this.server);
  }

  /**
   * Start a server at the specified port
   *
   * @throws {ServerRunnerErrors.AddressInUse}
   * @throws {ServerRunnerErrors.PermissionDenied}
   * @throws {ServerRunnerErrors.ServerError}
   */
  protected doStart(): Promise<Server> {
    return new Promise((resolve, reject) => {
      let server = this.server;
      let port = this.port;

      this.server.on('error', onServerError);
      this.server.once('listening', onServerListening);

      server.listen(port);

      ///////

      function onServerError(err: any) {
        if (err.code === 'EADDRINUSE') {
          reject(new ServerRunnerErrors.AddressInUse(err));
        } else if (err.code === 'EACCES') {
          reject(new ServerRunnerErrors.PermissionDenied(err, { port }));
        } else {
          reject(new ServerRunnerErrors.ServerError(err));
        }
      }

      function onServerListening() {
        server.removeListener('error', onServerError);
        resolve(server);
      }
    });
  }

  /**
   * Gracefully stops the server
   *
   * @throws {ServerRunnerErrors.CloseError}
   */
  protected doStop(): Promise<Server> {
    let server = this.server;
    return new Promise((resolve, reject) => {
      if (!server.listening) {
        return resolve(server);
      }

      server.terminate(function(err, byTimeout) {
        if (err) {
          return reject(new ServerRunnerErrors.CloseError(err,
            'Unable to close the server'
          ));
        }
        if (byTimeout) {
          return reject(new ServerRunnerErrors.CloseError(
            'The server stopped after timeout: Some connections were forced to end.'
          ));
        }
        resolve(server);
      });
    });
  }

  public info() {
    return this.server.address();
  }
}

/**
 * The errors thrown by this runner
 */
export namespace ServerRunnerErrors {
  /**
   * The port where the server must listen is in use
   *
   * The server listens on a port. That port is in use by another process
   *
   * @operations
   * @severity fatal
   * @cause The port where the server must listen is in use
   * @solution Check the configuration for the desired port. Is this correct?
   * Maybe you have started a server before and you have not killed it, or
   * is doing a shutdown. Find the process, and kill it before starting a
   * new one. There is another server running on this port? In that case, review how
   * you must deploy the whole services in your infrastructure
   */
  export class AddressInUse extends Therror.WithMessage(
     'The network address where the server should be listening is in use'
  ) {}
  /**
   * Permission denied while listening on port
   *
   * The server listens on a port. That port wants more privileges, usually sudo (bad idea)
   *
   * @operations
   * @severity fatal
   * @cause The port where the server must listen need privileged access
   * @solution Check the configuration for the desired port. Is this correct?
   * Maybe you need to start the server as root or sudoed user
   */
  export class PermissionDenied extends Therror.WithMessage(
     'Permission denied while opening server at \'${port}\''
  ) {}

  /**
   * A server error occurred
   *
   * The server had an error and will close and stop handling requests
   *
   * @operations
   * @severity fatal
   * @cause The server had an error. Check details in the error message
   * @solution Check the specific cause and try to fix it.
   */
  export class ServerError extends Therror.WithMessage('Server Error') {}

  /**
   * An error happend when trying to close the server
   *
   * @operations
   * @severity info
   * @cause The server had an error. Check details in the error message
   * @solution Check the specific cause and try to fix it.
   */
  export class CloseError extends Therror {}
}

Errors.ServerRunner = ServerRunnerErrors;
declare module './errors' {
  namespace Errors {
    export let ServerRunner: typeof ServerRunnerErrors;
  }
}
