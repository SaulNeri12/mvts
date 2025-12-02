const {io} = require('../../server'); // Import the io instance

/**
 * 
 * @param {Object} telemetryData 
 */
exports.emitTelemetryUpdate = async (telemetryData) => {
    // Emit telemetry data to all connected clients
    io.emit('telemetry:update', telemetryData);
}

