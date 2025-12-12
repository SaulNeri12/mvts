const express = require('express');
const router = express.Router();
const rateLimiter = require('../../utils/rateLimiter');
const lightsController = require('../../controllers/lights.controller');

router.use(rateLimiter.private());

router.get('/', lightsController.handleGetAllLights);
router.get('/:userId/manual/lights', lightsController.handleGetAllManualLights);
router.post('/manual/control', lightsController.handleTakeManualControl);
router.post('/change/state', lightsController.handleLightStateChange);
router.delete('/manual/control', lightsController.handleReleaseManualControl);

module.exports = router;