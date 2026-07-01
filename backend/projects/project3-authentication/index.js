/**
 * =============================================================================
 * PROJECT 3: SECURE AUTHENTICATION SYSTEM
 * =============================================================================
 * JWT tokens, bcrypt password hashing, protected routes, role-based access.
 *
 * Endpoints: /api/auth/*
 * Also secures: /api/users routes (via middleware in Project 1 routes)
 */

const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');

module.exports = {
  id: 'project3',
  name: 'Project 3: Secure Authentication',
  description: 'JWT authentication, bcrypt hashing, HTTP-only cookies, RBAC',
  basePath: '/api/auth',

  middleware: authMiddleware,

  /**
   * Mount Project 3 authentication routes.
   * @param {import('express').Application} app
   */
  mount(app) {
    app.use('/api/auth', authRoutes);
  },
};
