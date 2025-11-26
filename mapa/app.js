var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

(async () => {
    try {
      // TODO: PARA DESPUES
      //console.log("Iniciando consumidor de RabbitMQ...");
      //startRabbitConsumer();        // Colas

      const PORT = process.env.SERVICE_PORT || 3004;
      const SERVICE_NAME = process.env.SERVICE_NAME || "mapa-rutas";
      app.listen(PORT, () => {
          console.log(`[*] ${SERVICE_NAME} ejecutandose en el puerto: ${PORT}`);
      });
  } catch (err) {
    console.error("[x] Error inicializando servicio :" + SERVICE_NAME, err);
  }
})();

module.exports = app;
