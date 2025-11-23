const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');
const { validateId } = require('../middlewares/params');

// All location routes require authentication
router.use(auth);

// Create location
router.post('/', permission('locations'), locationsController.create);

// List locations
router.get('/', permission(['locations', 'tasks']), locationsController.list);

// Get single location
router.get('/:id', permission('locations'), validateId, locationsController.get);

// Update location
router.patch('/:id', permission('locations'), validateId, locationsController.update);

// Delete location
router.delete('/:id', permission('locations'), validateId, locationsController.delete);

module.exports = router;