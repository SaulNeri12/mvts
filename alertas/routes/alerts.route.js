const alertsController = require('../controllers/alerts.controller');

var express = require('express');
var router = express.Router();

router.get('/today', alertsController.getAlertsForTodayHandler);

module.exports = router;
