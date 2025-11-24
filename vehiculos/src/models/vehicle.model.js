const mongoose = require('mongoose');


const VehicleSchema = new mongoose.Schema({
  code: {type: String, unique: true},
  isActive: { type: Boolean, required: true },
  load:{
    material: { type: String, required: true },
    weight: { type: Number, required: true }
  }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);