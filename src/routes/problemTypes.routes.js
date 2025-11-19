const express = require('express');
const router = express.Router();
const problemTypesController = require('../controllers/problemTypes.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');

// All problem‑type routes require authentication
router.use(auth);

// Create problem type
router.post('/', permission('problemTypes'), problemTypesController.create);

// List problem types
router.get('/', permission('problemTypes'), problemTypesController.list);

// Get single problem type
router.get('/:id', permission('problemTypes'), problemTypesController.get);

// Update problem type
router.patch('/:id', permission('problemTypes'), problemTypesController.update);

// Delete problem type
router.delete('/:id', permission('problemTypes'), problemTypesController.delete);

module.exports = router;