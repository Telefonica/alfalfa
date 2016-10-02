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
import Therror, { Classes }  from 'therror';

import { Runner, logger } from './';
import { Errors } from './errors';

export interface ServiceRunnerOptions {
  /** The runners managed */
  runners: Runner<any>[];
}
/**
 * Composite pattern to group several runners as an unique One
 *
 * It will run the provided runnes in series, making easy to compose a linean startup process
 *
 * It's mainly used by {Startup} to bootstrap your service
 *
 * {@see https://en.wikipedia.org/wiki/Composite_pattern}
 */
export class ServiceRunner extends Runner<any[]> {
  protected runners: Runner<any>[];

  constructor(opt: ServiceRunnerOptions) {
    super('Service');
    this.runners = opt.runners;
  }

  /**
   * Starts all the provided runners in series. When one of them fails, rejects inmediately with the failed one
   *
   * Resolves with an array of the resources initialized, as resolved by each runner
   */
  protected doStart(): Promise<any[]> {
    let resolutions: any[] = [];
    let promise = Promise.resolve();
    for (let runner of this.runners) {
      promise = promise
        .then(() => runner.start())
        .then(resolved => {
          resolutions.push(resolved);
          return resolved;
        });
    }
    promise = promise.then(() => {
      return resolutions;
    });

    return promise;
  }

  /**
   * Stops the runners in the same order they were started.
   *
   * Any error in stopping one runner, will log the error trace, and continue with the next one
   */
  protected doStop(): Promise<any[]>{
    let resolutions: any[] = [];
    let errors: any[] = [];
    let promise = Promise.resolve();
    for (let runner of this.runners) {
       promise = promise
        .then(() => runner.stop())
        .then(resolved => {
          resolutions.push(resolved);
        })
        .catch(err => {
          errors.push(err);
        });
    }
    promise = promise.then(() => {
      if (errors.length === 0) {
        return resolutions;
      }

      throw new ServiceRunnerErrors.StopError({ errors });
    });

    return promise;
  }
}

export namespace ServiceRunnerErrors {

  /**
   * An error happend when trying to stop the service
   *
   * @operations
   * @severity info
   * @cause The server shutdown had an error
   * @solution Check the specific cause and try to fix it.
   */
  export class StopError extends Therror.WithMessage(
    'Stop Error'
  ) {}
}

Errors.ServiceRunner = ServiceRunnerErrors;
declare module './errors' {
  namespace Errors {
    export let ServiceRunner: typeof ServiceRunnerErrors;
  }
}
