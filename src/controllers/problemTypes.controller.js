const problemTypesService = require('../services/problemTypes.service');

/**
 * Create a new problem type.
 * Body: { name }
 */
async function create(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Problem type name is required' });
  }
  try {
    const problemType = await problemTypesService.createProblemType({ name });
    res.status(201).json(problemType);
  } catch (err) {
    console.error('Create problem type error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List all problem types.
 */
async function list(req, res) {
  try {
    const problemTypes = await problemTypesService.listProblemTypes();
    res.json(problemTypes);
  } catch (err) {
    console.error('List problem types error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single problem type by id.
 */
async function get(req, res) {
  const { id } = req.params;
  try {
    const problemType = await problemTypesService.getProblemTypeById(id);
    if (!problemType) {
      return res.status(404).json({ error: 'Problem type not found' });
    }
    res.json(problemType);
  } catch (err) {
    console.error('Get problem type error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update a problem type.
 * Body: { name }
 */
async function update(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Problem type name is required' });
  }
  try {
    const updated = await problemTypesService.updateProblemType(id, { name });
    if (!updated) {
      return res.status(404).json({ error: 'Problem type not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Update problem type error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a problem type.
 */
async function _delete(req, res) {
  const { id } = req.params;
  try {
    const deleted = await problemTypesService.deleteProblemType(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Problem type not found or cannot be deleted' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete problem type error:', err);
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