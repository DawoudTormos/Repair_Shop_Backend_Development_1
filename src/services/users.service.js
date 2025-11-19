const db = require('../config/db');
const bcrypt = require('../utils/bcrypt');

/**
 * Create a new user.
 * @param {Object} data - { username, password, permissions }
 * @returns {Promise<Object>} Created user row
 */
async function createUser({ username, password, permissions }) {
  const passwordHash = await bcrypt.hash(password);
  const perms = Array.isArray(permissions) ? permissions : [];
  const { rows } = await db.query(
    'INSERT INTO users (username, password_hash, permissions) VALUES ($1, $2, $3::jsonb) RETURNING *',
    [username, passwordHash, JSON.stringify(perms)]
  );
  return rows[0];
}

/**
 * List all users (basic fields).
 * @returns {Promise<Array>} Users array
 */
async function listUsers() {
  const { rows } = await db.query(
    'SELECT id, username, permissions, created_at, updated_at FROM users ORDER BY username'
  );
  return rows;
}

/**
 * Get a user by id.
 * @param {number} id - User id
 * @returns {Promise<Object|null>} User row or null
 */
async function getUserById(id) {
  const { rows } = await db.query(
    'SELECT id, username, permissions, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Update a user.
 * @param {number} id - User id
 * @param {Object} data - fields to update (username, password, permissions)
 * @returns {Promise<Object|null>} Updated user row or null
 */
async function updateUser(id, { username, password, permissions }) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (username) {
    fields.push(`username = $${idx++}`);
    values.push(username);
  }
  if (password) {
    const hash = await bcrypt.hash(password);
    fields.push(`password_hash = $${idx++}`);
    values.push(hash);
  }
  if (permissions) {
    fields.push(`permissions = $${idx++}::jsonb`);
    values.push(JSON.stringify(permissions));
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(id);
  const setClause = fields.join(', ');
  const query = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, username, permissions, created_at, updated_at`;
  const { rows } = await db.query(query, values);
  return rows[0] || null;
}

/**
 * Delete a user.
 * @param {number} id - User id
 * @returns {Promise<boolean>} true if deleted
 */
async function deleteUser(id) {
  const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [id]);
  return rowCount > 0;
}

/**
 * Check if a username is already in use.
 * @param {string} username - The username to check
 * @param {number|null} excludeId - User ID to exclude from the check (for updates)
 * @returns {Promise<boolean>} true if the username is taken
 */
async function isUsernameTaken(username, excludeId = null) {
  let query = 'SELECT id FROM users WHERE username = $1';
  const values = [username];
  if (excludeId) {
    query += ' AND id != $2';
    values.push(excludeId);
  }
  const { rows } = await db.query(query, values);
  return rows.length > 0;
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  isUsernameTaken,
};