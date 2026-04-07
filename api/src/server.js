const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config/env');
const { setupSocket } = require('./utils/socket');
const prisma = require('./utils/prisma');
const logger = require('./utils/logger');

const PORT = config.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  },
  pingTimeout: 60000
});

setupSocket(io);

// make io available to controllers via app.locals
app.locals.io = io;

const listener = server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// graceful shutdown
async function shutdown() {
  try {
    logger.info('Graceful shutdown started');
    await prisma.$disconnect();
    io.close();
    listener.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forcing shutdown');
      process.exit(1);
    }, 10000);
  } catch (err) {
    logger.error('Shutdown error', err);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
