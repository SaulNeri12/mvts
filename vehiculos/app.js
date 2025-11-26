var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var vehicleRouter = require('./src/routers/vehicle.routes');
const connectDB = require('./src/config/db');
const connectRabbit = require('./src/config/rabbit');

var app = express();

/**
 * Starting
 */
(async () => {
	try {
		await connectDB(); //dattabase connection
		await connectRabbit(); //Init rabbitMQ
	} catch (error) {
		console.error('Critic failure starting the server: ', error);
	}
})();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', vehicleRouter); // load routes

(async () => {
    try {
        console.log("Conectando a MongoDB...");
        await connectDB();

        const PORT = process.env.SERVICE_PORT || 3002;

        app.listen(PORT, () => {
            console.log(`[*] Vehiculos-service running at port ${PORT}`);
        });
		
    } catch (err) {
        console.error("[x] Error inicializando servicio:", err);
    }
})();


module.exports = app;
