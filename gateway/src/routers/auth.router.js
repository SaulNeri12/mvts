const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authenticateToken = require('../middlewares/auth.middleware');
const userController = require('../controllers/users.controller');


const SensibleRouteLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 login requests per `window`
    message: "Too many attempts from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

const StrictRouteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, 
    legacyHeaders: false,  
});

// public routes
router.post('/login', SensibleRouteLimiter, userController.handleAuthentication); // Route to handle user login
router.post('/refres_token', SensibleRouteLimiter, userController.handleTokenRefresh); // Route to refresh access token

// protected routes
router.post('/logout', StrictRouteLimiter, authenticateToken, userController.handleLogout); // Route to handle user logout


module.exports = router;