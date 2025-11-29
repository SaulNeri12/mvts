const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/token.middleware');
const userController = require('../controllers/users.controller');

router.get('/users', authenticateToken, userController.getAllUsers); // Route to get all users


module.exports = router;