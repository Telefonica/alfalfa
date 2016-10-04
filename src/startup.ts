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
import { Runner, logger } from './';
import { ServiceRunner } from './service';
import { PreconditionRunner, Precondition } from './precondition';

/**
 * A Startup manages all the `process` relative stuff, and bootstap your service using some {Runner}
 *
 * It will log traces with the lifecycle in order to add monitorization
 *
 * Features:
 *  - Listen to SIGTERM and SIGINT signals to stop resources
 *  - manages uncaughtExceptions to stop resources and exiting (yes, exiting!)
 *  - logs unhandledRejection to identify potentially broken promise management
 *
 * It will exit the process with 3 exitCodes:
 *  - `0`: the process exit normally
 *  - `1`: the process could not freed all resources when trying to stop
 *  - `2`: the process had an unhandled exception
 */
export class Startup {
  runners: Runner<any>[] = [];
  preconditions: Precondition<any>[] = [];

  /**
   * Adds a precondition check
   */
  check(fn: Precondition<any>) {
    this.preconditions.push(fn);
    return this;
  }

  /**
   * adds a {Runner} to the startup process
   */
  use(runner: Runner<any>) {

    runner.on('started', (value: any, runner: Runner<any>) => {
      let info = runner.info();
      info ?
        logger.info(info, `${runner.name} ready`) :
        logger.info(`${runner.name} ready`);
    });
    runner.on('stopped', (value: any, runner: Runner<any>) => logger.info(`${runner.name} stopped`));

    this.runners.push(runner);
    return this;
  }

  /**
   * Bootstrap the service: start all runners and track for OS signals to stop it
   *
   * @param {string} [title] The process title to be set
   */
  bootstrap(title?: string) {
    if (title) {
      process.title = title;
    }

    let preconRunner = new PreconditionRunner({ preconditions: this.preconditions });
    this.runners.unshift(preconRunner);

    let serviceRunner = new ServiceRunner({ runners: this.runners });
    serviceRunner.on('started', (value: any, runner: Runner<any>) => logger.info(`${runner.name} ready`));
    serviceRunner.on('stopping', (runner: Runner<any>) => logger.warn(`Stopping ${runner.name}`));
    serviceRunner.on('stopped', (value: any, runner: Runner<any>) => logger.info(`${runner.name} stopped`));

    process.on('SIGTERM', stop);
    process.on('SIGINT', stop); // Crtl-C
    // process.on('SIGQUIT', stop);
    // process.on('SIGHUP', stop);
    process.on('uncaughtException', (err: any) => {
      logger.fatal(err, 'UncaughtException');
      serviceRunner.stop()
        .then(null, err => logger.error(err))
        .then(() => process.exit(2));
    });
    process.on('unhandledRejection', (err: any) => {
      logger.warn(err, 'UnhandledRejection');
    });

    return start();

    /////////

    function start() {
      return serviceRunner.start()
          .catch(fail);
    }

    function stop() {
      return serviceRunner.stop()
          .then(success)
          .catch(fail);
    }

    function success() {
      process.exit(0);
    }

    function fail(err: any) {
      logger.fatal(err);
      process.exit(1);
    }
  }
}
