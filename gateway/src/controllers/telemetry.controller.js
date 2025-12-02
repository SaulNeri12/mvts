const telemetryEmitter = require('../emmiters/telemetry.emitter');


/**
 * Controller to handle incoming telemetry messages.
 * @param {String} message message received from telemetry queue
 */
exports.handleTelemetryMessage = async (message) => {
    try{
        telemetryEmitter.emitTelemetryUpdate(message);
    } catch (error) {
        console.log('Error handling telemetry message:', error);
    }
}   