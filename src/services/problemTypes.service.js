const db = require('../config/db');

/**
 * Create a new problem type.
 * @param {{ name: string }} data
 * @returns {Promise<Object>} The created problem type row.
 */
async function createProblemType({ name }) {
  const { rows } = await db.query(
    'INSERT INTO problem_types (name) VALUES ($1) RETURNING *',
    [name]
  );
  return rows[0];
}

/**
 * Retrieve all problem types.
 * @returns {Promise<Array>} List of problem type rows.
 */
async function listProblemTypes() {
  const { rows } = await db.query('SELECT * FROM problem_types ORDER BY id');
  return rows;
}

/**
 * Get a problem type by its ID.
 * @param {number|string} id
 * @returns {Promise<Object|null>} The problem type row or null if not found.
 */
async function getProblemTypeById(id) {
  const { rows } = await db.query(
    'SELECT * FROM problem_types WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

/**
 * Update a problem type's name.
 * @param {number|string} id
 * @param {{ name: string }} data
 * @returns {Promise<Object|null>} Updated row or null if not found.
 */
async function updateProblemType(id, { name }) {
  const { rows } = await db.query(
    `UPDATE problem_types
       SET name = $1,
           updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [name, id]
  );
  return rows[0] || null;
}

/**
 * Delete a problem type.
 * Prevent deletion if the type is referenced by any task (foreign‑key RESTRICT).
 * @param {number|string} id
 * @returns {Promise<boolean>} True if a row was deleted, false otherwise.
 */
async function deleteProblemType(id) {
  // PostgreSQL will raise an error if FK constraint fails; we catch it to return false.
  try {
    const { rowCount } = await db.query(
      'DELETE FROM problem_types WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  } catch (err) {
    console.error('Delete problem type DB error:', err);
    // Return false so controller can respond with 404 or appropriate message.
    return false;
  }
}

module.exports = {
  createProblemType,
  listProblemTypes,
  getProblemTypeById,
  updateProblemType,
  deleteProblemType,
};