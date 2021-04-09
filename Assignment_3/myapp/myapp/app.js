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
var options = {secret: 'Top secret do not enter', cookie: { maxAge: 60 * 60 * 1000}} //1h login timer
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

  databaseServer.getTopicQuizes( (topicQuizes) => {
    
    res.render('pages/assessment', {
      topicQuizes : topicQuizes
    });
  });
  /*
  databaseServer.getTopics( (quizTopics) => {

    for (topic in quizTopics){
      databaseServer.getQuestionsByTopicId(topic.id, (quizes) => {
        topic.quizes = quizes;
      });
    }
    console.log(quizTopics);
    res.render('pages/assessment', {
      quizTopics : quizTopics
    });
  });*/
});

app.get('/assessment/quiz',  function (req, res) {
  console.log("GETTING QUIZ WITH ID: " + req.query.quizId);
  databaseServer.getQuizById(req.query.quizId, (quiz) => {
    console.log("GOTTEN: " + quiz);
    res.send(quiz);
  });

});

/* EINDE TEST FUNCTIES VOOR EJS */
/*
//voor testfunctie 

app.get("/testindex", (req, res) => {
  console.log(req.session.username)
  if (req.session.username == undefined){
    res.render("index", {name: req.session.name, username: req.session.username})
    
  }
  else{
  res.render("index", );
  }
})

app.get('/login', (req, res) => {
  if (req.session.isAuthenticated == true)
  res.render("index", {name: req.session.name, username: req.session.username});
  else{
  res.render('login');
  }
})

app.post('/login', (req, res) => {
   // if (querry result == true)
  //req.session.regenerate(session(options)); //generating a new session id once logged in to reset the timer. 
  //store username in the session object.
  let HashPass = md5(req.body.password);
  //currentSession = req.session;
  //if(currentSession.id){
  //  res.redirect('/testindex');
  //}
  //else{
    dbInstance.getUserByUsername(req.body.username, (user) => {
      if (user) { //check if user existst by username
        if(HashPass === user["password"]){ //easy to hack but simple implementation
          console.log("You are now logged in");
          req.session.isAuthenticated = true; 
          req.session.username = user["username"];
          req.session.name = user["firstname"];
          res.render("index", {name: user["firstname"], username: user["username"]});
          console.log(user["firstname"]);
        }
        else{
          console.log("Wrong username or password");
        }
      }
      else{
        console.log("this user doesn't exists");
        res.redirect("login")
      }
    })
    //res.redirect('/register');
  //}
  //need to check and create a session store session id in cookie?
});

app.get('/register', (req, res) => {
  res.render("register");
});

app.post('/register', async (req, res) => { //asynchronous because encyrpting a password with a hash funciton can take some time!
 // try {
    const HashPass = md5(req.body.password)
    dbInstance.getUserByUsername(req.body.username, (user) => {
    if (!user){
      console.log("user is not found in the db");
      dbInstance.addNewUser(req.body.firstName, req.body.middleName, req.body.lastName,req.body.username, HashPass);
      res.redirect("/login");
    }
    else{
      console.log("This user already exists");
      res.redirect("/login");
    }  
      
    //console.log(user)//assynchroom
    
    
    })  
    userdb.push({
      username: req.body.username,
      email: req.body.email,
      password: HashPass
    }); 
    
//  }                                    //try catch to check if the funciton is not stuck 
  //catch(err) {
  //  res.redirect("/register");
 //   console.log("Something has gone wrong");
 // }
  //console.log(userdb)
    
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
