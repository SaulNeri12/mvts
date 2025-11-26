const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');

// Get all vehicles / loads
router.get('/get/all', vehicleController.getAllLoads);

// Create a new vehicle
router.post('/', vehicleController.create);

// Get by vehicle code
router.get('/find/code', vehicleController.findByVehicleByCode);

// Update activeness by code
router.patch('/state', vehicleController.updateState);

// Update load by code
router.patch('/load', vehicleController.updateLoad);

// Delete by code
router.delete('/', vehicleController.deleteByCode);

module.exports = router;