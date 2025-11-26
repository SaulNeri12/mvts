var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loadRouter = require('./src/routers/loadRoutes');
const connectDB = require('./src/config/db');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/loads', loadRouter); // load routes

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
