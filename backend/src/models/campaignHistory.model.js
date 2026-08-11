const pool = require('../config/database');

async function findByCampaignId(campaignId) {
  const [rows] = await pool.query(
    `SELECT h.*, u.name AS changed_by_name
     FROM campaign_history h
     JOIN users u ON u.id = h.changed_by
     WHERE h.campaign_id = ?
     ORDER BY h.changed_at DESC`,
    [campaignId]
  );
  return rows;
}

async function create({ campaignId, changedBy, fieldChanged, oldValue, newValue }) {
  await pool.query(
    `INSERT INTO campaign_history (campaign_id, changed_by, field_changed, old_value, new_value)
     VALUES (?, ?, ?, ?, ?)`,
    [campaignId, changedBy, fieldChanged, oldValue ?? null, newValue ?? null]
  );
}

async function createMany(entries) {
  for (const entry of entries) {
    await create(entry);
  }
}

module.exports = { findByCampaignId, create, createMany };
