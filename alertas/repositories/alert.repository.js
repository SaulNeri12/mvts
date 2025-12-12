const alertModel = require('../models/alert.model');
const { RepositoryError } = require('../errors/errors')


exports.findAll = async () => {
  try {
    const allAlerts = await alertModel.find({}); 
    return allAlerts;
  } catch (error) {
    console.error(error);
    throw new RepositoryError("No se pudieron obtener todas las alertas de la base de datos.");
  }
};

exports.findCongestionAlertsByDateRange = async (startDate, endDate) => {
  if (!(startDate instanceof Date) || isNaN(startDate)) {
    throw new RepositoryError("La fecha de inicio proporcionada no es válida.");
  }
  if (!(endDate instanceof Date) || isNaN(endDate)) {
    throw new RepositoryError("La fecha de fin proporcionada no es válida.");
  }

  try {
    const congestionAlerts = await alertModel.find({
      type: 'congestion',
      timestamp: {
        $gte: startDate,
        $lt: endDate
      }
    });

    return congestionAlerts;
  } catch (error) {
    console.error(error);
    throw new RepositoryError("No se pudieron obtener las alertas de congestión para el rango de fechas especificado.");
  }
};


exports.findViajesAlertsByDateRange = async (startDate, endDate) => {
  if (!(startDate instanceof Date) || isNaN(startDate)) {
    throw new RepositoryError("La fecha de inicio proporcionada no es válida.");
  }
  if (!(endDate instanceof Date) || isNaN(endDate)) {
    throw new RepositoryError("La fecha de fin proporcionada no es válida.");
  }

  try {
    const congestionAlerts = await alertModel.find({
      type: 'viaje_completado',
      timestamp: {
        $gte: startDate,
        $lt: endDate
      }
    });

    return congestionAlerts;
  } catch (error) {
    console.error(error);
    throw new RepositoryError("No se pudieron obtener las alertas de congestión para el rango de fechas especificado.");
  }
};

exports.saveAlert = async (alert) => {
  try {
    const newAlert = new alertModel(alert);
    return await newAlert.save();
  } catch (error) {
      console.error(error);
      throw new RepositoryError("No se pudo guardar la alerta en la base de datos.");
  }
}

exports.findAlertsForToday = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  try {
    const alertsToday = await alertModel.find({
      timestamp: {
        $gte: today,
        $lt: tomorrow
      }
    });

    return alertsToday;
  } catch (error) {
    console.error(error);
    throw new RepositoryError("No se pudieron obtener las alertas del día de hoy.");
  }
};
