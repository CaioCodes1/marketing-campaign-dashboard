const pool = require('../config/database');

const SORTABLE_COLUMNS = {
  name: 'c.name',
  budget: 'c.budget',
  start_date: 'c.start_date',
  end_date: 'c.end_date',
  status: 'c.status',
  created_at: 'c.created_at',
};

const BASE_SELECT = `
  SELECT c.*, cl.name AS client_name, u.name AS responsible_name
  FROM campaigns c
  JOIN clients cl ON cl.id = c.client_id
  JOIN users u ON u.id = c.responsible_id
`;

async function findAll({ status, platform, search, sortBy, order, page, limit }) {
  const where = ['c.deleted_at IS NULL'];
  const params = [];

  if (status) {
    where.push('c.status = ?');
    params.push(status);
  }
  if (platform) {
    where.push('c.platform = ?');
    params.push(platform);
  }
  if (search) {
    where.push('(c.name LIKE ? OR cl.name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const orderColumn = SORTABLE_COLUMNS[sortBy] || 'c.created_at';
  const orderDirection = order === 'asc' ? 'ASC' : 'DESC';

  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const offset = (pageNum - 1) * limitNum;

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `${BASE_SELECT} ${whereClause} ORDER BY ${orderColumn} ${orderDirection} LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM campaigns c JOIN clients cl ON cl.id = c.client_id ${whereClause}`,
    params
  );

  return { rows, total: countRows[0].total, page: pageNum, limit: limitNum };
}

async function findById(id) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE c.id = ? AND c.deleted_at IS NULL`, [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO campaigns
      (name, client_id, description, objective, platform, budget, spent_amount, start_date, end_date, status, responsible_id, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.clientId,
      data.description || null,
      data.objective || null,
      data.platform,
      data.budget,
      data.spentAmount || 0,
      data.startDate,
      data.endDate,
      data.status || 'planned',
      data.responsibleId,
      data.notes || null,
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.query(
    `UPDATE campaigns SET
      name = ?, client_id = ?, description = ?, objective = ?, platform = ?,
      budget = ?, spent_amount = ?, start_date = ?, end_date = ?, status = ?,
      responsible_id = ?, notes = ?
     WHERE id = ?`,
    [
      data.name,
      data.clientId,
      data.description || null,
      data.objective || null,
      data.platform,
      data.budget,
      data.spentAmount,
      data.startDate,
      data.endDate,
      data.status,
      data.responsibleId,
      data.notes || null,
      id,
    ]
  );
  return findById(id);
}

async function softDelete(id) {
  await pool.query('UPDATE campaigns SET deleted_at = NOW() WHERE id = ?', [id]);
}

async function getSummary() {
  const [[totals]] = await pool.query(
    `SELECT
      COUNT(*) AS total,
      SUM(status = 'active') AS active,
      SUM(status = 'paused') AS paused,
      SUM(status = 'completed') AS completed,
      SUM(status = 'planned') AS planned,
      SUM(status = 'cancelled') AS cancelled,
      COALESCE(SUM(budget), 0) AS total_budget,
      COALESCE(SUM(spent_amount), 0) AS total_spent
     FROM campaigns WHERE deleted_at IS NULL`
  );

  const [endingThisWeek] = await pool.query(
    `SELECT id, name, end_date FROM campaigns
     WHERE deleted_at IS NULL
       AND status IN ('active', 'planned')
       AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
     ORDER BY end_date ASC`
  );

  return { totals, endingThisWeek };
}

async function getStatusBreakdown() {
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) AS count FROM campaigns WHERE deleted_at IS NULL GROUP BY status`
  );
  return rows;
}

async function getInvestmentByMonth() {
  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(start_date, '%Y-%m') AS month, COALESCE(SUM(spent_amount), 0) AS total
     FROM campaigns WHERE deleted_at IS NULL
     GROUP BY month ORDER BY month ASC`
  );
  return rows;
}

async function getTopCampaignsByInvestment(limit = 5) {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.spent_amount, cl.name AS client_name
     FROM campaigns c JOIN clients cl ON cl.id = c.client_id
     WHERE c.deleted_at IS NULL
     ORDER BY c.spent_amount DESC LIMIT ?`,
    [limit]
  );
  return rows;
}

async function getInvestmentByPlatform() {
  const [rows] = await pool.query(
    `SELECT platform, COALESCE(SUM(spent_amount), 0) AS total
     FROM campaigns WHERE deleted_at IS NULL
     GROUP BY platform ORDER BY total DESC`
  );
  return rows;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete,
  getSummary,
  getStatusBreakdown,
  getInvestmentByMonth,
  getTopCampaignsByInvestment,
  getInvestmentByPlatform,
};
