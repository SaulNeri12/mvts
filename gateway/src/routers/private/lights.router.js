const express = require('express');
const router = express.Router();
const lightsController = require('../../controllers/lights.controller');


router.get('/', lightsController.handleGetAllLights); // Route to handle incoming lights messages

module.exports = router;