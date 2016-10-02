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
import * as Bluebird from 'bluebird';

import { Runner } from './';
import { Errors } from './errors';

export interface Precondition<T> {
  () : T | PromiseLike<T>;
}
/** A configuration service must have a `validate()` method that throws when the validation didn't succeed */
export interface PreconRunnerConfig {
  preconditions: Precondition<any>[];
}

/**
 * Validates an app configuration. It merely be used as a pre-condition check to other runners or services
 */
export class PreconRunner extends Runner<void> {

  preconditions: Precondition<any>[] = [];

  constructor(opt: PreconRunnerConfig) {
    super('Precon');
    this.preconditions = opt.preconditions;
  }

  protected doStart(): Promise<void> {
    let promise = Promise.resolve();
    for (let precondition of this.preconditions) {
      promise = promise
        .then(() => Bluebird.try(precondition).then(() => { return; }))
        .catch(err => { throw new PreconRunnerErrors.UnmetPrecontition(err); });
    }

    return promise;
  }

  /**
   * Just a resolver function as a precondition does not allocate any resource
   */
  protected doStop(): Promise<void> {
    // A configuration cannot be stopped
    return Promise.resolve();
  }
}

export namespace PreconRunnerErrors {
  /**
   * The precondition is invalid
   *
   * @operations
   * @severity fatal
   * @cause A precondition check failed
   * @solution Check the error description for details
   */
  export class UnmetPrecontition extends Therror.WithMessage('Unmet precondition') {}
}

Errors.PreconRunner = PreconRunnerErrors;
declare module './errors' {
  namespace Errors {
    export let PreconRunner: typeof PreconRunnerErrors;
  }
}


