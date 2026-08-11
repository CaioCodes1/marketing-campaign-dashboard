const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

afterAll(async () => {
  await pool.end();
});

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { status: 'ok' } });
  });
});

describe('POST /api/auth/login', () => {
  it('rejects invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nao-existe@agencia.com', password: 'senhaerrada' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects malformed payload with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'invalido' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in with seeded demo user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'caio@agencia.com', password: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('caio@agencia.com');
  });
});
