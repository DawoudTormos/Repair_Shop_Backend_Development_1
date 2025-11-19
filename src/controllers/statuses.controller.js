const db = require('../config/db');

/**
 * Create a new status.
 * Expected body: { name, color }
 */
async function create(req, res) {
  const { name, color } = req.body;
  if (!name || !color) {
    return res.status(400).json({ error: 'Status name and color are required' });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO statuses (name, color) VALUES ($1, $2) RETURNING *',
      [name, color]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List all statuses.
 */
async function list(req, res) {
  try {
    const { rows } = await db.query('SELECT * FROM statuses ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error('List statuses error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single status by id.
 */
async function get(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM statuses WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Status not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update a status.
 * Expected body: { name?, color? }
 */
async function update(req, res) {
  const { id } = req.params;
  const { name, color } = req.body;
  if (!name && !color) {
    return res.status(400).json({ error: 'At least one of name or color must be provided' });
  }
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
  values.push(id);
  const setClause = fields.join(', ');
  const query = `UPDATE statuses SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
  try {
    const { rows } = await db.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Status not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a status.
 * The DB trigger prevents deletion of the default Pending status (id = 1).
 */
async function _delete(req, res) {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM statuses WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Status not found or cannot be deleted' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  create,
  list,
  get,
  update,
  delete: _delete,
};