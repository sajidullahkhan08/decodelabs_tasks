const rateLimit = require('express-rate-limit');

const windowMs = (parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60) * 1000;

/**
 * Rate limiter for public endpoints — 60 requests per minute.
 */
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

/**
 * Rate limiter for authenticated endpoints — 600 requests per minute.
 */
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
