const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @desc    Admin login
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.',
      });
    }

    const configUsername = process.env.ADMIN_USERNAME || 'admin';
    const configPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!configPasswordHash || !jwtSecret) {
      console.error(
        'Server configuration error: ADMIN_PASSWORD_HASH or JWT_SECRET is not defined in environment variables.'
      );
      return res.status(500).json({
        success: false,
        message: 'Server authentication configuration is incomplete. Please check server environment variables.',
      });
    }

    // Verify username (case-insensitive comparison for username friendliness)
    const isUsernameMatch = username.trim().toLowerCase() === configUsername.trim().toLowerCase();

    // Verify password hash with bcrypt
    const isPasswordMatch = await bcrypt.compare(password, configPasswordHash);

    if (!isUsernameMatch || !isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    // Generate JWT token (valid for 24 hours)
    const token = jwt.sign(
      {
        username: configUsername,
        role: 'admin',
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      token,
      admin: {
        username: configUsername,
        role: 'admin',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify active admin session
 * @route   GET /api/auth/me
 * @access  Private (Admin only)
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      admin: req.admin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
