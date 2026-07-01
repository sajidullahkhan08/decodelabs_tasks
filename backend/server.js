require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const { connectDB, registerConnectionEvents, gracefulShutdown } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { publicRateLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
const startTime = Date.now();

/**
 * Validate required environment variables at startup.
 */
const validateEnv = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

validateEnv();

// Security headers
app.use(helmet());

// CORS — restrict to client origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Response compression
app.use(compression());

// Request logging — verbose in dev, errors only in production
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      skip: (req, res) => res.statusCode < 400,
    })
  );
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Global rate limiting
app.use(publicRateLimiter);

/**
 * Health check endpoint.
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/weather', weatherRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

/**
 * Start the server (skipped in test environment).
 */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  registerConnectionEvents();
  gracefulShutdown();

  if (process.env.NODE_ENV !== 'test') {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
