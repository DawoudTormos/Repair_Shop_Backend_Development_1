const db = require('../config/db');

/**
 * Helper to build WHERE clauses based on query parameters.
 */
function buildFilters(params) {
  const conditions = [];
  const values = [];
  let idx = 1;

  // Date range is required
  const { startDate, endDate } = params;
  if (!startDate || !endDate) {
    // This case should be handled in the controller before calling buildFilters
    return { error: 'Start date and end date are required' };
  }

  conditions.push(`created_at BETWEEN $${idx++} AND $${idx++}`);
  values.push(startDate, endDate);

  return { conditions, values };
}

/**
 * Create a new task.
 * @param {Object} data - task fields (see controller for required fields)
 * @param {number} createdByUserId - id of the user creating the task
 * @returns {Promise<Object>} created task row
 */
async function createTask(data, createdByUserId) {
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
  } = data;

  const { rows } = await db.query(
    `INSERT INTO tasks
      (customer_fname, customer_lname, customer_email, customer_phone,
       title, description,
       location_id, device_type_id, problem_type_id, status_id,
       created_by_user_id)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
      createdByUserId,
    ]
  );
  return rows[0];
}

/**
 * List tasks with pagination and optional filters.
 * @param {Object} query - Express req.query object
 * @returns {Promise<Object>} { total, page, limit, totalPages, data }
 */
async function listTasks(query) {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 25; // default per spec
  const offset = (page - 1) * limit;

  const { conditions, values, error } = buildFilters(query);
  if (error) {
    // This should ideally be caught by the controller, but as a safeguard:
    throw new Error(error);
  }
  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // Total count
  const countResult = await db.query(
    `SELECT COUNT(*) FROM tasks ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Data rows
  const dataResult = await db.query(
    `SELECT * FROM tasks ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: dataResult.rows,
  };
}

/**
 * Get a single task by id.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function getTaskById(id) {
  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Update a task.
 * @param {number} id
 * @param {Object} fields - allowed fields to update
 * @returns {Promise<Object|null>}
 */
async function updateTask(id, fields) {
  const allowed = [
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
  const setParts = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setParts.push(`${key} = $${idx++}`);
      values.push(fields[key]);
    }
  }

  if (setParts.length === 0) {
    return null;
  }

  values.push(id);
  const setClause = setParts.join(', ');
  const query = `UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
  const { rows } = await db.query(query, values);
  return rows[0] || null;
}

/**
 * Delete a task (hard delete).
 * @param {number} id
 * @returns {Promise<boolean>}
 */
async function deleteTask(id) {
  const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  return rowCount > 0;
}

/**
 * Archive (soft‑delete) a task.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function archiveTask(id) {
  const { rows } = await db.query(
    `UPDATE tasks SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND archived_at IS NULL
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Restore an archived task.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function restoreTask(id) {
  const { rows } = await db.query(
    `UPDATE tasks SET archived_at = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND archived_at IS NOT NULL
     RETURNING *`,
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
  archiveTask,
  restoreTask,
};