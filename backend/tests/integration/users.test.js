const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('User CRUD', () => {
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

  describe('GET /api/users', () => {
    it('should return all users (public read)', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/users', () => {
    it('should create user as admin', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'new@test.com',
          password: 'password1',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('new@test.com');
    });

    it('should reject non-admin create', async () => {
      const res = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Blocked User',
          email: 'blocked@test.com',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user for authenticated request', async () => {
      const res = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('user@test.com');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user as admin', async () => {
      const res = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user as admin', async () => {
      const res = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });
  });
});
