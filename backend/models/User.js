const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
userSchema.index({ name: 'text' });

/**
 * Virtual: display name (first name from full name).
 */
userSchema.virtual('displayName').get(function displayName() {
  return this.name ? this.name.split(' ')[0] : '';
});

/**
 * Hash password before saving — only when password field is modified.
 */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Cleanup hook before document removal (extend for related data cleanup).
 */
userSchema.pre('deleteOne', { document: true, query: false }, async function preRemove(next) {
  // Placeholder for cascading deletes (e.g., user sessions, webhooks)
  next();
});

/**
 * Compare plain-text password with hashed password.
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate password reset token and set expiry (1 hour).
 * @returns {string} Unhashed reset token
 */
userSchema.methods.getResetPasswordToken = function getResetPasswordToken() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
  return resetToken;
};

/**
 * Generate email verification token.
 * @returns {string} Verification token
 */
userSchema.methods.getVerificationToken = function getVerificationToken() {
  const token = crypto.randomBytes(20).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  return token;
};

/**
 * Find user by email (includes password for auth).
 * @param {string} email
 * @returns {Promise<Document|null>}
 */
userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Find all users sorted by creation date.
 * @returns {Promise<Document[]>}
 */
userSchema.statics.findAllSorted = function findAllSorted() {
  return this.find().sort({ createdAt: -1 });
};

/**
 * Find users by role.
 * @param {string} role
 * @returns {Promise<Document[]>}
 */
userSchema.statics.findByRole = function findByRole(role) {
  return this.find({ role }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('User', userSchema);
