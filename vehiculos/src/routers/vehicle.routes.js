const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');

// Get all vehicles / loads
router.get('/vehicle/get/all', vehicleController.getAllLoads);

// Create a new vehicle
router.post('/vehicle/create', vehicleController.create);

// Get by vehicle code
router.get('/vehicle/find/code', vehicleController.findByVehicleByCode);

// Update activeness by code
router.patch('/vehicle/update/state', vehicleController.updateState);

// Update load by code
router.patch('/vehicle/update/load', vehicleController.updateLoad);

// Delete by code
router.delete('/vehicle/delete', vehicleController.deleteByCode);

module.exports = router;