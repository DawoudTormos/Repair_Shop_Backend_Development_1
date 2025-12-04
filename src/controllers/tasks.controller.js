const tasksService = require('../services/tasks.service');


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
    tags = []
  } = req.body;

  // Validate required fields
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

  // Validate tags array
  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be an array of tag IDs' });
  }

  try {
    // Use service to create the task
    const newTask = await tasksService.createTask(
      {
        customer_fname,
        customer_lname,
        customer_email,
        customer_phone,
        title,
        description,
        location_id,
        device_type_id,
        problem_type_id,
        status_id
      },
      req.user.id
    );

    // Set tags if any
    if (tags.length > 0) {
      await tasksService.setTaskTags(newTask.id, tags);
    }

    // Return full task with tags
    const fullTask = await tasksService.getTaskById(newTask.id);
    res.status(201).json(fullTask);
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
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  try {
    const result = await tasksService.listTasks(req.query);
    // result contains { total, data } where each task includes its tags
    res.json(result);
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
    const task = await tasksService.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
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
  const { tags, ...fields } = req.body;

  // Use service to update task fields
  const updatedTask = await tasksService.updateTask(id, fields);
  if (!updatedTask) {
    return res.status(404).json({ error: 'Task not found or no fields to update' });
  }

  // Update tags if provided
  if (tags) {
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array of tag IDs' });
    }
    await tasksService.setTaskTags(id, tags);
  }

  // Return full task with tags
  const fullTask = await tasksService.getTaskById(id);
  res.json(fullTask);
}

/**
 * Delete a task (hard delete).
 */
async function _delete(req, res) {
  const { id } = req.params;
  try {
    const deleted = await tasksService.deleteTask(id);
    if (!deleted) {
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
    const archived = await tasksService.archiveTask(id);
    if (!archived) {
      return res.status(404).json({ error: 'Task not found or already archived' });
    }
    const fullTask = await tasksService.getTaskById(id);
    res.json(fullTask);
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
    const restored = await tasksService.restoreTask(id);
    if (!restored) {
      return res.status(404).json({ error: 'Task not found or not archived' });
    }
    const fullTask = await tasksService.getTaskById(id);
    res.json(fullTask);
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