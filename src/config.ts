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

import { Runner } from './';
import { Errors } from './errors';

/** A configuration service must have a `validate()` method that throws when the validation didn't succeed */
export interface Config {
  /**
   * Validates the configuration
   *
   * @throws {Error} when the configuration is not valid
   */
  validate(): any;
}

/**
 * Validates an app configuration. It merely be used as a pre-condition check to other runners or services
 */
export class ConfigRunner implements Runner<Config> {

  constructor(public config: Config) { }

  /**
   * Validates the configuration
   *
   * @throws {ConfigRunnerErrors.InvalidConfig}
   */
  start() {
    let config = this.config;
    return new Promise((resolve, reject) => {
        try {
          config.validate();
          resolve(config);
        } catch (err) {
          reject(new ConfigRunnerErrors.InvalidConfig(err));
        }
    });
  }

  /**
   * Just a resolver function as a configuration does not allocate any resource
   */
  stop() {
    // A configuration cannot be stopped
    return Promise.resolve(this.config);
  }
}

export namespace ConfigRunnerErrors {
  /**
   * The configuration is invalid
   *
   * @operations
   * @severity fatal
   * @cause The provided configuration is invalid
   * @solution Check the configuration. Is this correct?
   * Maybe there is a file you forgot to include, or one field has not the correct format
   * Check the error description for details
   */
  export class InvalidConfig extends Therror.WithMessage('Invalid configuration') {}
}
