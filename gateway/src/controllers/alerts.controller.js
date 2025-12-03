const alertEmitter = require('../emmiters/alerts.emitter');
const alertsClient = require('../infrestructure/client/alerts.client');

/**
 * Controller to handle incoming alerts messages.
 * @param {String} message message received from alerts queue
 */
exports.handleAlertsMessage = async (message) => {
    try {
        alertEmitter.alertsUpdate(message);
    } catch (error) {
        console.log('Error handling alerts message:', error);
    }
}

exports.handleGetAllAlerts = async (req, res, next) => {
    try{
        const alerts = await alertsClient.getAllAlerts();
        return res.status(200).json(alerts);
    } catch (error) {
        next(error);
    }
}