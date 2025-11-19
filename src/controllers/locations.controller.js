const locationsService = require('../services/locations.service');

/**
 * Create a new location.
 * Expected body: { name }
 */
async function create(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Location name is required' });
  }
  try {
    const location = await locationsService.createLocation({ name });
    res.status(201).json(location);
  } catch (err) {
    console.error('Create location error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List all locations.
 */
async function list(req, res) {
  try {
    const locations = await locationsService.listLocations();
    res.json(locations);
  } catch (err) {
    console.error('List locations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single location by id.
 */
async function get(req, res) {
  const { id } = req.params;
  try {
    const location = await locationsService.getLocationById(id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (err) {
    console.error('Get location error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update a location.
 * Expected body: { name }
 */
async function update(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Location name is required' });
  }
  try {
    const updated = await locationsService.updateLocation(id, { name });
    if (!updated) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a location.
 * Deletion is blocked if any task references the location (FK RESTRICT).
 */
async function _delete(req, res) {
  const { id } = req.params;
  try {
    const deleted = await locationsService.deleteLocation(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Location not found or cannot be deleted' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete location error:', err);
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