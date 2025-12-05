// mvts/semaforos/models/SemaforoModel.js
const mongoose = require('mongoose');

const SemaforoSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true},
    section: { type: String, required: true },
    position: {
        latitude: { type: String, required: true },
        longitude: { type: String, required: true }
    },
});

SemaforoSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Semaforo', SemaforoSchema);