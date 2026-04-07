const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { createTable, listTables } = require('../controllers/tableController');

// Admin can create; anyone authenticated can list
router.post('/', auth, requireRole('ADMIN'), createTable);
router.get('/', auth, listTables);

module.exports = router;
