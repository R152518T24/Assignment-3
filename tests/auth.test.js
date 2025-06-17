require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../models/user');
const app = require('../app');
const bcrypt = require('bcrypt');


jest.setTimeout(20000);

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should register a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      password: 'testpass',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should login a user and return token', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'testuser',
      password: 'testpass',
    });

    const res = await request(app).post('/api/auth/login').send({
      username: 'testuser',
      password: 'testpass',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
