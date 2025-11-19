const db = require('../config/db');

/**
 * Create a new device type.
 * @param {Object} data - { name }
 * @returns {Promise<Object>} Created device type row
 */
async function createDeviceType({ name }) {
  const { rows } = await db.query(
    'INSERT INTO device_types (name) VALUES ($1) RETURNING *',
    [name]
  );
  return rows[0];
}

/**
 * List all device types.
 * @returns {Promise<Array>} Array of device type rows
 */
async function listDeviceTypes() {
  const { rows } = await db.query('SELECT * FROM device_types ORDER BY name');
  return rows;
}

/**
 * Get a device type by id.
 * @param {number} id - Device type id
 * @returns {Promise<Object|null>} Device type row or null
 */
async function getDeviceTypeById(id) {
  const { rows } = await db.query('SELECT * FROM device_types WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Update a device type.
 * @param {number} id - Device type id
 * @param {Object} data - { name }
 * @returns {Promise<Object|null>} Updated device type row or null
 */
async function updateDeviceType(id, { name }) {
  const { rows } = await db.query(
    'UPDATE device_types SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [name, id]
  );
  return rows[0] || null;
}

/**
 * Delete a device type.
 * @param {number} id - Device type id
 * @returns {Promise<boolean>} true if deleted
 */
async function deleteDeviceType(id) {
  const { rowCount } = await db.query('DELETE FROM device_types WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  createDeviceType,
  listDeviceTypes,
  getDeviceTypeById,
  updateDeviceType,
  deleteDeviceType,
};