const db = require('../config/db');
const bcrypt = require('../utils/bcrypt');
const jwt = require('../utils/jwt');

/**
 * POST /api/auth/login
 * Body: { username, password }
 */
async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const { rows } = await db.query(
      'SELECT id, username, password_hash, permissions FROM users WHERE username = $1',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Permissions are stored as JSONB array in DB
    const permissions = user.permissions || [];

    const token = jwt.sign({
      id: user.id,
      username: user.username,
    });

    // Return token together with user data (as plain text) and permissions
    res.json({
      token,
      user: { id: user.id, username: user.username },
      permissions,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/auth/refresh
 * Header: Authorization: Bearer <oldToken>
 */
async function refreshToken(req, res) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid Authorization format' });
  }

  const oldToken = parts[1];
  try {
    // Verify old token to extract payload (id, username)
    const decoded = jwt.verify(oldToken);
    const userId = decoded.id;

    // Fetch latest permissions from DB
    const { rows } = await db.query(
      'SELECT permissions FROM users WHERE id = $1',
      [userId]
    );
    const permissions = rows.length ? rows[0].permissions || [] : [];

    // Issue a new token (still without permissions)
    const newToken = jwt.sign({
      id: decoded.id,
      username: decoded.username,
    });

    // Return token together with user data and permissions
    res.json({
      token: newToken,
      user: { id: decoded.id, username: decoded.username },
      permissions,
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  login,
  refreshToken,
};