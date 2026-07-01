/**
 * PROJECT 3: Secure Authentication System
 * JWT authentication controller — register, login, logout, profile, password update.
 */
const jwt = require('jsonwebtoken');
const User = require('../../project2-database/models/User');
const { validateUserInput, validateEmail } = require('../../project2-database/utils/validators');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7;

  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
};

/** POST /api/auth/register */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const validation = validateUserInput({ name, email, password });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/** POST /api/auth/login */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/** POST /api/auth/logout */
const logout = (req, res) => {
  res
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .status(200)
    .json({
      success: true,
      message: 'Logged out successfully',
    });
};

/** GET /api/auth/me */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
    },
  });
};

/** PUT /api/auth/updatepassword */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    const validation = validateUserInput({
      name: 'placeholder',
      email: 'a@b.com',
      password: newPassword,
    });
    if (!validation.valid) {
      const passwordError = validation.errors.find((e) => e.field === 'password');
      return res.status(400).json({
        success: false,
        message: passwordError?.message || 'Invalid password',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  generateToken,
  sendTokenResponse,
};
