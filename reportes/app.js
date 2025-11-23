
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); // Recomendado
require('dotenv').config();

const connectDB = require('./config/db');
const startRabbitConsumer = require('./messaging/rabbit');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var reportesRouter = require('./routes/reportes'); // Importar rutas

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/reportes', reportesRouter); // Endpoint base

// Inicialización de servicios de fondo
(async () => {
    await connectDB(); // 1. Conectar BD
    startRabbitConsumer(); // 2. Iniciar escucha de colas
})();

const PORT = process.env.SERVICE_PORT || 3002;
app.listen(PORT, () => {
    console.log(`Reportes Service running at port: ${PORT}`);
});

module.exports = app;
