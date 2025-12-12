
const alertService  = require('../services/alert.service');
const { ServiceError } = require('../errors/errors');

const handleControllerError = (res, error) => {
    console.error(error);
    if (error instanceof ServiceError) {
        res.status(400).json({ error: error.message || "Solicitud incorrecta debido a un error de servicio." });
    } else {
        res.status(500).json({ error: "Error interno del servidor al procesar la solicitud." });
    }
};



exports.getAlertsForTodayHandler = async (req, res) => {
    try {
        const alerts = await alertService.getAlertsForToday();

        if (alerts == null) {
            throw new Error();
        }

        res.status(200).json(alerts);

    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(500).json({ error: "Error en el servidor al obtener datos." });
        } else {
            res.status(500).json({ error: "Error interno inesperado." });
        }
    }
};

exports.getAllAlertsHandler = async (req, res) => {
    try {
        console.log('[Controller] Solicitud: Obtener todas las alertas.');
        const alerts = await alertService.findAll();

        if (alerts == null) {
            throw new Error("El servicio devolvió un resultado nulo.");
        }

        res.status(200).json({
            status: 'success',
            count: alerts.length,
            data: alerts
        });
        
    } catch (error) {
        handleControllerError(res, error);
    }
};

exports.getCongestionAlertsByDateRangeHandler = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Faltan parámetros 'startDate' y/o 'endDate' en la consulta." });
    }

    // Convertir las cadenas de texto a objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    try {
        console.log(`[Controller] Solicitud: Congestion alerts between ${start.toISOString()} and ${end.toISOString()}.`);
        
        const alerts = await alertService.getCongestionAlertsByDateRange(start, end);

        res.status(200).json({
            status: 'success',
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        handleControllerError(res, error);
    }
};


/**
 * Controlador para obtener alertas de tipo 'viaje_completado' en un rango de fechas.
 * GET /alerts/viajes?startDate=...&endDate=...
 */
exports.getViajesAlertsByDateRangeHandler = async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: "Faltan parámetros 'startDate' y/o 'endDate' en la consulta." });
    }

    // Convertir las cadenas de texto a objetos Date
    const start = new Date(startDate);
    const end = new Date(endDate);

    try {
        console.log(`[Controller] Solicitud: Viajes completed alerts between ${start.toISOString()} and ${end.toISOString()}.`);
        
        const alerts = await alertService.getViajesAlertsByDateRange(start, end);

        res.status(200).json({
            status: 'success',
            count: alerts.length,
            data: alerts
        });
    } catch (error) {
        handleControllerError(res, error);
    }
};