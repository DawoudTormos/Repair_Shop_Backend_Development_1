const tagsService = require('../services/tags.service');

/**
 * Create a new tag.
 * Expected body: { name, color }
 */
async function create(req, res) {
  const { name, color } = req.body;
  if (!name || !color) {
    return res.status(400).json({ error: 'Tag name and color are required' });
  }
  try {
    const tag = await tagsService.createTag({ name, color });
    res.status(201).json(tag);
  } catch (err) {
    console.error('Create tag error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List all tags.
 */
async function list(req, res) {
  try {
    const tags = await tagsService.listTags();
    res.json(tags);
  } catch (err) {
    console.error('List tags error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single tag by id.
 */
async function get(req, res) {
  const { id } = req.params;
  try {
    const tag = await tagsService.getTagById(id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (err) {
    console.error('Get tag error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update a tag.
 * Expected body: { name?, color? }
 */
async function update(req, res) {
  const { id } = req.params;
  const { name, color } = req.body;
  if (!name && !color) {
    return res.status(400).json({ error: 'At least one of name or color must be provided' });
  }
  try {
    const updated = await tagsService.updateTag(id, { name, color });
    if (!updated) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Update tag error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a tag.
 * Deletion is blocked if any task references the tag (FK RESTRICT via task_tags).
 */
async function _delete(req, res) {
  const { id } = req.params;
  try {
    const deleted = await tagsService.deleteTag(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tag not found or cannot be deleted' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete tag error:', err);
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