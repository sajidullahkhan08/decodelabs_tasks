/**
 * Project 1: REST API Fundamentals — Health check & 404 tests
 */
const request = require('supertest');
const app = require('../../server');

describe('Project 1: REST API Fundamentals', () => {
  describe('GET /health', () => {
    it('should return server status with project identifier', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.message).toBe('Server is running');
      expect(res.body.project).toContain('Project 1');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
