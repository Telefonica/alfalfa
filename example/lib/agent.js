import http from 'http';

/** Create a KeepAlived agent to have always connected sockets */
export const agent = new http.Agent({ keepAlive: true });

