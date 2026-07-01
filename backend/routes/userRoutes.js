const express = require('express');
const {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { authenticatedRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authenticatedRateLimiter);

router.get('/', getUsers);
router.post('/', protect, authorize('admin'), createUser);
router.get('/:id', protect, getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
