const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('./logger');

function setupSocket(io) {
  // socket auth middleware: clients must pass { auth: { token } }
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const payload = jwt.verify(token, config.JWT_SECRET);
      socket.user = { id: payload.id, role: payload.role, name: payload.name };
      return next();
    } catch (err) {
      logger.warn('Socket auth failed: %s', err.message);
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket connected: %s (user=%s)', socket.id, socket.user.id);

    socket.on('joinRoom', (room) => {
      socket.join(room);
      logger.info('Socket %s joined room %s', socket.id, room);
    });

    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      logger.info('Socket %s left room %s', socket.id, room);
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket %s disconnected: %s', socket.id, reason);
    });
  });
}

module.exports = { setupSocket };
