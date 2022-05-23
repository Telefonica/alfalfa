import { Runner } from './index';
import { getLogger } from './logger';

/**
 * Startup for a service
 *
 * Starts all runners in serie and observes OS signals to stop the services in
 * the inverse order they were started
 *
 * @param serviceName your service name
 */
export const Startup = (serviceName?: string) => {
  let name = serviceName ?? 'Service';
  const runners: Array<[string, Runner]> = [];
  const logger = getLogger();

  const bootstrap = async (title?: string) => {
    name = title ?? name;
    process.title = name;

    process.once('SIGTERM', stopWith('SIGTERM')); // Sent by Docker, node-express-domaining and cluster management
    process.once('SIGINT', stopWith('SIGINT')); // Crtl-C, pm2
    process.once('SIGHUP', stopWith('SIGHUP')); // SIGHUP is generated on Windows when the console window is closed
    // process.on('SIGQUIT', stopWith('SIGQUIT')); // Should generate a dump
    process.once('SIGUSR2', stopWith('SIGUSR2')); // Sent by nodemon when restarts the server

    process.on('uncaughtException', fatal());
    process.on('unhandledRejection', fatal());
    process.on('warning', (warning: Error) => logger.warn(warning));

    try {
      await start();
      logger.info(`${name} ready`);
    } catch (err) {
      logger.fatal(err);
      process.exit(1);
    }
  };

  const use = (runner: Runner, name?: string) => {
    const componentName = name ?? runner.name ?? 'Component';
    runners.push([componentName, runner]);
  };

  const start = async () => {
    for (let [name, runner] of runners) {
      if (runner.start) {
        await runner.start();
        logger.info(`${name} ready`);
      }
    }
  };

  const stop = async () => {
    for (let [name, runner] of runners.reverse()) {
      if (runner.stop) {
        try {
          logger.info(`Stopping ${name}`);
          await runner.stop();
        } catch (err) {
          logger.error(err);
        }
      }
    }
  };

  const stopWith = (signal: string) => async () => {
    logger.warn(`Stopping ${name}. ${signal} received`);
    await stop();
    logger.info(`${name} stopped`);
    process.kill(process.pid, signal);
  };

  const fatal = () => async (err: any) => {
    logger.fatal(err);
    await stop();
    process.exit(1);
  };

  return {
    /** add a runner to the startup process */
    use,
    /** bootstrap the service, starting all runners and tracking OS signals */
    bootstrap,
  };
};
