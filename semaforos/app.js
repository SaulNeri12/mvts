var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();

// === Variable de entorno para el puerto ===
const PORT = process.env.SERVICE_PORT || 3050;

// Importa los módulos de inicialización y lógica
const connectDB = require('./config/db');
const loadSemaforos = require('./bootstrap/loadSemaforos');
const startSemaforosScheduler = require('./scheduler/semaforosScheduler');
const { connectRabbit } = require('./messaging/rabbit');

// Importa los routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var statusRouter = require('./routes/status');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Monta los routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/status', statusRouter);

// Secuencia de inicialización asíncrona
(async () => {
    try {
        await connectRabbit();
        await connectDB();
        await loadSemaforos();
        startSemaforosScheduler();
        console.log('Servicio de Semáforos inicializado y corriendo.');
    } catch (error) {
        console.error('Fallo crítico al inicializar el Servicio de Semáforos. Deteniendo la aplicación.');
    }
})();

// === Escuchar en el puerto del entorno ===
app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`);
});

module.exports = app;
