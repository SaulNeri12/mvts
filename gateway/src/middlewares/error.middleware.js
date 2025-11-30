const { AppError } = require('../errors');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      error: err.message
    });
  }

  return res.status(500).json({
    status: 500,
    error: 'Error interno del servidor'
  });
}

module.exports = errorHandler;
