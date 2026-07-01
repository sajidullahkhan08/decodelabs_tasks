/**
 * PROJECT 2: Database Integration
 * MongoDB connection configuration with graceful shutdown.
 */
const mongoose = require('mongoose');

/**
 * Connect to MongoDB with connection event handling and graceful shutdown.
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Project 2] MongoDB Connected: ${conn.connection.host}`);
    }

    return conn;
  } catch (error) {
    console.error(`[Project 2] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Register MongoDB connection event listeners.
 */
const registerConnectionEvents = () => {
  mongoose.connection.on('connected', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[Project 2] Mongoose connected to MongoDB');
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Project 2] Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('[Project 2] Mongoose disconnected from MongoDB');
    }
  });
};

/**
 * Gracefully close MongoDB connection on app termination.
 */
const gracefulShutdown = () => {
  const shutdown = async (signal) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Project 2] ${signal} received. Closing MongoDB connection...`);
    }

    try {
      await mongoose.connection.close();
      if (process.env.NODE_ENV !== 'test') {
        console.log('[Project 2] MongoDB connection closed gracefully');
      }
      process.exit(0);
    } catch (error) {
      console.error('[Project 2] Error during MongoDB shutdown:', error.message);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

module.exports = { connectDB, registerConnectionEvents, gracefulShutdown };
