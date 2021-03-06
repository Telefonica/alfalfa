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
import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import * as retryPromise from 'bluebird-retry';

export interface MongoRunnerOptions {
  name?: string;
  client: MongoClient;
  options?: Pick<MongoClientOptions, 'reconnectTries' | 'reconnectInterval'>;
}

export class MongoRunner extends Runner<Db>  {
  client: MongoClient;
  uri: string;
  options: MongoClientOptions;

  private db: Db;

  constructor(opt: MongoRunnerOptions) {
    super(opt.name || 'MongoDB');
    this.client = opt.client;

    this.options = {};


    this.options.reconnectTries = this.options.reconnectTries == null ?
      30 : // Number of retries
      this.options.reconnectTries;

    this.options.reconnectInterval = this.options.reconnectInterval == null ?
      1000 : // Time between retries
      this.options.reconnectInterval;
  }

  protected doStart(): Promise<Db> {

    return retryPromise<Db>(() => this.connect(), {
      interval: this.options.reconnectInterval,
      max_tries: this.options.reconnectTries
    })
    .then(db => {
      this.db = db;
      this.db.on('close', this.onDatabaseClose);
      this.db.on('reconnect', this.onDatabaseReconnect);
      this.db.on('error', this.onDatabaseError);
      this.db.on('timeout', this.onDatabaseTimeout);
    })
    .then(() => Promise.resolve(this.db));
  }

  private connect(this: MongoRunner): Promise<Db> {
    // wrap the Promise in a Promise one
    return this.client.connect()
      .then(() => this.client.db())
      .catch((err: any) => {
        let error = new MongoRunnerErrors.DatabaseConnectionError(err, 'Error connecting to database');
        logger.error(error);
        throw error;
      });
  }



  protected doStop(): Promise<Db> {
    if (!this.db) {
      return Promise.resolve(this.db);
    }

    this.db.removeListener('close', this.onDatabaseClose);
    this.db.removeListener('reconnect', this.onDatabaseReconnect);
    this.db.removeListener('error', this.onDatabaseError);
    this.db.removeListener('timeout', this.onDatabaseTimeout);

    return this.client.close()
      .then(() => this.db);
  }

  public info() {
    return { uri: this.uri };
  }

  private onDatabaseClose() {
    logger.error(new MongoRunnerErrors.DatabaseConnectionError('Disconnected from database'));
  }

  private onDatabaseReconnect() {
    logger.info('Reconnected to database');
  }

  private onDatabaseError(err: Error) {
    logger.error(new MongoRunnerErrors.DatabaseConnectionError(err, 'Unexpected error in database'));
  }

  private onDatabaseTimeout(err: Error) {
    logger.error(new MongoRunnerErrors.DatabaseConnectionError(err, 'Unexpected timeout in database'));
  }
}

/**
 * The errors thrown by this runner
 */
export namespace MongoRunnerErrors {
  /**
   * A database connection error occurred
   *
   * @operations
   * @severity error
   * @cause The server had an error with the connection to the database. Check details in the error message
   * @solution Sometimes it is a transitory situation. Check the specific cause and try to fix it.
   */
  export class DatabaseConnectionError extends Therror {}
}

Errors.MongoRunner = MongoRunnerErrors;
declare module './errors' {
  namespace Errors {
    export let MongoRunner: typeof MongoRunnerErrors;
  }
}

