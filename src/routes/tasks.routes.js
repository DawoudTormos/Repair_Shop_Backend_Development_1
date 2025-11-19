const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');

// All task routes require authentication
router.use(auth);

// Create task
router.post('/', permission('tasks'), tasksController.create);

// List tasks (supports pagination & filtering)
router.get('/', permission('tasks'), tasksController.list);

// Get single task
router.get('/:id', permission('tasks'), tasksController.get);

// Update task
router.patch('/:id', permission('tasks'), tasksController.update);

// Delete task
router.delete('/:id', permission('tasks'), tasksController.delete);

// Archive task (soft‑delete)
router.post('/:id/archive', permission('tasks'), tasksController.archive);

// Restore archived task
router.post('/:id/restore', permission('tasks'), tasksController.restore);

module.exports = router;