var express = require('express');
var path = require("path");
var logger = require('morgan');
//var bodyParser = require("body-parser");
//var apiRouter = require ("./routes/api_router.js");
//app.use(logger('dev'));
//console.log("LOADED");
const md5 = require('md5');
const session = require('express-session');
var app = express();
var options = {secret: 'Top secret do not enter'}
app.use(session(options)); //initialize new session
var currentSession; 
const userdb = [];

var staticPath = path.resolve(__dirname, "static");
app.use(express.static(staticPath));
var publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

var routesPath = path.join(__dirname, 'routes');
app.use(express.static(routesPath));


//to add views to the webpage
app.set("views", path.resolve(__dirname, "views"));
app.set('view engine', 'jade');
app.use(express.urlencoded({extended: false})); //Bodyparser now uses express.urlencoded()https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4
 //voor testfunctie 

app.get("/testindex", (req, res) => {
  if (req.session.username == undefined){
    res.render("index", {name: 'not a user'})
  }
  else{
  res.render("index", {name: req.session.username});
  }
})

app.get('/login', (req, res) => {
  res.render("login");
})

app.post('/login', (req, res) => {
   // if (querry result == true)
   
  req.session.username = req.body.username //store username in the session object.
  currentSession = req.session;
  if(currentSession.id){
    res.redirect('/testindex');
  }
  else{
    res.redirect('/register');
  }
  //need to check and create a session store session id in cookie?
});

app.get('/register', (req, res) => {
  res.render("register");
});

app.post('/register', async (req, res) => { //asynchronous because encyrpting a password with a hash funciton can take some time!
  try {
    const HashPass = md5(req.body.password)
    userdb.push({
      username: req.body.username,
      email: req.body.email,
      password: HashPass
    });
    res.redirect("/login");
  }                                    //try catch to check if the funciton is not stuck 
  catch(err) {
    res.redirect("/register");
    alert("Something has gone wrong");
  }
  console.log(userdb)
});


//app.use("/routes", apiRouter)



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
