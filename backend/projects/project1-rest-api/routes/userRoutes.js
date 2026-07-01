/**
 * PROJECT 1 + PROJECT 3: User REST Routes
 *
 * PROJECT 1 — RESTful route definitions and public read endpoints
 * PROJECT 3 — Authentication middleware applied to protected routes
 */
const express = require('express');
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// Project 3: Authentication middleware
const { protect, authorize } = require('../../project3-authentication/middleware/auth');

// Project 4: Rate limiting for authenticated user routes
const { authenticatedRateLimiter } = require('../../project4-weather-api/middleware/rateLimiter');

const router = express.Router();

router.use(authenticatedRateLimiter);

// ─── PROJECT 1: Public REST endpoints ───────────────────────────────────────
router.get('/', getUsers);

// ─── PROJECT 3: Protected endpoints (JWT + role-based access) ───────────────
router.post('/', protect, authorize('admin'), createUser);
router.get('/:id', protect, getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
