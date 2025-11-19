const deviceTypesService = require('../services/deviceTypes.service');

/**
 * Create a new device type.
 * Expected body: { name }
 */
async function create(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Device type name is required' });
  }
  try {
    const deviceType = await deviceTypesService.createDeviceType({ name });
    res.status(201).json(deviceType);
  } catch (err) {
    console.error('Create device type error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List all device types.
 */
async function list(req, res) {
  try {
    const deviceTypes = await deviceTypesService.listDeviceTypes();
    res.json(deviceTypes);
  } catch (err) {
    console.error('List device types error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single device type by id.
 */
async function get(req, res) {
  const { id } = req.params;
  try {
    const deviceType = await deviceTypesService.getDeviceTypeById(id);
    if (!deviceType) {
      return res.status(404).json({ error: 'Device type not found' });
    }
    res.json(deviceType);
  } catch (err) {
    console.error('Get device type error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update a device type.
 * Expected body: { name }
 */
async function update(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Device type name is required' });
  }
  try {
    const updated = await deviceTypesService.updateDeviceType(id, { name });
    if (!updated) {
      return res.status(404).json({ error: 'Device type not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Update device type error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a device type.
 * Deletion is blocked if any task references it (FK RESTRICT).
 */
async function _delete(req, res) {
  const { id } = req.params;
  try {
    const deleted = await deviceTypesService.deleteDeviceType(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Device type not found or cannot be deleted' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete device type error:', err);
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