const {io} = require('../../server'); // Import the io instance


exports.emitTelemetryUpdate = async (telemetryData) => {
    // Emit telemetry data to all connected clients
    console.log(telemetryData);
    io.emit('telemetry:update', telemetryData);
}

