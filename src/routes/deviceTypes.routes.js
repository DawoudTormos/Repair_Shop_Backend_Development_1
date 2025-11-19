const express = require('express');
const router = express.Router();
const deviceTypesController = require('../controllers/deviceTypes.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');

// All device‑type routes require authentication
router.use(auth);

// Create device type
router.post('/', permission('deviceTypes'), deviceTypesController.create);

// List device types
router.get('/', permission('deviceTypes'), deviceTypesController.list);

// Get single device type
router.get('/:id', permission('deviceTypes'), deviceTypesController.get);

// Update device type
router.patch('/:id', permission('deviceTypes'), deviceTypesController.update);

// Delete device type
router.delete('/:id', permission('deviceTypes'), deviceTypesController.delete);

module.exports = router;