const prisma = require('../utils/prisma');
const createError = require('http-errors');

// helper to get io instance
function getIo(req) {
  return req.app.locals.io;
}

// POST /api/orders
// body: { tableNumber, items: [{ menuItemId, quantity, specialInstructions }] }
async function createOrder(req, res, next) {
  try {
    const { tableNumber, items } = req.body;
    if (!tableNumber || !Array.isArray(items) || items.length === 0) throw createError(400, 'tableNumber and items are required');

    const table = await prisma.table.findUnique({ where: { tableNumber: Number(tableNumber) } });
    if (!table) throw createError(404, 'Table not found');

    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        waiterId: req.user.id,
        status: 'PENDING',
        orderItems: {
          create: items.map(i => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity ? Number(i.quantity) : 1,
            specialInstructions: i.specialInstructions || null
          }))
        }
      },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true,
        waiter: { select: { id: true, name: true } }
      }
    });

    const io = getIo(req);

    // Emit to kitchen, waiter and table rooms
    io.to('kitchen').emit('orderCreated', order);
    io.to(`waiter-${req.user.id}`).emit('orderCreated', order);
    io.to(`table-${tableNumber}`).emit('orderCreated', order);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// GET /api/orders?status=...&tableNumber=...
async function getOrders(req, res, next) {
  try {
    const { status, tableNumber } = req.query;
    const where = {};

    if (status) where.status = status;
    if (tableNumber) {
      const table = await prisma.table.findUnique({ where: { tableNumber: Number(tableNumber) } });
      if (!table) throw createError(404, 'Table not found');
      where.tableId = table.id;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: { include: { menuItem: true } },
        table: true,
        waiter: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/orders/:id/status   body: { status: 'PREPARING' }
async function updateOrderStatus(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    if (!orderId || !status) throw createError(400, 'order id and status required');

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true
      }
    });

    const io = getIo(req);
    io.to('kitchen').emit('orderUpdated', order);
    if (order.waiterId) io.to(`waiter-${order.waiterId}`).emit('orderUpdated', order);
    io.to(`table-${order.table.tableNumber}`).emit('orderUpdated', order);

    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getOrders, updateOrderStatus };
