const User = require('../models/User');
const { validateUserInput } = require('../utils/validators');

/**
 * Create a new user (admin only).
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const validation = validateUserInput({ name, email, password: password || 'password1' });
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
      password: password || 'password1',
      role: role || 'user',
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users sorted by createdAt descending.
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAllSorted().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single user by ID.
 * GET /api/users/:id
 */
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user by ID (admin only).
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const validation = validateUserInput({ name, email }, true);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists',
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user by ID (admin only).
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
