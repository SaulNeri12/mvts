

const connectDB = require('./config/mongo.config');

const viajesCompletadosConsumer = require('./infrastructure/consumer/viajes.completados.consumer');
const alertPublisher = require('./infrastructure/publisher/alertas.publisher');

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
    await viajesCompletadosConsumer.startConsuming();
}

async function initializePublishers() {
    await alertPublisher.initialize();
}

(async () => {
    try {
        console.log("Conectando a MongoDB...");
        await connectDB();

        console.log("Iniciando consumidores");
        await initializeConsumers();

        console.log("Iniciando publicadores");
        await initializePublishers();

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