const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const createError = require('http-errors');

const SALT_ROUNDS = 10;

// Admin creates waiters/admins
async function createUser(req, res, next) {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role || !password) throw createError(400, 'Missing required fields');

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, role, password: hashed }
    });

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    // req.user.id must come from your auth middleware (JWT decoded)
    const userId = req.user?.id;
    if (!userId) throw createError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) throw createError(404, 'User not found');

    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser, listUsers, getMe };
