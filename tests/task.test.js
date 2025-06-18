require('dotenv').config({ path: '.env.test' });

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const Task = require('../models/tasks');
const bcrypt = require('bcrypt')
jest.setTimeout(20000);
let token; 
let taskId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

beforeEach(async () => {
  await User.deleteMany();
  await Task.deleteMany();

  const hashedPassword = await bcrypt.hash('taskpass', 10);

  await new User({
    username: 'taskuser',
    password: hashedPassword
  }).save();

  const loginRes = await request(app).post('/api/auth/login').send({
    username: 'taskuser',
    password: 'taskpass',
  });

  console.log('LOGIN RESPONSE:', loginRes.statusCode, loginRes.body);

  token = loginRes.body.token;

  if (!token) {
    throw new Error('Login failed: token not received');
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Task Endpoints', () => {
  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Task',
        status: 'pending'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Test Task');

    taskId = res.body._id;
  });

  it('should get user tasks', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Another Task', status: 'pending' });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should update a task status', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updatable Task', status: 'pending' });

    const taskId = createRes.body._id;

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.status).toBe('completed');
  });

  it('should delete a task', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Deletable Task', status: 'pending' });

    const taskId = createRes.body._id;

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toMatch(/deleted/i);
  });
});

 
  it('should return only tasks with status "pending"', async () => {
   
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Pending Task', status: 'pending' });

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Completed Task', status: 'completed' });

    const res = await request(app)
      .get('/api/tasks?status=pending')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    res.body.forEach(task => expect(task.status).toBe('pending'));
  });
