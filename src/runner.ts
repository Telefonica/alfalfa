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

import { EventEmitter } from 'events';

/**
 * Step to bootstrap your application
 *
 * It's in charge of executing and allocating resources and stablish preconditions
 * for running
 *
 * The Runners will add log traces using {logger} to allow monitorization of the lifecycle
 */
export interface Runner<T> {
  /**
   * The optional name for this Runner
   */
  name: string;
  /**
   * Starts a resource, resolving to the initialized resource ready for usage, meeting
   * all post conditions.
   *
   * Rejecting with an error means that the resource couldn't be initialized
   */
  start(): Promise<T>;
  /**
   * Tears down a resource, resolving to the resource with all the uderliying dependencies freed
   *
   * Rejecting with an error means that the resource couldn't be freed at all
   */
  stop(): Promise<T>;
}

export abstract class Runner<T> extends EventEmitter implements Runner<T> {
  constructor(public name: string) {
    super();
  }

  protected abstract doStart(): Promise<T>
  protected abstract doStop(): Promise<T>

  public info(): any { ; };

  public start(): Promise<T> {
    this.emit('starting', this);
    return this.doStart()
      .then((value) => {
        this.emit('started', value, this, this.info());
        return value;
      })
      .catch((err) => {
        this.emit('error', err, this);
        throw err;
      }) ;
  }

  public stop(): Promise<T> {
    this.emit('stopping', this);
    return this.doStop()
      .then((value) => {
        this.emit('stopped', value, this, this.info());
        return value;
      })
      .catch((err) => {
        this.emit('error', err, this);
        throw err;
      });
  }
}