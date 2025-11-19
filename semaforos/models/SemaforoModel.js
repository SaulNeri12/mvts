// mvts/semaforos/models/SemaforoModel.js
const mongoose = require('mongoose');

const SemaforoSchema = new mongoose.Schema({
  description: { type: String, required: true },
  position: { 
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
});

module.exports = mongoose.model('Semaforo', SemaforoSchema);