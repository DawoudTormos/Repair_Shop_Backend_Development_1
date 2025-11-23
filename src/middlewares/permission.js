require('dotenv').config();
const db = require('../config/db');

/**
 * Permission middleware factory.
 * Usage: router.use(permission('tasks'));
 * Admin (user id === 1) bypasses all checks.
 */
module.exports = {
  permission: (requiredPermission) => {
      return async (req, res, next) => {
        const user = req.user;
        if (!user) {
          return res.status(401).json({ error: 'Unauthenticated' });
        }
  
        // Admin (id = 1) bypasses all checks.
        if (user.id === 1) {
          return next();
        }else if(requiredPermission === 'users' ){
          return res.status(403).json({ error: 'Only the admin can edit users.' });
        }
  
        // Retrieve permissions from DB
        let userPermissions = [];
        try {
          const { rows } = await db.query('SELECT permissions FROM users WHERE id = $1', [user.id]);
          if (rows.length > 0) {
            userPermissions = rows[0].permissions || [];
          }
        } catch (err) {
          console.error('Permission fetch error:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        // Normalize requiredPermission to an array
        const requiredPermissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

        if (Array.isArray(userPermissions) && userPermissions.some(p => requiredPermissions.includes(p))) {
          console.log('Permission granted for user with permissions:', userPermissions, 'for required permissions:', requiredPermissions);
          return next();
        }
  
        return res.status(403).json({ error: 'Forbidden – insufficient permissions' });
      };
    },
};