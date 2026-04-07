const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { createMenuItem, listMenuItems } = require('../controllers/menuItemController');

// Admin creates/edits; authenticated users can list
router.post('/', auth, requireRole('ADMIN'), createMenuItem);
router.get('/', auth, listMenuItems);

module.exports = router;
