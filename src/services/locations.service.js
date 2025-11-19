const db = require('../config/db');

/**
 * Create a new location.
 * @param {Object} data - { name }
 * @returns {Promise<Object>} Created location row
 */
async function createLocation({ name }) {
  const { rows } = await db.query(
    'INSERT INTO locations (name) VALUES ($1) RETURNING *',
    [name]
  );
  return rows[0];
}

/**
 * List all locations.
 * @returns {Promise<Array>} Array of location rows
 */
async function listLocations() {
  const { rows } = await db.query('SELECT * FROM locations ORDER BY name');
  return rows;
}

/**
 * Get a location by id.
 * @param {number} id - Location id
 * @returns {Promise<Object|null>} Location row or null
 */
async function getLocationById(id) {
  const { rows } = await db.query('SELECT * FROM locations WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Update a location.
 * @param {number} id - Location id
 * @param {Object} data - { name }
 * @returns {Promise<Object|null>} Updated location row or null
 */
async function updateLocation(id, { name }) {
  const { rows } = await db.query(
    'UPDATE locations SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [name, id]
  );
  return rows[0] || null;
}

/**
 * Delete a location.
 * @param {number} id - Location id
 * @returns {Promise<boolean>} true if deleted
 */
async function deleteLocation(id) {
  const { rowCount } = await db.query('DELETE FROM locations WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  createLocation,
  listLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};