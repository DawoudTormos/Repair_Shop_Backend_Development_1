/**
 * CORS configuration.
 * In development you may allow all origins; in production restrict to your domain.
 * The comment below indicates where to adjust.
 */
module.exports = (req, res, next) => {
  // TODO: Replace '*' with your allowed origin(s) in production
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};