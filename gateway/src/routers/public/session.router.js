const express = require('express');
const router = express.Router();
const rateLimiter = require('../../utils/rateLimiter');
const sessionController = require('../../controllers/users.controller');

router.use(rateLimiter.public()) // Rate limiter

// public routes
router.post('/api/v1/', sessionController.handleAuthentication); // Route to handle user login
router.post('/api/v1/refresh-token', sessionController.handleTokenRefresh); // Route to refresh access token

module.exports = router;