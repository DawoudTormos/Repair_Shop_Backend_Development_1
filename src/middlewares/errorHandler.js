/**
 * Central error‑handling middleware.
 * Sends JSON error responses with appropriate status codes.
 */
module.exports = {
  errorHandler: (err, req, res, next) => {
    console.error('Error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  },
};