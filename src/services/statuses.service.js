const db = require('../config/db');

/**
 * Create a new status.
 * @param {Object} data - { name, color }
 * @returns {Promise<Object>} Created status row
 */
async function createStatus({ name, color }) {
  const { rows } = await db.query(
    'INSERT INTO statuses (name, color) VALUES ($1, $2) RETURNING *',
    [name, color]
  );
  return rows[0];
}

/**
 * List all statuses.
 * @returns {Promise<Array>} Array of status rows
 */
async function listStatuses() {
  const { rows } = await db.query('SELECT * FROM statuses ORDER BY id');
  return rows;
}

/**
 * Get a status by id.
 * @param {number} id - Status id
 * @returns {Promise<Object|null>} Status row or null
 */
async function getStatusById(id) {
  const { rows } = await db.query('SELECT * FROM statuses WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Update a status.
 * @param {number} id - Status id
 * @param {Object} data - { name?, color? }
 * @returns {Promise<Object|null>} Updated status row or null
 */
async function updateStatus(id, { name, color }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (name) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (color) {
    fields.push(`color = $${idx++}`);
    values.push(color);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(id);
  const setClause = fields.join(', ');
  const query = `UPDATE statuses SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
  const { rows } = await db.query(query, values);
  return rows[0] || null;
}

/**
 * Delete a status.
 * The DB trigger prevents deletion of the default Pending status (id = 1).
 * @param {number} id - Status id
 * @returns {Promise<boolean>} true if deleted
 */
async function deleteStatus(id) {
  const { rowCount } = await db.query('DELETE FROM statuses WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  createStatus,
  listStatuses,
  getStatusById,
  updateStatus,
  deleteStatus,
};