const db = require('../config/db');

/**
 * Helper to build WHERE clauses based on query parameters.
 */
function buildFilters(params) {
  const conditions = [];
  const values = [];
  let idx = 1;

  // Date range – default to last month if not provided
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setMonth(defaultStart.getMonth() - 1);
  const startDate = params.startDate || defaultStart.toISOString();
  const endDate = params.endDate || now.toISOString();

  conditions.push(`created_at BETWEEN $${idx++} AND $${idx++}`);
  values.push(startDate, endDate);

  if (params.locationId) {
    conditions.push(`location_id = $${idx++}`);
    values.push(params.locationId);
  }
  if (params.deviceTypeId) {
    conditions.push(`device_type_id = $${idx++}`);
    values.push(params.deviceTypeId);
  }
  if (params.problemTypeId) {
    conditions.push(`problem_type_id = $${idx++}`);
    values.push(params.problemTypeId);
  }
  if (params.statusId) {
    conditions.push(`status_id = $${idx++}`);
    values.push(params.statusId);
  }
  if (params.tagId) {
    // Join with task_tags for tag filtering
    conditions.push(`id IN (SELECT task_id FROM task_tags WHERE tag_id = $${idx++})`);
    values.push(params.tagId);
  }

  return { conditions, values };
}

/**
 * Create a new task.
 * Expected body: {
 *   customer_fname, customer_lname, customer_email, customer_phone,
 *   title, description,
 *   location_id, device_type_id, problem_type_id, status_id
 * }
 */
async function create(req, res) {
  const {
    customer_fname,
    customer_lname,
    customer_email,
    customer_phone,
    title,
    description,
    location_id,
    device_type_id,
    problem_type_id,
    status_id,
  } = req.body;

  // All fields are required per requirements
  if (
    !customer_fname ||
    !customer_lname ||
    !customer_email ||
    !customer_phone ||
    !title ||
    !description ||
    !location_id ||
    !device_type_id ||
    !problem_type_id ||
    !status_id
  ) {
    return res.status(400).json({ error: 'All task fields are required' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO tasks
        (customer_fname, customer_lname, customer_email, customer_phone,
         title, description,
         location_id, device_type_id, problem_type_id, status_id,
         created_by_user_id)
       VALUES
        ($1, $2, $3, $4,
         $5, $6,
         $7, $8, $9, $10,
         $11)
       RETURNING *`,
      [
        customer_fname,
        customer_lname,
        customer_email,
        customer_phone,
        title,
        description,
        location_id,
        device_type_id,
        problem_type_id,
        status_id,
        req.user.id, // creator
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List tasks with pagination and optional filters.
 * Query params:
 *   page (default 1), limit (default 25, allowed 10/25/50/100)
 *   startDate, endDate, locationId, deviceTypeId, problemTypeId, statusId, tagId
 */
async function list(req, res) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const offset = (page - 1) * limit;

  const { conditions, values } = buildFilters(req.query);
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const countResult = await db.query(
      `SELECT COUNT(*) FROM tasks ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await db.query(
      `SELECT * FROM tasks ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: dataResult.rows,
    });
  } catch (err) {
    console.error('List tasks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single task by id.
 */
async function get(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update a task.
 * Allows updating any of the mutable fields.
 */
async function update(req, res) {
  const { id } = req.params;
  const allowedFields = [
    'customer_fname',
    'customer_lname',
    'customer_email',
    'customer_phone',
    'title',
    'description',
    'location_id',
    'device_type_id',
    'problem_type_id',
    'status_id',
  ];

  const fields = [];
  const values = [];
  let idx = 1;

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      fields.push(`${field} = $${idx++}`);
      values.push(req.body[field]);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No updatable fields provided' });
  }

  values.push(id);
  const setClause = fields.join(', ');
  const query = `UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;

  try {
    const { rows } = await db.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a task (hard delete).
 */
async function _delete(req, res) {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Archive a task (soft‑delete).
 */
async function archive(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `UPDATE tasks SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND archived_at IS NULL
       RETURNING *`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or already archived' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Archive task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Restore an archived task.
 */
async function restore(req, res) {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `UPDATE tasks SET archived_at = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND archived_at IS NOT NULL
       RETURNING *`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or not archived' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Restore task error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  create,
  list,
  get,
  update,
  delete: _delete,
  archive,
  restore,
};