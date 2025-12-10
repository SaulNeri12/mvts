const express = require('express');
const router = express.Router();
const rateLimiter = require('../../utils/rateLimiter');
const lightsController = require('../../controllers/lights.controller');

router.use(rateLimiter.private());

router.get('/', lightsController.handleGetAllLights); // Route to handle incoming lights messages
router.post('/manual/control', lightsController.handleTakeManualControl);  
router.post('/change/state', lightsController.handleLightStateChange);
router.delete('/light/manual/control', lightsController.handleReleaseManualControl);

module.exports = router;