const dotenv = require('dotenv');
dotenv.config();
require('./config/db');
const http = require('http');
const app = require('./app');


const normalizePort = value => {
    const port = parseInt(value, 10);
    if(isNaN(value)) return value;
    if(value >= 0) return port;
    return false
}

const port = normalizePort(process.env.PORT || 3000);

const errorHandler = error => {
    if(error.syscall !== 'listen') throw error;
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe' + address : 'port :' + port ;
    switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges.');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use.');
          process.exit(1);
          break;
        default:
          throw error;
      }
}

const server = http.createServer(app);

server.on('error',errorHandler);

server.on('listening', () => {
    const address = server.address(); 
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port; 
    console.log('Listening on ' + bind);
  });

server.listen(port);  