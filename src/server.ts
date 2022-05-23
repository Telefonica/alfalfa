import enableTerminate from 'server-terminate';
import { Server } from 'http';

import { Runner } from './index';
import { getLogger } from './logger';

interface ServerComponentOptions {
  /** The http(s) server to run */
  server: Server;
  /** The port (or path) the server will listen to.*/
  port?: number | string;
}

/**
 * Starts a server with graceful shutdown
 *
 * @param options
 */
export const ServerRunner = (options: ServerComponentOptions): Runner => {
  const name = 'HTTPServer';
  const { server, port } = options;
  const logger = getLogger();

  // Docker will kill the container by default in 10s
  // Give some time to log things before exiting
  enableTerminate(server, { timeout: 9500 });

  const start = () =>
    new Promise<void>((resolve, reject) => {
      const onServerError = (err: any) => {
        reject(err);
      };

      const onServerListening = () => {
        server.removeListener('error', onServerError);
        logger.info(`${name} listening on http://0.0.0.0${port ? ':' + port : ''}`);
        resolve();
      };

      server.on('error', onServerError);
      server.once('listening', onServerListening);

      server.listen(port);
    });

  const stop = () =>
    new Promise<void>((resolve, reject) => {
      if (!server.listening) {
        return resolve();
      }

      server.terminate((err, byTimeout) => {
        if (err) {
          return reject(err);
        }
        if (byTimeout) {
          return reject(new Error(`The server stopped after timeout: Some connections were forced to end.`));
        }

        resolve();
      });
    });
  return {
    name,
    start,
    stop,
  };
};
