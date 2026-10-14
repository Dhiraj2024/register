const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Public route: Admin login
router.post('/login', login);

// Protected route: Verify token and fetch current admin session
router.get('/me', verifyAdminToken, getMe);

module.exports = router;
