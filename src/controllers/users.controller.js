const usersService = require('../services/users.service');

/**
 * Create a new user.
 * Body: { username, password, permissions }
 */
async function create(req, res) {
  const { username, password, permissions } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    if (await usersService.isUsernameTaken(username)) {
      return res.status(409).json({ error: 'Username is already taken' });
    }
    const user = await usersService.createUser({ username, password, permissions });
    // Remove sensitive password_hash before sending response
    const { password_hash, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * List all users.
 */
async function list(req, res) {
  try {
    const users = await usersService.listUsers();
    // Remove password_hash from each user before sending response
    const safeUsers = users.map(({ password_hash, ...rest }) => rest);
    res.json(safeUsers);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a single user by id.
 */
async function get(req, res) {
  const { id } = req.params;
  try {
    const user = await usersService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Remove password_hash before sending response
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update a user.
 * Body may contain username, password, permissions.
 */
async function update(req, res) {
  const { id } = req.params;
  const { username, password, permissions } = req.body;
  try {
    if (username && (await usersService.isUsernameTaken(username, id))) {
      return res.status(409).json({ error: 'Username is already taken' });
    }
    const updated = await usersService.updateUser(id, { username, password, permissions });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Remove password_hash before sending response
    const { password_hash, ...safeUpdated } = updated;
    res.json(safeUpdated);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Change a user's password (admin only).
 * Body: { password }
 */
async function changePassword(req, res) {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  // Only admin (user id === 1) can change other users' passwords
  if (req.user.id !== 1) {
    return res.status(403).json({ error: 'Forbidden – admin only' });
  }
  try {
    // Reuse updateUser to hash the new password
    const updated = await usersService.updateUser(id, { password });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Do not expose password_hash
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a user.
 */
async function _delete(req, res) {
  const { id } = req.params;
  try {
    const deleted = await usersService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found or cannot be deleted' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  create,
  list,
  get,
  update,
  changePassword,
  delete: _delete,
};