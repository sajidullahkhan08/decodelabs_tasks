/**
 * PROJECT 3: Secure Authentication System
 * JWT verification, role-based authorization, and email verification guard.
 */
const jwt = require('jsonwebtoken');
const User = require('../../project2-database/models/User');

/** Verify JWT from Authorization header or cookie; attach user to request. */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid token',
    });
  }
};

/** Role-based authorization — restrict access to specified roles. */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You don't have permission to access this resource",
    });
  }
  next();
};

/** Optional: block access until email is verified. */
const verifyEmail = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email before accessing this resource',
    });
  }
  next();
};

module.exports = { protect, authorize, verifyEmail };
