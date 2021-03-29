const express = require('express');
const path = require("path");
var logger = require('morgan');
//var bodyParser = require("body-parser");
var apiRouter = require ("./routes/api_router.js");

var app = express();

var staticPath = path.resolve(__dirname, "static");
app.use(express.static(staticPath));
var publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

//var routesPath = path.join(__dirname, 'routes');
//app.use(express.static(routesPath));

app.use(logger('dev'));
console.log("LOADED");
app.use(express.urlencoded({extended: false})); //Bodyparser now uses express.urlencoded()https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4
app.use("/routes", apiRouter)


module.exports = app;

/*const apiRouter = require("./routes/api_router");

app.use("/api", apiRouter);*/


/*var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;*/
