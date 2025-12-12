const express = require('express');
const router = express.Router();

const alertsController = require('../../controllers/alerts.controller');

router.get('/today', alertsController.handleGetAlertsForToday);
router.get('/all', alertsController.handleGetAllAlerts);

module.exports = router;