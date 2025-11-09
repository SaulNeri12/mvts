var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loadRouter = require('./src/routers/loadRoutes');
const connectDB = require('./src/config/db');

var app = express();
connectDB(); //dattabase connection

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/loads', loadRouter); // load routes

app.listen(3000, () => {
	console.log("Server running at port: 3000");
});

module.exports = app;
