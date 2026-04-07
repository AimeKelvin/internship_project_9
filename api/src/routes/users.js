const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { createUser, listUsers } = require('../controllers/userController');
const { getMe } = require('../controllers/userController'); // <— add this

// All authenticated users can access /me
router.get('/me', auth, getMe);

// Admin-only routes
router.use(auth);               // must be authenticated
router.use(requireRole('ADMIN')); // must be admin

router.post('/', createUser);   // admin creates users
router.get('/', listUsers);     // admin lists all users

module.exports = router;
