const rateLimit = require('express-rate-limit');

class RateLimiter {
  
  static create(options = {}) {
    return rateLimit({
      windowMs: options.windowMs || 60 * 1000,
      max: options.max || 100,
      message: options.message || 'Demasiadas solicitudes, intenta más tarde',
      //keyGenerator: options.keyGenerator || ((req) => req.ip),
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  // Limiter para rutas públicas
  static public() {
    return RateLimiter.create({
      max: 20,
      windowMs: 60 * 1000,
      message: 'Límite de peticiones alcanzado intente en unos momentos.',
      //keyGenerator: (req) => req.ip,
    });
  }

  // Limiter para rutas privadas (usando ID)
  static private() {
    return RateLimiter.create({
      max: 200,
      windowMs: 60 * 1000,
      message: 'Límite de peticiones alcanzado intente en unos momentos.',     
      //keyGenerator: (req) => req.user?.id || req.ip
    });
  }
  
}

module.exports = RateLimiter;
