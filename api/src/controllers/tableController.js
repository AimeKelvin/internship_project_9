const prisma = require('../utils/prisma');
const createError = require('http-errors');

async function createTable(req, res, next) {
  try {
    const { tableNumber, capacity, section } = req.body;
    if (tableNumber === undefined || capacity === undefined) throw createError(400, 'tableNumber and capacity required');

    const table = await prisma.table.create({
      data: { tableNumber: Number(tableNumber), capacity: Number(capacity), section }
    });

    res.status(201).json(table);
  } catch (err) {
    // handle unique constraint / other errors
    next(err);
  }
}

async function listTables(req, res, next) {
  try {
    const tables = await prisma.table.findMany();
    res.json(tables);
  } catch (err) {
    next(err);
  }
}

module.exports = { createTable, listTables };
