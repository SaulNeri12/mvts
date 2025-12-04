// mvts/semaforos/app.js
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();

const PORT = process.env.SERVICE_PORT || 3050;

const connectDB = require('./config/db');
const loadSemaforos = require('./bootstrap/loadSemaforos');
const startSemaforosScheduler = require('./scheduler/semaforosScheduler');
const seedLights = require('./utils/lights.seeder');
const { connectRabbit } = require('./messaging/rabbit');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var statusRouter = require('./routes/status');
var semaforosRouter = require('./routes/semaforos'); // <--- 1. IMPORTAR NUEVA RUTA

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);

app.use('/api/v1/status', statusRouter);
app.use('/api/v1/semaforos', semaforosRouter); // <--- 2. USAR NUEVA RUTA

// Secuencia de inicialización
(async () => {
    try {
        await connectRabbit();
        await connectDB();
        await seedLights(); 
        await loadSemaforos();
        startSemaforosScheduler();
        console.log('Servicio de Semáforos inicializado y corriendo.');
    } catch (error) {
        console.error('Fallo crítico al inicializar el Servicio de Semáforos.');
    }
})();

app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`);
});

module.exports = app;