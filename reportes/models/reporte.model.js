
const mongoose = require('mongoose');

const ReporteSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true,
        enum: ['congestion', 'viaje_completado'] // Define los tipos permitidos
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    // "Mixed" permite guardar cualquier estructura JSON sin validación estricta
    datos: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
});

module.exports = mongoose.model('Reporte', ReporteSchema);