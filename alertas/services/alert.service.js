
const alertRepository = require('../repositories/alert.repository');
const { ServiceError } = require('../errors/errors');

require("dotenv").config();

/**
 * Valida que los parámetros de fecha de entrada sean válidos.
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @throws {ServiceError} Si alguna de las fechas no es un objeto Date válido.
 */
const validateDateRange = (startDate, endDate) => {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
        throw new ServiceError("La fecha de inicio proporcionada no es un objeto Date válido.");
    }
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
        throw new ServiceError("La fecha de fin proporcionada no es un objeto Date válido.");
    }
    if (startDate >= endDate) {
        throw new ServiceError("La fecha de inicio debe ser anterior a la fecha de fin.");
    }
}

/**
 * Obtiene todas las alertas registradas en la base de datos.
 * Esta función simplemente delega la llamada al repositorio.
 * * @returns {Promise<Array<object>>} Lista de todas las alertas.
 */
exports.findAll = async () => {
    try {
        console.log("[Service] Obteniendo todas las alertas...");
        return await alertRepository.findAll(); 
    } catch(error) {
        console.error(error);
        throw new ServiceError("No se pudieron obtener todas las alertas."); 
    }
};

/**
 * Obtiene todas las alertas de tipo 'congestion' dentro de un rango de fechas.
 * @param {Date} startDate - Fecha de inicio (inclusiva).
 * @param {Date} endDate - Fecha de fin (exclusiva).
 * @returns {Promise<Array<object>>} Lista de alertas de congestión.
 */
exports.getCongestionAlertsByDateRange = async (startDate, endDate) => {
    try {
        validateDateRange(startDate, endDate);
        
        console.log(`[Service] Buscando alertas de congestión entre ${startDate.toISOString()} y ${endDate.toISOString()}`);
        
        return await alertRepository.findCongestionAlertsByDateRange(startDate, endDate);
    } catch (error) {
        if (error instanceof ServiceError) {
            throw error;
        }
        console.error(error);
        throw new ServiceError("No se pudieron obtener las alertas de congestión para el rango de fechas.");
    }
};

/**
 * Obtiene todas las alertas de tipo 'viaje_completado' dentro de un rango de fechas.
 * @param {Date} startDate - Fecha de inicio (inclusiva).
 * @param {Date} endDate - Fecha de fin (exclusiva).
 * @returns {Promise<Array<object>>} Lista de alertas de viaje completado.
 */
exports.getViajesAlertsByDateRange = async (startDate, endDate) => {
    try {
        validateDateRange(startDate, endDate);

        console.log(`[Service] Buscando alertas de viaje completado entre ${startDate.toISOString()} y ${endDate.toISOString()}`);
        
        return await alertRepository.findViajesAlertsByDateRange(startDate, endDate);
    } catch (error) {
        if (error instanceof ServiceError) {
            throw error;
        }
        console.error(error);
        throw new ServiceError("No se pudieron obtener las alertas de viajes completados para el rango de fechas.");
    }
};



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