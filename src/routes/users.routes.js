const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');

// All user routes require authentication
router.use(auth);

// Create user – only admin (handled in permission middleware)
router.post('/', permission('users'), usersController.create);

// Get all users – admin can view all, others may be restricted later
router.get('/', permission('users'), usersController.list);

// Update user
router.patch('/:id', permission('users'), usersController.update);
router.patch('/:id/password', permission('users'), usersController.changePassword);

// Delete user
router.delete('/:id', permission('users'), usersController.delete);

module.exports = router;