/**
 * DecodeLabs Backend — Application Entry Point
 *
 * This server composes all four curriculum projects:
 *   Project 1 — REST API Fundamentals      (/api/users, /health)
 *   Project 2 — Database Integration       (MongoDB, models, validation)
 *   Project 3 — Secure Authentication      (/api/auth, protected routes)
 *   Project 4 — Third-Party API Integration (/api/weather)
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const { project1, project2, project3, project4 } = require('./projects');

const app = express();
const startTime = Date.now();

const validateEnv = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

validateEnv();

// ─── Shared middleware (all projects) ───────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { skip: (req, res) => res.statusCode < 400 }));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Project 4: Global rate limiting
app.use(project4.publicRateLimiter);

// ─── PROJECT 1: REST API Fundamentals ───────────────────────────────────────
project1.registerHealthCheck(app, startTime);
project1.mount(app);

// ─── PROJECT 3: Secure Authentication ───────────────────────────────────────
project3.mount(app);

// ─── PROJECT 4: Third-Party API Integration ─────────────────────────────────
project4.mount(app);

// ─── PROJECT 2: Database error handling (global) ────────────────────────────
app.use(project2.notFound);
app.use(project2.errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // ─── PROJECT 2: Database Integration — connect on startup ─────────────────
  await project2.initialize();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('  DecodeLabs Backend — All 4 Projects Loaded');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`  ${project1.name}  →  /health, ${project1.basePath}`);
      console.log(`  ${project2.name}       →  MongoDB (${process.env.MONGODB_URI})`);
      console.log(`  ${project3.name}  →  ${project3.basePath}`);
      console.log(`  ${project4.name}  →  ${project4.basePath}`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`  Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      console.log('');
    });
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
