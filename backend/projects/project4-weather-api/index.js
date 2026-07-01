/**
 * =============================================================================
 * PROJECT 4: THIRD-PARTY API INTEGRATION
 * =============================================================================
 * OpenWeatherMap integration with caching, rate limiting, and circuit breaker.
 *
 * Endpoints: /api/weather/*
 */

const weatherRoutes = require('./routes/weatherRoutes');
const { publicRateLimiter, authenticatedRateLimiter } = require('./middleware/rateLimiter');
const { weatherCache, cacheMiddleware } = require('./middleware/cache');
const { weatherCircuitBreaker } = require('./utils/circuitBreaker');

module.exports = {
  id: 'project4',
  name: 'Project 4: Third-Party API Integration',
  description: 'OpenWeatherMap API with caching, rate limiting, and circuit breaker',
  basePath: '/api/weather',

  publicRateLimiter,
  authenticatedRateLimiter,
  weatherCache,
  cacheMiddleware,
  weatherCircuitBreaker,

  /**
   * Mount Project 4 weather routes.
   * @param {import('express').Application} app
   */
  mount(app) {
    app.use('/api/weather', weatherRoutes);
  },
};
