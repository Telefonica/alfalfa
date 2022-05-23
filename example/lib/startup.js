import alfalfa from 'alfalfa';

import { server } from './server.js';
import { agent } from './agent.js';

export const startup = alfalfa.Startup('MyService');

startup.use(alfalfa.AgentRunner({ agent }));
startup.use(alfalfa.ServerRunner({
  server,
  port: 3000
}));
