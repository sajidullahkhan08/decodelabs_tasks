/**
 * =============================================================================
 * PROJECT 2: DATABASE INTEGRATION (CRUD)
 * =============================================================================
 * MongoDB connection, Mongoose models, validation, and error handling.
 */

const { connectDB, registerConnectionEvents, gracefulShutdown } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const User = require('./models/User');
const validators = require('./utils/validators');

module.exports = {
  id: 'project2',
  name: 'Project 2: Database Integration',
  description: 'MongoDB/Mongoose CRUD with validation, indexes, and error handling',
  basePath: null,

  connectDB,
  registerConnectionEvents,
  gracefulShutdown,
  errorHandler,
  notFound,
  models: { User },
  validators,

  /**
   * Initialize Project 2 — connect to MongoDB.
   */
  async initialize() {
    registerConnectionEvents();
    gracefulShutdown();
    if (process.env.NODE_ENV !== 'test') {
      await connectDB();
    }
  },
};
