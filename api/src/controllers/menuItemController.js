const prisma = require('../utils/prisma');
const createError = require('http-errors');

async function createMenuItem(req, res, next) {
  try {
    const { name, category, price, description, isAvailable, imageUrl } = req.body;
    if (!name || !category || price === undefined) 
      throw createError(400, 'Missing required fields');

    const item = await prisma.menuItem.create({
      data: {
        name,
        category,
        price: Number(price),
        description: description || null,
        isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
        imageUrl: imageUrl || null  // <- Add this line
      }
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function listMenuItems(req, res, next) {
  try {
    const items = await prisma.menuItem.findMany();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

module.exports = { createMenuItem, listMenuItems };
