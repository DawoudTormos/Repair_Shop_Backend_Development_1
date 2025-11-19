require('dotenv').config();
const { verify } = require('../utils/jwt');

module.exports = {
  /**
   * Authentication middleware.
   * Expects JWT in the Authorization header as: Bearer <token>
   * On success, attaches decoded payload to req.user.
   */
  auth: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid Authorization format' });
    }

    const token = parts[1];
    try {
      const decoded = verify(token);
      req.user = decoded; // decoded should contain at least { id, username, permissions }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  },
};