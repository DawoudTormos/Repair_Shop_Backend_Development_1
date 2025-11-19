require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const JWT_EXPIRES_IN = '9h'; // 9 hours as per requirements

module.exports = {
  /**
   * Sign a new JWT.
   * @param {Object} payload - Payload to embed in the token.
   * @returns {string} Signed JWT.
   */
  sign: (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  /**
   * Verify a JWT and return its decoded payload.
   * @param {string} token - JWT string.
   * @returns {Object} Decoded payload.
   * @throws Will throw if token is invalid or expired.
   */
  verify: (token) => {
    return jwt.verify(token, JWT_SECRET);
  },

  /**
   * Refresh a JWT (issue a new token with same payload).
   * @param {string} token - Existing JWT.
   * @returns {string} New JWT.
   */
  refresh: (token) => {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Remove standard JWT fields before re‑signing
    delete decoded.iat;
    delete decoded.exp;
    return jwt.sign(decoded, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },
};