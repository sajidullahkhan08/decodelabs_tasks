const express = require('express');
const {
  getWeatherByCity,
  getWeatherWithForecast,
  getWeatherMultipleCities,
  clearWeatherCache,
} = require('../controllers/weatherController');
const { protect, authorize } = require('../middleware/auth');
const { publicRateLimiter, authenticatedRateLimiter } = require('../middleware/rateLimiter');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

router.get(
  '/current',
  publicRateLimiter,
  cacheMiddleware('current'),
  getWeatherByCity
);

router.get(
  '/forecast',
  authenticatedRateLimiter,
  protect,
  cacheMiddleware('forecast'),
  getWeatherWithForecast
);

router.post(
  '/multiple',
  authenticatedRateLimiter,
  protect,
  getWeatherMultipleCities
);

router.get(
  '/cache/clear',
  protect,
  authorize('admin'),
  clearWeatherCache
);

module.exports = router;
