const pool = require('../config/database');

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM clients ORDER BY name ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM clients WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create({ name, contactEmail, contactPhone }) {
  const [result] = await pool.query(
    'INSERT INTO clients (name, contact_email, contact_phone) VALUES (?, ?, ?)',
    [name, contactEmail || null, contactPhone || null]
  );
  return findById(result.insertId);
}

async function update(id, { name, contactEmail, contactPhone }) {
  await pool.query(
    'UPDATE clients SET name = ?, contact_email = ?, contact_phone = ? WHERE id = ?',
    [name, contactEmail || null, contactPhone || null, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM clients WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };
