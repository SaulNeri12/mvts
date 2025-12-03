const {getIO} = require('../config/socket.config'); // Import the io instance

/**
 * 
 * @param {Object} telemetryData 
 */
exports.emitTelemetryUpdate = async (message) => {
    const io = getIO();
    io.emit('telemetry_update', message);
}

