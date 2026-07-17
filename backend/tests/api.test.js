process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db/database');

beforeAll(() => {
  // Clear the test database tables to ensure clean slate
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM tasks');
  db.exec('DELETE FROM activity_logs');
});

afterAll(() => {
  db.close();
});

describe('API Integration Tests', () => {
  let authToken = '';
  let taskId = null;
  const username = `testuser_${Date.now()}`;
  const password = 'password123';

  test('GET /api/health returns health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'task-manager-backend' });
  });

  test('POST /api/auth/register creates a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username, password });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.username).toBe(username);
  });

  test('POST /api/auth/register fails with duplicate username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username, password });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Username already exists.');
  });

  test('POST /api/auth/login logs in user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username, password });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  test('GET /api/tasks rejects requests without JWT token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/tasks creates a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Learn Vitest and Jest',
        description: 'Implement at least 5 tests',
        priority: 'high',
        dueDate: '2026-07-16'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.title).toBe('Learn Vitest and Jest');
    expect(res.body.data.priority).toBe('high');
    expect(res.body.data.completed).toBe(false);
    taskId = res.body.data.id;
  });

  test('POST /api/tasks fails with blank title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: '   ',
        description: 'Title should not be blank'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Task title is required.');
  });

  test('GET /api/tasks lists user tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.count).toBe(1);
  });

  test('PUT /api/tasks/:id updates an existing task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Learn Vitest and Jest - Updated',
        completed: true
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.title).toBe('Learn Vitest and Jest - Updated');
    expect(res.body.data.completed).toBe(true);
  });

  test('DELETE /api/tasks/:id deletes task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(taskId);
  });
});
