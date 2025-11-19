const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');

// All location routes require authentication
router.use(auth);

// Create location
router.post('/', permission('locations'), locationsController.create);

// List locations
router.get('/', permission('locations'), locationsController.list);

// Get single location
router.get('/:id', permission('locations'), locationsController.get);

// Update location
router.patch('/:id', permission('locations'), locationsController.update);

// Delete location
router.delete('/:id', permission('locations'), locationsController.delete);

module.exports = router;