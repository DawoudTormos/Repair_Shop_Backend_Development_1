const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');
const { validateId } = require('../middlewares/params');

// All user routes require authentication
router.use(auth);

// Create user – only admin (handled in permission middleware)
router.post('/', permission('users'), usersController.create);

// Get all users – admin can view all, others may be restricted later
router.get('/', permission(['users' , 'tasks']), usersController.list);

// Get a single user by id
router.get('/:id', permission(['users' , 'tasks']), validateId, usersController.get);

// Update user
router.patch('/:id', permission('users'), validateId, usersController.update);
router.patch('/:id/password', permission('users'), validateId, usersController.changePassword);

// Delete user
router.delete('/:id', permission('users'), validateId, usersController.delete);

module.exports = router;