const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

let token;
let clientId;
let userId;

beforeAll(async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'caio@agencia.com', password: 'senha123' });
  token = login.body.data.token;
  userId = login.body.data.user.id;

  const clients = await request(app).get('/api/clients').set('Authorization', `Bearer ${token}`);
  clientId = clients.body.data[0].id;
});

afterAll(async () => {
  await pool.end();
});

describe('Campaign CRUD', () => {
  let campaignId;

  it('creates a campaign and preserves the exact dates sent', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Campanha de Teste Automatizado',
        clientId,
        platform: 'instagram',
        budget: 1000,
        startDate: '2026-08-10',
        endDate: '2026-08-20',
        responsibleId: userId,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.start_date).toBe('2026-08-10');
    expect(res.body.data.end_date).toBe('2026-08-20');
    campaignId = res.body.data.id;
  });

  it('does not log a spurious history entry when budget is resent unchanged', async () => {
    await request(app)
      .put(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Descrição atualizada', budget: 1000 });

    const history = await request(app)
      .get(`/api/campaigns/${campaignId}/history`)
      .set('Authorization', `Bearer ${token}`);

    const budgetChanges = history.body.data.filter((h) => h.field_changed === 'budget');
    expect(budgetChanges).toHaveLength(0);
  });

  it('logs a real history entry when budget actually changes', async () => {
    await request(app)
      .put(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ budget: 2500 });

    const history = await request(app)
      .get(`/api/campaigns/${campaignId}/history`)
      .set('Authorization', `Bearer ${token}`);

    const budgetChange = history.body.data.find((h) => h.field_changed === 'budget');
    expect(budgetChange).toMatchObject({ old_value: '1000', new_value: '2500' });
  });

  it('soft deletes the campaign', async () => {
    const del = await request(app)
      .delete(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);

    const get = await request(app)
      .get(`/api/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(404);
  });
});
