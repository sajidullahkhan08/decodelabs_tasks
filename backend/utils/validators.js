/**
 * Email validation using RFC 5322 simplified pattern.
 * @param {string} email
 * @returns {boolean}
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Password must be at least 6 characters with at least one number.
 * @param {string} password
 * @returns {boolean}
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6 && /\d/.test(password);
};

/**
 * Name must be non-empty and max 50 characters.
 * @param {string} name
 * @returns {boolean}
 */
const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
};

/**
 * Combined validation for user creation/update.
 * @param {object} data - User input data
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {{ valid: boolean, errors: Array<{ field: string, message: string }> }}
 */
const validateUserInput = (data, isUpdate = false) => {
  const errors = [];
  const { name, email, password } = data;

  if (!isUpdate || name !== undefined) {
    if (!validateName(name)) {
      errors.push({
        field: 'name',
        message: 'Name is required and must be 50 characters or fewer',
      });
    }
  }

  if (!isUpdate || email !== undefined) {
    if (!validateEmail(email)) {
      errors.push({
        field: 'email',
        message: 'A valid email address is required',
      });
    }
  }

  if (!isUpdate) {
    if (!validatePassword(password)) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 6 characters and contain at least one number',
      });
    }
  } else if (password !== undefined && password !== '') {
    if (!validatePassword(password)) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 6 characters and contain at least one number',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate city query parameter for weather endpoints.
 * @param {string} city
 * @returns {boolean}
 */
const validateCity = (city) => {
  if (!city || typeof city !== 'string') return false;
  const trimmed = city.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
};

/**
 * Sanitize string input to prevent XSS in responses.
 * @param {string} str
 * @returns {string}
 */
const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateUserInput,
  validateCity,
  escapeHtml,
};
