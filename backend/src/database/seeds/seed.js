const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const pool = require('../../config/database');

const PLATFORMS = ['instagram', 'facebook', 'google_ads', 'tiktok', 'linkedin', 'other'];
const STATUSES = ['planned', 'active', 'paused', 'completed', 'cancelled'];
const OBJECTIVES = [
  'Geração de leads',
  'Reconhecimento de marca',
  'Conversão de vendas',
  'Engajamento',
  'Tráfego para o site',
];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomDateRange() {
  const start = faker.date.between({ from: '2026-01-01', to: '2026-12-31' });
  const end = new Date(start);
  end.setDate(end.getDate() + faker.number.int({ min: 7, max: 60 }));
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

async function seed() {
  const connection = await pool.getConnection();

  try {
    console.log('Limpando tabelas...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE campaign_history');
    await connection.query('TRUNCATE TABLE campaign_milestones');
    await connection.query('TRUNCATE TABLE campaigns');
    await connection.query('TRUNCATE TABLE clients');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Criando usuários...');
    const passwordHash = await bcrypt.hash('senha123', 10);
    const userIds = [];
    const seedUsers = [
      { name: 'Caio Martins', email: 'caio@agencia.com', role: 'admin' },
      { name: 'Ana Souza', email: 'ana@agencia.com', role: 'manager' },
      { name: 'Bruno Lima', email: 'bruno@agencia.com', role: 'manager' },
    ];
    for (const u of seedUsers) {
      const [result] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [u.name, u.email, passwordHash, u.role]
      );
      userIds.push(result.insertId);
    }

    console.log('Criando clientes...');
    const clientIds = [];
    for (let i = 0; i < 8; i += 1) {
      const [result] = await connection.query(
        'INSERT INTO clients (name, contact_email, contact_phone) VALUES (?, ?, ?)',
        [faker.company.name(), faker.internet.email(), faker.phone.number()]
      );
      clientIds.push(result.insertId);
    }

    console.log('Criando campanhas...');
    for (let i = 0; i < 30; i += 1) {
      const { start, end } = randomDateRange();
      const budget = faker.number.int({ min: 500, max: 15000 });
      const status = randomFrom(STATUSES);
      const spent =
        status === 'completed'
          ? budget
          : status === 'planned'
            ? 0
            : faker.number.int({ min: 0, max: budget });
      const responsibleId = randomFrom(userIds);

      const [result] = await connection.query(
        `INSERT INTO campaigns
          (name, client_id, description, objective, platform, budget, spent_amount, start_date, end_date, status, responsible_id, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${faker.commerce.productAdjective()} ${faker.commerce.department()}`,
          randomFrom(clientIds),
          faker.lorem.sentence(),
          randomFrom(OBJECTIVES),
          randomFrom(PLATFORMS),
          budget,
          spent,
          start,
          end,
          status,
          responsibleId,
          faker.lorem.sentence(),
        ]
      );

      const campaignId = result.insertId;

      await connection.query(
        `INSERT INTO campaign_history (campaign_id, changed_by, field_changed, old_value, new_value)
         VALUES (?, ?, 'status', NULL, 'planned')`,
        [campaignId, responsibleId]
      );

      if (status !== 'planned') {
        await connection.query(
          `INSERT INTO campaign_history (campaign_id, changed_by, field_changed, old_value, new_value)
           VALUES (?, ?, 'status', 'planned', ?)`,
          [campaignId, responsibleId, status]
        );
      }

      await connection.query(
        `INSERT INTO campaign_milestones (campaign_id, label, milestone_date) VALUES (?, ?, ?)`,
        [campaignId, 'Aprovação do criativo', start]
      );
    }

    console.log('Seed concluído com sucesso.');
    console.log('Login de teste: caio@agencia.com / senha123');
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Falha ao popular banco:', err);
  process.exit(1);
});
