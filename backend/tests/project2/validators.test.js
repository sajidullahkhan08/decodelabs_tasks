/**
 * Project 2: Database Integration — Validator unit tests
 */
const {
  validateEmail,
  validatePassword,
  validateName,
  validateUserInput,
  validateCity,
  escapeHtml,
} = require('../../projects/project2-database/utils/validators');

describe('Project 2: Database Integration — Validators', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('john@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('not-an-email')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with 6+ chars and a number', () => {
      expect(validatePassword('password1')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('short')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should accept valid names', () => {
      expect(validateName('John Doe')).toBe(true);
    });

    it('should reject empty names', () => {
      expect(validateName('')).toBe(false);
    });
  });

  describe('validateUserInput', () => {
    it('should pass valid user data', () => {
      const result = validateUserInput({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password1',
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCity', () => {
    it('should accept valid city names', () => {
      expect(validateCity('London')).toBe(true);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });
  });
});
