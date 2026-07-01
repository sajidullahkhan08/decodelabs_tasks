const request = require('supertest');
const app = require('../../server');

describe('Health Check', () => {
  it('GET /health should return server status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.message).toBe('Server is running');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
  });
});

describe('404 Handler', () => {
  it('should return 404 for undefined routes', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
