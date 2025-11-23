const express = require('express');
const router = express.Router();
const loadController = require('../controllers/loadController');


router.get('/:id', loadController.getByVehicleId);
router.get('/', loadController.getAllLoads);    

module.exports = router;