/**
 * Project 3 + Project 1: Protected user routes
 */
const request = require('supertest');
const app = require('../../server');
const User = require('../../projects/project2-database/models/User');

describe('Project 3: Protected User Routes (via Project 1)', () => {
  let adminToken;
  let userToken;
  let testUserId;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
    });

    const user = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'password1',
      role: 'user',
    });

    testUserId = user._id;

    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    userToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  });

  describe('GET /api/users (Project 1 — public)', () => {
    it('should return all users without auth', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('POST /api/users (Project 3 — admin only)', () => {
    it('should create user as admin', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New User', email: 'new@test.com', password: 'password1' });

      expect(res.status).toBe(201);
    });

    it('should reject non-admin', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Blocked', email: 'blocked@test.com' });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users/:id (Project 3 — authenticated)', () => {
    it('should return user with valid token', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('user@test.com');
    });
  });
});
