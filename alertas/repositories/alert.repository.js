const alertModel = require('../models/alert.model');
const { RepositoryError } = require('../errors/errors')


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