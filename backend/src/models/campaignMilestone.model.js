const pool = require('../config/database');

async function findByCampaignId(campaignId) {
  const [rows] = await pool.query(
    'SELECT * FROM campaign_milestones WHERE campaign_id = ? ORDER BY milestone_date ASC',
    [campaignId]
  );
  return rows;
}

async function create({ campaignId, label, milestoneDate }) {
  const [result] = await pool.query(
    'INSERT INTO campaign_milestones (campaign_id, label, milestone_date) VALUES (?, ?, ?)',
    [campaignId, label, milestoneDate]
  );
  const [rows] = await pool.query('SELECT * FROM campaign_milestones WHERE id = ?', [
    result.insertId,
  ]);
  return rows[0];
}

module.exports = { findByCampaignId, create };
