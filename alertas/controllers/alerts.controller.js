
const alertService  = require('../services/alert.service');
const { ServiceError } = require('../errors/errors');

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