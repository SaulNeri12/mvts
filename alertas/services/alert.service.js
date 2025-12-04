
const alertRepository = require('../repositories/alert.repository');
const { ServiceError } = require('../errors/errors');

require("dotenv").config();

/**
 * Obtiene todas las alertas que han transcurrido en el transcurso del dia.
 * @returns Lista de alertas durante el dia.
 */
exports.getAlertsForToday = async () => {
    try {
        return await alertRepository.findAlertsForToday();   
    }
    catch(error) {
        console.log(error);
        throw new ServiceError("No se pudo obtener las alertas del dia.");   
    }
};

/**
 * Guarda una alerta en la base de datos.
 * @param {AlertModel} alert Objeto de alerta (model)
 * @returns Regresa la alerta guardada.
 */
exports.saveAlert = async (alert) => {
    try {

        if (alert == null) {
            throw new Error("'alert' no puede ser null");
        }

        return await alertRepository.saveAlert(alert);
    }
    catch(error) {
        console.error(error);
        throw new ServiceError("No se pudo obtener las alertas del dia.");   
    }
}