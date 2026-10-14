const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Public route: Admin signup / registration
router.post('/signup', signup);
router.post('/register', signup);

// Public route: Admin login
router.post('/login', login);

// Protected route: Verify token and fetch current admin session
router.get('/me', verifyAdminToken, getMe);

module.exports = router;
