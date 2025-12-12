const express = require('express');
const router = express.Router();
const rateLimiter = require('../../utils/rateLimiter');
const lightsController = require('../../controllers/lights.controller');

router.use(rateLimiter.private());

router.get('/', lightsController.handleGetAllLights);
router.post('/manual/control', lightsController.handleTakeManualControl);
router.delete('/user/manual/light/control', lightsController.handleReleaseManualControl);
router.post('/change/state', lightsController.handleLightStateChange);


router.get('/:userId/manual/lights', lightsController.handleGetAllManualLights);


module.exports = router;