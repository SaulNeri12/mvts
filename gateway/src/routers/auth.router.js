const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authenticateToken = require('../middlewares/token.middleware');
const userController = require('../controllers/users.controller');



// public routes
router.post('/login', SensibleRouteLimiter, userController.handleAuthentication); // Route to handle user login
router.post('/refres_token', SensibleRouteLimiter, userController.handleTokenRefresh); // Route to refresh access token

// protected routes
router.post('/logout', StrictRouteLimiter, authenticateToken, userController.handleLogout); // Route to handle user logout


module.exports = router;