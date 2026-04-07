const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const config = require('../config/env');
const prisma = require('../utils/prisma');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(401, 'Authorization header missing');
    }
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.JWT_SECRET);

    // fetch fresh user
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw createError(401, 'User not found');

    req.user = { id: user.id, role: user.role, name: user.name, email: user.email };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
