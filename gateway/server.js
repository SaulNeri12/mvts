require('dotenv').config();
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const connectDB = require('./src/config/mongo.config');
const seedUsers = require('./src/utils/users.seeder');
const seedSessions = require('./src/utils/session.seeder');
const errorHandler = require('./src/middlewares/error.middleware');
const userPublicRouter = require('./src/routers/public/session.router');
const userPrivateRouter = require('./src/routers/private/session.router');

const app = express();
const server = http.createServer(app);

const PORT = process.env.SERVICE_PORT || 3000;
const SERVICE_NAME = process.env.SERVICE_NAME || 'gateway-service';


(async () => {
  try {
    // Connect to the mongo DB
    await connectDB();
    await seedUsers(); // insert the user
    await seedSessions(); // insert the sessions

    setUpExternalMiddlewares();
    setUpSocketIO();
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
  // Setup external middlewares here (e.g., CORS, logging)
  app.use(express.json()); // Middleware to parse JSON bodies

  // Setup CORS for HTTP requests
  app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }));
}

function setUpSocketIO() {
  const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
  });

  module.exports.io = io; // export the io object to be used in other modules
}

function setUpPublicRoutes(){
  // public routes
  app.use('/user', userPublicRouter);
}

function setUpPrivateRoutes(){
  // private routes
  app.use('/user', userPrivateRouter);
}

function setUpInternallMiddlewares(){
  app.use(errorHandler); // Middleware to handle custom errors
}