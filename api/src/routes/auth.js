const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { register } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);
router.post('/register', register);

module.exports = router;
