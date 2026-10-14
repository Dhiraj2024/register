const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JSON Web Token (JWT) on protected admin routes.
 * Expects Bearer token in 'Authorization' header: "Bearer <token>"
 */
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing.',
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('CRITICAL: JWT_SECRET is not configured on the server.');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: JWT secret is not configured.',
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    // Attach decoded admin user to request object
    req.admin = {
      username: decoded.username || process.env.ADMIN_USERNAME || 'admin',
      role: decoded.role || 'admin',
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
        isExpired: true,
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
};

module.exports = { verifyAdminToken };
