const alertsController = require('../controllers/alerts.controller');

var express = require('express');
var router = express.Router();

router.get('/today', alertsController.getAlertsForTodayHandler);
router.get('/all', alertsController.getAllAlertsHandler);

// Ejemplo de uso: GET /api/alerts/congestion?startDate=2025-11-01&endDate=2025-12-01
router.get('/congestion', alertsController.getCongestionAlertsByDateRangeHandler);
// Ejemplo de uso: GET /api/alerts/viajes?startDate=2025-11-01&endDate=2025-12-01
router.get('/viajes', alertsController.getViajesAlertsByDateRangeHandler);

module.exports = router;
