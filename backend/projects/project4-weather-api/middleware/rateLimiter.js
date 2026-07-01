/**
 * PROJECT 4: Third-Party API Integration
 * Rate limiting for public and authenticated API endpoints.
 */
const rateLimit = require('express-rate-limit');

const windowMs = (parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60) * 1000;

const publicRateLimiter = rateLimit({
  windowMs,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = Math.ceil(windowMs / 1000);
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter,
    });
  },
});

const authenticatedRateLimiter = rateLimit({
  windowMs,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    const retryAfter = Math.ceil(windowMs / 1000);
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter,
    });
  },
});

module.exports = { publicRateLimiter, authenticatedRateLimiter };
