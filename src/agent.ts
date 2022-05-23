import { Runner } from './index';
import { Agent as HTTPAgent } from 'http';
import { Agent as HTTPsAgent } from 'https';

type Agent = HTTPAgent | HTTPsAgent;

export interface AgentOptions {
  /** the agent instance */
  agent: Agent;
}

/**
 * Stops a keepalived http agent, closing all sockets to fee resources
 */
export const AgentRunner = (options: AgentOptions): Runner => {
  const stop = () => options.agent.destroy();

  return {
    name: 'HTTPAgent',
    stop,
  };
};
