export { Startup } from './startup';
export { ServerRunner } from './server';
export { AgentRunner } from './agent';

export { setLogger } from './logger';
export interface Runner {
  /** Optional component name */
  name?: string;
  /* start component */
  start?: () => Promise<any> | any;
  /* stop component */
  stop?: () => Promise<any> | any;
}
