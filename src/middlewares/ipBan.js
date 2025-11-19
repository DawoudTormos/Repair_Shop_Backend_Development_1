require('dotenv').config();
const db = require('../config/db');

/**
 * IP‑ban middleware.
 * Checks the ip_bans table for the request IP.
 * If the IP is currently banned (banned_until > now), blocks the request.
 * Otherwise, allows the request to continue.
 */
module.exports = {
  ipBan: async (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress;
      const { rows } = await db.query(
        'SELECT banned_until FROM ip_bans WHERE ip = $1',
        [ip]
      );

      if (rows.length > 0) {
        const bannedUntil = rows[0].banned_until;
        if (bannedUntil && new Date(bannedUntil) > new Date()) {
          return res.status(403).json({ error: 'Your IP is temporarily banned due to multiple failed login attempts.' });
        }
      }

      next();
    } catch (err) {
      console.error('IP‑ban check error:', err);
      // Fail‑safe: allow request to proceed if DB check fails
      next();
    }
  },
};