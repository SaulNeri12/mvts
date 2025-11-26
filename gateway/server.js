const express = require('express');
const rateLimit = require('express-rate-limit');
const usersRouter = require('./src/routers/user.routes');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Rate limiting middleware configuration
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Maximum 100 requests per IP
  message: "Request limit exceeded. Please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

app.use(limiter); // Apply rate limiting to all requests

// Protected routes
app.use('/', usersRouter);

(async () => {
    try {
      // TODO: PARA DESPUES
      //console.log("Iniciando consumidor de RabbitMQ...");
      //startRabbitConsumer();        // Colas

      const PORT = process.env.SERVICE_PORT || 3000;
      const SERVICE_NAME = process.env.SERVICE_NAME || "api-gateway";
      app.listen(PORT, () => {
          console.log(`[*] ${SERVICE_NAME} ejecutandose en el puerto: ${PORT}`);
      });
  } catch (err) {
    console.error("[x] Error inicializando servicio :" + SERVICE_NAME, err);
  }
})();