const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

/**
 * Helper to generate JWT Token
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in server environment variables.');
  }
  return jwt.sign(payload, secret, { expiresIn: '24h' });
};

/**
 * @desc    Register a new Admin account in MongoDB
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const { username, password, fullName } = req.body;

    // 1. Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 2. Check if username is already registered in MongoDB
    const existingAdmin = await Admin.findOne({ username: cleanUsername });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: `Username "${cleanUsername}" is already taken. Please choose another username.`,
      });
    }

    // 3. Hash password with bcrypt (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new admin in database
    const newAdmin = await Admin.create({
      username: cleanUsername,
      fullName: fullName ? fullName.trim() : cleanUsername,
      password: hashedPassword,
      role: 'admin',
    });

    // 5. Generate JWT token
    const token = generateToken({
      id: newAdmin._id,
      username: newAdmin.username,
      role: newAdmin.role,
    });

    res.status(201).json({
      success: true,
      message: 'Admin account registered successfully.',
      token,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin login using MongoDB credentials
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Find admin by username in MongoDB
    const admin = await Admin.findOne({ username: cleanUsername });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    // 2. Verify password against stored bcrypt hash in MongoDB
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    // 3. Issue JWT token
    const token = generateToken({
      id: admin._id,
      username: admin.username,
      role: admin.role || 'admin',
    });

    return res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        fullName: admin.fullName || admin.username,
        role: admin.role || 'admin',
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
  signup,
  login,
  getMe,
};
