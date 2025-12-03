var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var seedVehicles = require('./src/utils/vehicle.seeder');
var logger = require('morgan');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var vehicleRouter = require('./src/routers/vehicle.routes');
const connectDB = require('./src/config/db');
const connectRabbit = require('./src/config/rabbit');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/users', usersRouter);

app.use('/api/v1/vehicle', vehicleRouter);

(async () => {
    try {
        console.log("Conectando a MongoDB...");
        await connectDB();
        seedVehicles();
        console.log("Conectando a RabbitMQ...");
        await connectRabbit();

        const PORT = process.env.SERVICE_PORT || 3000;

        app.listen(PORT, () => {
            console.log(`[*] Vehiculos-service running at port ${PORT}`);
        });
		
    } catch (err) {
        console.error("[x] Error inicializando servicio:", err);
        process.exit(1);
    }
})();


module.exports = app;
