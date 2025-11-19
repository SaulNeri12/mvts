
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); // Para permitir peticiones AJAX del frontend
require('dotenv').config(); // Carga las variables de entorno

// Importa los módulos de inicialización y lógica
const connectDB = require('./config/db');
const loadSemaforos = require('./bootstrap/loadSemaforos');
const startSemaforosScheduler = require('./scheduler/semaforosScheduler');
const { connectRabbit } = require('./messaging/rabbit');

// Importa los routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var statusRouter = require('./routes/status'); // Router para el estado dinámico

var app = express();

app.use(cors()); // Habilita CORS
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Monta los routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/status', statusRouter); // Nuevo endpoint para el estado

// Secuencia de inicialización asíncrona
(async () => {
    try {
        await connectRabbit(); // Conecta a RabbitMQ
        await connectDB(); // Conecta a MongoDB
        await loadSemaforos(); // Carga instancias de semáforos a memoria
        startSemaforosScheduler(); // Inicia el ciclo de cambio de estado
        console.log('Servicio de Semáforos inicializado y corriendo.');
    } catch (error) {
        console.error('Fallo crítico al inicializar el Servicio de Semáforos. Deteniendo la aplicación.');
        // Opcional: process.exit(1); para detener la aplicación si la inicialización falla
    }
})();


app.listen(3001, () => {
	console.log("Server running at port: 3001");
});

module.exports = app;