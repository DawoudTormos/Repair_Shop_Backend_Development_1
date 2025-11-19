require('dotenv').config();
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10; // default as per requirements

module.exports = {
  /**
   * Hash a plain‑text password.
   * @param {string} password
   * @returns {Promise<string>} bcrypt hash
   */
  hash: async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  /**
   * Compare a plain‑text password with a stored hash.
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  compare: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },
};