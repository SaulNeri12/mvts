const AppError = require('../errors/app.error');

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Datos inválidos') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

class RepositoryError extends AppError {
  constructor(message = 'Error en base de datos') {
    super(message, 500);
  }
}

class TooManySessionsError extends AppError {
  constructor(message = 'Maximo de sesiones activas alcazado') {
    super(message, 403);
  }
}

class InternalError extends AppError {
  constructor(message = 'Error en el servidor') {
    super(message, 500);
  }
}


class ConflictError extends AppError {
  constructor(message = 'Conflicto') {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  RepositoryError,
  TooManySessionsError,
  InternalError,
  ConflictError
};
