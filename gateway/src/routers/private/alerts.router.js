const express = require('express');
const router = express.Router();

const alertsController = require('../../controllers/alerts.controller');

router.get('/today', alertsController.handleGetAlertsForToday); // Route to handle incoming lights messages

module.exports = router;