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
import { Runner } from './';
import { Agent } from 'http';

export interface HTTPAgentOptions {
  /**  */
  name?: string;
  /** the agent instance */
  agent: Agent;
}

/**
 * Agent Runner takes care of destroying HTTPAgents with KeepAlive
 *
 * @see https://nodejs.org/api/http.html#http_agent_destroy
 */
export class HTTPAgentRunner extends Runner<Agent> {

  agent: Agent;

  constructor(opt: HTTPAgentOptions) {
    super(opt.name || 'HTTPAgent');
    this.agent = opt.agent;
  }

  protected doStart(): Promise<Agent> {
    return Promise.resolve(this.agent);
  }

  protected doStop(): Promise<Agent> {
    this.agent.destroy();
    return Promise.resolve(this.agent);
  }
}
