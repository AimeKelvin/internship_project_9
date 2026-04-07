const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const createError = require('http-errors');

// routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tableRoutes = require('./routes/tables');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');

const app = express();

// security & parsing
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false }));

// logging
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

// rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
}));

// api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);

// health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res, next) => next(createError(404, 'Not Found')));

// error handler
app.use((err, req, res, next) => {
  logger.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

module.exports = app;
