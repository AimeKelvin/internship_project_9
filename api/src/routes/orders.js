const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');


router.post('/', auth, createOrder);

router.get('/', auth, getOrders);


router.patch('/:id/status', auth, updateOrderStatus);

module.exports = router;
