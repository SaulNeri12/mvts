require('dotenv').config();
const http = require('http');
const cors = require('cors');
const express = require('express');
const socketio = require('socket.io');
const seedUsers = require('./src/utils/users.seeder');
const connectDB = require('./src/config/mongo.config');
const seedSessions = require('./src/utils/session.seeder');
const { initSocket } = require('./src/config/socket.config');
const errorHandler = require('./src/middlewares/error.middleware');
const userPublicRouter = require('./src/routers/public/session.router');
const userPrivateRouter = require('./src/routers/private/session.router');
const lightPrivateRouter = require('./src/routers/private/lights.router')

const app = express();
const server = http.createServer(app);

const PORT = process.env.SERVICE_PORT || 8080;
const SERVICE_NAME = process.env.SERVICE_NAME || 'gateway-service';


(async () => {
  try {
    // Connect to the mongo DB
    await connectDB();
    await seedUsers(); // insert the user
    await seedSessions(); // insert the sessions

    setUpExternalMiddlewares();
    setUpSocketIO();
    setUpRabbitMQConsumers();
    setUpPublicRoutes();
    setUpPrivateRoutes();
    setUpInternallMiddlewares();

    server.listen(PORT, () => {
      console.log(`${SERVICE_NAME} executing in port: ${PORT}`);
    });
  } catch (err) {
    console.error("An error occurred while initializing the service: ", err);
  }
})();    

function setUpExternalMiddlewares() {
  app.use(express.json()); // Middleware to parse JSON bodies

  // Setup CORS for HTTP requests
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }));
}

function setUpSocketIO() {
  initSocket(server);
}

function setUpRabbitMQConsumers(){
  const TelemetryConsumer = require('./src/infrestructure/consumer/telemetry.consumer');
  //const AlertsConsumer = require('./src/infrestructure/consumer/alerts.consumer');
  const LightsConsumer = require('./src/infrestructure/consumer/lights.consumer');
  const AlertasViajesCompletadosConsumer = require('./src/infrestructure/consumer/alerts.viajes.consumer');

  TelemetryConsumer.startConsuming();
  AlertasViajesCompletadosConsumer.startConsuming();
  //AlertsConsumer.startConsuming();
  LightsConsumer.startConsuming();
}

function setUpPublicRoutes(){
  // public routes
  app.use('/user', userPublicRouter);
}

function setUpPrivateRoutes(){
  // private routes
  app.use('/user', userPrivateRouter);
  app.use('/api/v1/lights', lightPrivateRouter);
}

function setUpInternallMiddlewares(){
  app.use(errorHandler); // Middleware to handle custom errors
}