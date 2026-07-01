const {
  validateEmail,
  validatePassword,
  validateName,
  validateUserInput,
  validateCity,
  escapeHtml,
} = require('../../utils/validators');

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('john@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('not-an-email')).toBe(false);
      expect(validateEmail(null)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept passwords with 6+ chars and a number', () => {
      expect(validatePassword('password1')).toBe(true);
      expect(validatePassword('abc123')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('short')).toBe(false);
      expect(validatePassword('nopassword')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should accept valid names', () => {
      expect(validateName('John Doe')).toBe(true);
    });

    it('should reject empty or too long names', () => {
      expect(validateName('')).toBe(false);
      expect(validateName('a'.repeat(51))).toBe(false);
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
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const result = validateUserInput({
        name: '',
        email: 'bad',
        password: 'weak',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCity', () => {
    it('should accept valid city names', () => {
      expect(validateCity('London')).toBe(true);
    });

    it('should reject empty cities', () => {
      expect(validateCity('')).toBe(false);
      expect(validateCity(null)).toBe(false);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });
  });
});
