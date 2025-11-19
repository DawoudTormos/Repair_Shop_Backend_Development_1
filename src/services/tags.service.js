const db = require('../config/db');

/**
 * Create a new tag.
 * @param {Object} data - { name, color }
 * @returns {Promise<Object>} Created tag row
 */
async function createTag({ name, color }) {
  const { rows } = await db.query(
    'INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING *',
    [name, color]
  );
  return rows[0];
}

/**
 * List all tags.
 * @returns {Promise<Array>} Array of tag rows
 */
async function listTags() {
  const { rows } = await db.query('SELECT * FROM tags ORDER BY name');
  return rows;
}

/**
 * Get a tag by id.
 * @param {number} id - Tag id
 * @returns {Promise<Object|null>} Tag row or null
 */
async function getTagById(id) {
  const { rows } = await db.query('SELECT * FROM tags WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Update a tag.
 * @param {number} id - Tag id
 * @param {Object} data - { name?, color? }
 * @returns {Promise<Object|null>} Updated tag row or null
 */
async function updateTag(id, { name, color }) {
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
  const query = `UPDATE tags SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
  const { rows } = await db.query(query, values);
  return rows[0] || null;
}

/**
 * Delete a tag.
 * @param {number} id - Tag id
 * @returns {Promise<boolean>} true if deleted
 */
async function deleteTag(id) {
  const { rowCount } = await db.query('DELETE FROM tags WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = {
  createTag,
  listTags,
  getTagById,
  updateTag,
  deleteTag,
};