require('dotenv').config();
const express = require('express');
const connectDB = require('./src/config/mongo.config');
const seedUsers = require('./src/utils/users.seeder');
const seedSessions = require('./src/utils/session.seeder');
const errorHandler = require('./src/middlewares/error.middleware');
const userPublicRouter = require('./src/routers/public/session.router');
const userPrivateRouter = require('./src/routers/private/session.router');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use(errorHandler); // Middleware to handle custom errorsnode

//public routes
app.use('/user', userPublicRouter);

//private routes
app.use('/user', userPrivateRouter);

const PORT = process.env.SERVICE_PORT;
const SERVICE_NAME = process.env.SERVICE_NAME;

(async () => {
    try {
      //Connect to the mongo DB
      await connectDB();
      //await seedUsers(); //insert the user
      //await seedSessions(); //insert the sessions

      //star the queues listeners
      //console.log("Iniciando consumidor de RabbitMQ...");
      //startRabbitConsumer();  // Colas

      app.listen(PORT, () => {
          console.log(`${SERVICE_NAME} executing in port: ${PORT}`);
      });
  } catch (err) {
    console.error("An error ocurrred while initialiting the: " + SERVICE_NAME, err);
  }
})();