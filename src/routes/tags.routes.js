const express = require('express');
const router = express.Router();
const tagsController = require('../controllers/tags.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');
const { validateId } = require('../middlewares/params');

// All tag routes require authentication
router.use(auth);

// Create tag
router.post('/', permission('tags'), tagsController.create);

// List tags
router.get('/', permission(['tags', 'tasks']), tagsController.list);

// Get single tag
router.get('/:id', permission('tags'), validateId, tagsController.get);

// Update tag
router.patch('/:id', permission('tags'), validateId, tagsController.update);

// Delete tag
router.delete('/:id', permission('tags'), validateId, tagsController.delete);

module.exports = router;