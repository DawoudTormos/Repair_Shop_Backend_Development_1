const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');
const { validateId } = require('../middlewares/params');

// All task routes require authentication
router.use(auth);

// Create task
router.post('/', permission('tasks'), tasksController.create);

// List tasks (supports pagination & filtering)
router.get('/', permission(['tasks', 'deviceTypes']), tasksController.list);

// Get single task
router.get('/:id', permission('tasks'), validateId, tasksController.get);

// Update task
router.patch('/:id', permission('tasks'), validateId, tasksController.update);

// Delete task
router.delete('/:id', permission('tasks'), validateId, tasksController.delete);

// Archive task (soft‑delete)
router.post('/:id/archive', permission('tasks'), validateId, tasksController.archive);

// Restore archived task
router.post('/:id/restore', permission('tasks'), validateId, tasksController.restore);

module.exports = router;