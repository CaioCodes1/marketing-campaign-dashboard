const pool = require('../config/database');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function findAll() {
  const [rows] = await pool.query(
    'SELECT id, name, email, role FROM users ORDER BY name ASC'
  );
  return rows;
}

module.exports = { findByEmail, findById, findAll };
