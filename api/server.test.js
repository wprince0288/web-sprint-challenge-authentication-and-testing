const request = require('supertest');
const server = require('./server.js')
const db = require('../data/dbConfig');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  const tables = await db.raw(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users';"
  );
  if (tables.length > 0) {
    await db('users').truncate();
  }
});

afterAll(async () => {
  await db.destroy();
});

describe('[POST] /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(server).post('/api/auth/register').send({
      username: 'foo',
      password: 'bar',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('username', 'foo');
  });
  it('should return 400 if missing credentials', async () => {
    const res = await request(server).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });
});

describe('[POST] /api/auth/login', () => {
  beforeEach(async () => {
    await request(server).post('/api/auth/register').send({
      username: 'testuser',
      password: 'pass123',
    });
  });

  it('should login with correct credentials', async () => {
    const res = await request(server).post('/api/auth/login').send({
      username: 'testuser',
      password: 'pass123',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return 401 with bad credentials', async () => {
    const res = await request(server).post('/api/auth/login').send({
      username: 'testuser',
      password: 'wrongpass',
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });
});

describe('[GET] /api/jokes', () => {
  let token;

  beforeEach(async () => {
    await request(server).post('/api/auth/register').send({
      username: 'testuser',
      password: 'pass123',
    });

    const res = await request(server).post('/api/auth/login').send({
      username: 'testuser',
      password: 'pass123',
    });
    token = res.body.token;
  });

  it('should return jokes with valid token', async () => {
    const res = await request(server)
      .get('/api/jokes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('should return 401 without token', async () => {
    const res = await request(server).get('/api/jokes');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/required/i);
  });
});

test('sanity', () => {
  expect(true).toBe(true)
});