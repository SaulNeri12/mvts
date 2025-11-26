
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
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reportes', reportesRouter); // Endpoint base

// Inicialización de servicios de fondo

(async () => {
    try {
        console.log("Conectando a MongoDB...");
        await connectDB();            // Espera a que Mongo esté listo

        console.log("Iniciando consumidor de RabbitMQ...");
        startRabbitConsumer();        // Colas

        const PORT = process.env.SERVICE_PORT || 3002;
        app.listen(PORT, () => {
            console.log(`🚀 Reportes Service running at port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Error inicializando servicio:", err);
    }
})();