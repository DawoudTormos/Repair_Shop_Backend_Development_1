const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { ipBan } = require('../middlewares/ipBan');

// Login route
router.post('/login', ipBan, authController.login);

// Token refresh route
router.post('/refresh', authController.refreshToken);

module.exports = router;