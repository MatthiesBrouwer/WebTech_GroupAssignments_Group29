var express = require('express');
var path = require("path");
var logger = require('morgan');

//A database server class that handles the queries with function abstractions
var DatabaseServer = require("./lib/database-server");
var databaseServer = new DatabaseServer("database.db");
databaseServer.testfunction();

//var bodyParser = require("body-parser");
//var apiRouter = require ("./routes/api_router.js");
//app.use(logger('dev'));
//console.log("LOADED");
const md5 = require('md5');
const session = require('express-session');
const { Database } = require('sqlite3');
var app = express();
var options = {secret: 'Top secret do not enter', cookie: { maxAge: 60 * 60}} //1h login timer
app.use(session(options)); //use session middleware
var currentSession; 

//var staticPath = path.resolve(__dirname, "static");
//app.use(express.static(staticPath));
var publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

var routesPath = path.join(__dirname, 'routes');
app.use(express.static(routesPath));


//to add views to the webpage
//app.set("views", path.resolve(__dirname, "views"));
app.use(express.urlencoded({extended: false})); //Bodyparser now uses express.urlencoded()https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4

/* TEST FUNCTIES VOOR EJS */
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('pages/index');
});

app.get('/assessment', function(req, res) {

  databaseServer.getTopics( (quizTopics) => {
    console.log(quizTopics);
    res.render('pages/assessment', {
      quizTopics : quizTopics
    });
  });
});

/* EINDE TEST FUNCTIES VOOR EJS */
/*
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
  //req.session.regenerate(session(options)); //generating a new session id once logged in to reset the timer. 
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


var quizes = {
  "Quiz" : [
    {   
      "quiz_id":1,
      "quiz_question_type_id":1,
      "title":"History question",
      "problem_statement":"Tim-Berners-Lee invented HTML in",
      "enabled":true
    },
    {   
      "quiz_id":2,
      "quiz_question_type_id":2,
      "title":"Syntax question",
      "problem_statement":"What should be the first element of a HTML5 document?",
      "enabled":true
    },
  ]
};

app.get("/quiz/overview", (req, res) => {
  
  
  console.log("table: " + req.params.table);
  console.log("attributename: " + req.params.attributename);
  res.send(quizes);
});
*/

//app.use("/routes", apiRouter)
//console.log("Getting database server");
//console.log("Gotten database server: " + database_server);
//database_server.testfunction();

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
