const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');

describe('Authentication', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password1',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email already exists');
    });

    it('should reject invalid input', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: '',
        email: 'bad',
        password: 'weak',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const registerRes = await request(app).post('/api/auth/register').send({
        name: 'Me User',
        email: 'me@example.com',
        password: 'password1',
      });
      token = registerRes.body.token;
    });

    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('me@example.com');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/updatepassword', () => {
    let token;

    beforeEach(async () => {
      const registerRes = await request(app).post('/api/auth/register').send({
        name: 'Pass User',
        email: 'pass@example.com',
        password: 'password1',
      });
      token = registerRes.body.token;
    });

    it('should update password with valid current password', async () => {
      const res = await request(app)
        .put('/api/auth/updatepassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password1',
          newPassword: 'newpass2',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'pass@example.com',
        password: 'newpass2',
      });
      expect(loginRes.status).toBe(200);
    });
  });
});
