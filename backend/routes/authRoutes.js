const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { publicRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', publicRateLimiter, register);
router.post('/login', publicRateLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
