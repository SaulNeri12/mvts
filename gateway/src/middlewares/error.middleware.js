const AppError = require('../errors/app.error');

function errorHandler(err, req, res, next) {

  // Error personalizado
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.message);
  }

  // Error normal de Javascript o cualquier otro
  console.error(err);
}

module.exports = errorHandler;

