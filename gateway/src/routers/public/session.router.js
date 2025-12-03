const express = require('express');
const router = express.Router();
const rateLimiter = require('../../utils/rateLimiter');
const sessionController = require('../../controllers/session.controller');

router.use(rateLimiter.public()) // Rate limiter

// public routes
router.post('/api/v1/login', sessionController.handleAuthentication); // Route to handle user login
router.post('/api/v1/refresh-token', sessionController.handleTokenRefresh); // Route to refresh access token
router.post('/api/v1/session/status', sessionController.handleVerifySessionStatus)  

module.exports = router;