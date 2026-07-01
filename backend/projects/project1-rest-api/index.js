/**
 * =============================================================================
 * PROJECT 1: REST API FUNDAMENTALS
 * =============================================================================
 * Express.js server patterns, JSON REST endpoints, user CRUD handlers.
 *
 * Endpoints: GET/POST/PUT/DELETE /api/users
 * Also provides: health check registration
 */

const userRoutes = require('./routes/userRoutes');

module.exports = {
  id: 'project1',
  name: 'Project 1: REST API Fundamentals',
  description: 'Stateless Express REST API with JSON responses and user CRUD',
  basePath: '/api/users',

  /**
   * Mount Project 1 routes onto the Express app.
   * @param {import('express').Application} app
   */
  mount(app) {
    app.use('/api/users', userRoutes);
  },

  /**
   * Register the health check endpoint (Project 1 server setup).
   * @param {import('express').Application} app
   * @param {number} startTime - Server start timestamp
   */
  registerHealthCheck(app, startTime) {
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        project: 'Project 1 — REST API Fundamentals',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
      });
    });
  },
};
