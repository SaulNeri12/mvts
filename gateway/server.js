const express = require('express');
const usersRouter = require('./src/routers/user.routes');
const outhRouter = require('./src/routers/auth.router');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies


app.use('/', usersRouter);
app.use('/', outhRouter);

const PORT = process.env.SERVICE_PORT;
const SERVICE_NAME = process.env.SERVICE_NAME;

(async () => {
    try {
      //console.log("Iniciando consumidor de RabbitMQ...");
      //startRabbitConsumer();        // Colas

      app.listen(PORT, () => {
          console.log(`${SERVICE_NAME} executing in port: ${PORT}`);
      });
  } catch (err) {
    console.error("An error ocurrred while initialiting the: " + SERVICE_NAME, err);
  }
})();