const express = require('express');
const router = express.Router();
const statusesController = require('../controllers/statuses.controller');
const { auth } = require('../middlewares/auth');
const { permission } = require('../middlewares/permission');
const { validateId } = require('../middlewares/params');

// All status routes require authentication
router.use(auth);

// Create status (admin only – permission enforced)
router.post('/', permission('statuses'), statusesController.create);

// List statuses
router.get('/', permission('statuses'), statusesController.list);

// Get single status
router.get('/:id', permission('statuses'), validateId, statusesController.get);

// Update status
router.patch('/:id', permission('statuses'), validateId, statusesController.update);

// Delete status (cannot delete the default Pending status – enforced in DB trigger)
router.delete('/:id', permission('statuses'), validateId, statusesController.delete);

module.exports = router;