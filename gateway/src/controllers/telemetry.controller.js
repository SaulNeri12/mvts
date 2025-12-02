const telemetryConsumer = require('../infrestructure/consumer/telemetry.consumer');
const telemetryEmitter = require('../emmiters/telemetry.emitter');

/**
 * Start the telemetry consumer to process incoming telemetry data.
 */
exports.startTelemetryConsumer = async () => {
    await telemetryConsumer.startConsuming();
}

/**
 * Controller to handle incoming telemetry messages.
 * @param {String} message message received from telemetry queue
 */
exports.handleTelemetryMessage = async (message) => {
    setInterval(() => {
        telemetryEmitter.emitTelemetryUpdate('Sending telemetry message test');
    }, 5000);
}   