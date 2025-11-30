const express = require('express');
const router = express.Router();
const rateLimiter = require('../../utils/rateLimiter');
const authenticateToken = require('../../middlewares/token.middleware');
const sessionController = require('../../controllers/session.controller');

router.use(rateLimiter.private())

// protected session routes
router.post('/api/v1/logout', authenticateToken, sessionController.handleLogout); // Route to handle user logout-

module.exports = router;