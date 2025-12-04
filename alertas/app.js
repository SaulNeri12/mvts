

const connectDB = require('./config/mongo.config');

const telemetryConsumer = require('./infrastructure/consumer/telemetry.consumer');

require("dotenv").config();

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var alertsRouter = require('./routes/alerts.route');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/alerts', alertsRouter);

async function initializeConsumers() {
    telemetryConsumer.startConsuming();
}

(async () => {
    try {
        console.log("Conectando a MongoDB...");
        await connectDB();
        console.log("Iniciando consumidores");
        await initializeConsumers();

        const PORT = process.env.SERVICE_PORT || 3054;

        app.listen(PORT, () => {
            console.log(`[*] Alertas-service running at port ${PORT}`);
        });
		
    } catch (err) {
        console.error("[x] Error inicializando servicio:", err);
        process.exit(1);
    }
})();

module.exports = app;
