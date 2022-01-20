'use strict';
const http = require('http');
const app = require('./server');
const { env, port } = require('./config');

const server = http.createServer(app);
server.listen(port, () => {
  console.info(`Server listening on port ${port}`);
  console.info(`Env ${env}`);
});
