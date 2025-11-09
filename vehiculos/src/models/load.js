const mongoose = require('mongoose');

const VehicleLoadSchema = new mongoose.Schema({
  idVehicle: { type: String, required: true },
  idDrive: { type: String, required: true,},
  load: [{
    material: { type: String, required: true },
    weight: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('VehicleLoad', VehicleLoadSchema);