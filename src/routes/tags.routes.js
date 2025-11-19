const express = require('express');
const router = express.Router();
const tagsController = require('../controllers/tags.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');

// All tag routes require authentication
router.use(auth);

// Create tag
router.post('/', permission('tags'), tagsController.create);

// List tags
router.get('/', permission('tags'), tagsController.list);

// Get single tag
router.get('/:id', permission('tags'), tagsController.get);

// Update tag
router.patch('/:id', permission('tags'), tagsController.update);

// Delete tag
router.delete('/:id', permission('tags'), tagsController.delete);

module.exports = router;