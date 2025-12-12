const alertViajeCompletadoEmitter = require('../emmiters/alerts.viajes.emitter');
const alertCongestionEmitter = require('../emmiters/alerts.congestions.emitter');

const alertsClient = require('../infrestructure/client/alerts.client');

/**
 * Envia notificaciones de viajes completados al usuario.
 * @param {String} message mensaje que contiene la informacion del viaje.
 */
exports.handleViajeCompletadoAlerts = async (message) => {
    try {
        alertViajeCompletadoEmitter.alertViajeCompletado(message);
    } catch (error) {
        console.log('Error handling alerts viajes completdos message:', error);
    }
}

/**
 * Envia notificaciones de congestiones de vehiculos al usuario.
 * @param {String} message mensaje que contiene la informacion de la congestion
 */
exports.handleCongestionesAlerts  = async (message) => {
    try {
        alertCongestionEmitter.alertCongestiones(message);
    } catch (error) {
        console.log('Error handling alerts congestiones message:', error);
    }
}


exports.handleGetAlertsForToday = async (req, res, next) => {
    try{
        const alerts = await alertsClient.getAlertsForToday();
        return res.status(200).json(alerts);
    } catch (error) {
        next(error);
    }
}

exports.handleGetAllAlerts = async (req, res, next) => {
    try{
        const alerts = await alertsClient.getAlertsAll();
        return res.status(200).json(alerts);
    } catch (error) {
        next(error);
    }
}

exports.handleGetViajesByDateRange = async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ 
            error: "Faltan los parámetros 'startDate' y 'endDate' en la consulta." 
        });
    }

    try {
        const alerts = await alertsClient.getViajesCompletadosByDataRange(startDate, endDate);
        return res.status(200).json(alerts);
    } catch (error) {
        console.error(`Error al obtener alertas de viajes completados por rango: ${error.message}`);
        next(error); 
    }
}

exports.handleGetCongestionByDateRange = async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ 
            error: "Faltan los parámetros 'startDate' y 'endDate' en la consulta." 
        });
    }

    try {
        const alerts = await alertsClient.getCongestionByDateRange(startDate, endDate);
        return res.status(200).json(alerts);
    } catch (error) {
        console.error(`Error al obtener alertas de congestión por rango: ${error.message}`);
        next(error);
    }
}