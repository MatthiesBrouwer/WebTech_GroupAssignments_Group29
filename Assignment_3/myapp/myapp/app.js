var express = require('express');
var path = require("path");
var logger = require('morgan');

//A database server class that handles the queries with function abstractions
var DatabaseServer = require("./lib/database-server");
var dbInstance = new DatabaseServer("database.db");

//var bodyParser = require("body-parser");
//var apiRouter = require ("./routes/api_router.js");
//app.use(logger('dev'));
//console.log("LOADED");
const md5 = require('md5');
const session = require('express-session');
const { Database } = require('sqlite3');
const { nextTick } = require('process');
const e = require('express');
var app = express();

var options = {secret: 'Top secret do not enter', cookie: { maxAge: 60 * 60 * 1000}} //1h login timer
app.use(session(options)); //use session middleware
//var currentSession; 

//var staticPath = path.resolve(__dirname, "static");
//app.use(express.static(staticPath));
var publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

var routesPath = path.join(__dirname, 'routes');
app.use(express.static(routesPath));


//to add views to the webpage
//app.set("views", path.resolve(__dirname, "views"));
app.use(express.urlencoded({extended: false})); //Bodyparser now uses express.urlencoded()https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4

/* TEST FUNCTIES VOOR EJS */ // Can be placed in api router if done prperly
app.set('view engine', 'ejs');

app.use(logger('tiny')).get('/', function(req, res) {
  req.session.isAuthenticated = true; //Backdoor remove after
  req.session.username = "Admin";     //Backdoor remove after
  req.session.name = "Admin";  
  res.render('pages/index', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
  console.log(req.session.username);
});

app.use(logger('tiny')).get('/history', (req,res) =>{
  res.render('pages/history', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});

app.use(logger('tiny')).get('/tutorial', (req,res) =>{
  res.render('pages/tutorial', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});

app.use(logger('tiny')).get('/contact', (req,res) =>{
  res.render('pages/contact', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});

app.use(logger('tiny')).get('/best-practices', (req,res) =>{
  res.render('pages/best-practices', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});

app.use(logger('tiny')).get('/assessment', function(req, res) {
  res.render('pages/assessment', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});



// app.get('/assessment/overview/*)
// app.get('/assessment/overview/topics')
// app.get('/assessment/overview/quiz/:quizId')
// app.get('/assessment/overview/reports')
// app.get('/assessment/quizAttempt/newAttempt')
// app.get('/assessment/quizAttempt/currentQuestion')
// app.get('/assessment/quizAttempt/nextQuestion')
// app.get('/assessment/quizAttempt/prevQuestion')
// app.post('/assessment/quizAttempt/answerQuestion') //info staat in body
// app.post('/assessment/quizAttempt/finishAttempt') //returned results naar client en logged final score in database
// app.get('/assessment/quizAttempt/cancelAttempt')


function requireAuthentication(req, res, next){
  if(req.session.isAuthenticated){
    console.log("\t user is authenticated");
    next();
  }
  else{
    console.log("\t User is niet authenticated");
    return next();
  }
}

function requireActiveAttempt(req, res, next){
  if(req.session.activeAttemptId){
    console.log("\t user heeft active attempt");
    next();
  }
  else{
    console.log("\t User heeft geen active attempt");
    return next();
  }
}

//Deze route vangt alle calls naar een overview en checked of de user bezig is met een quiz.
//If so, dan wordt de user geredirect naar de laatste quizvraag van de attempt waar de user mee bezig was
app.use(logger('tiny')).get('/assessment/overview/*', function(req, res, next){
  console.log("CAUGHT DOOR * ROUTER")
  if(req.session.isAuthenticated && req.session.activeAttemptId){
    // De user is nog bezig met een attempt.
    // Stuur de attempt en de huidige vraag
    console.log("Attempt is active, redirect naar huidige vraag");
    res.redirect('/assessment/quizAttempt/currentQuestion');
  }
  else{
    //User is nog niet bezig met een attempt. Laat request doorgaan as normal.
    console.log("No active attempt, loading requested overview")
    next();
  }
});


app.use(logger('tiny')).get('/assessment/overview/topics',  function(req, res){
  console.log("Got here");
  dbInstance.getTopicQuizes( (topicQuizes) => {
      
    console.log("SENDING: " + topicQuizes);
    res.send({activeAttempt: 0, topicQuizes: topicQuizes, isLoggedIn: req.session.isAuthenticated}); 
  });
});

app.use(logger('tiny')).get('/assessment/overview/quiz/:quizId', function(req, res, next){
  dbInstance.getQuizById(req.params.quizId, (quiz) => {
    if(typeof quiz == 'undefined'){
      //send an error
      console.log("QUIZ WAS UNDEFINED");
      next();
    }
    else if(req.params.quizId <= 0){
      console.log("INVALID QUIZID");
      next();
    }
    else{
      dbInstance.getQuizQuestions(req.params.quizId, (questions) => {
        if(typeof questions == 'undefined' || questions == []){
          //send an error
          console.log("NO QUESTIONS FOUND!!!");
          next();
        }
        else{
          res.send({activeAttempt: 0, quiz: quiz, questions: questions, isLoggedIn: req.session.isAuthenticated});            
        }
      })
    }
  });
});

app.use(logger('tiny')).get('/assessment/overview/newAttempt/:quizId', requireAuthentication, function(req, res, next){
  console.log("Starting new attempt");
  
  dbInstance.addUserAttempt(req.session.username, req.params.quizId, req.sessionID, (userAttemptId)=>{
    console.log("IT PASSED")
    if(userAttemptId == 'undefined' || userAttemptId == []){
      //send an error
      console.log("ATTEMPT WAS UNDEFINED!!")
      next();
    }
    else{
      req.session.activeAttemptId = userAttemptId;
      req.session.activeAttemptQuizId = req.params.quizId; 
      req.session.activeAttemptQuestionIndex = 1;
      res.redirect('/assessment/quizAttempt/currentQuestion');
      //res.send({activeAttempt: 1, quiz: quiz, question: firstQuestion, isLoggedIn: req.session.isAuthenticated});
    }
  });
});

app.use(logger('tiny')).get('/assessment/quizAttempt/nextQuestion', requireAuthentication, requireActiveAttempt,  function(req, res, next){
  console.log("NEXT QUESTION HAS BEEN CALLED!");
  req.session.activeAttemptQuestionIndex += 1;
  res.redirect('/assessment/quizAttempt/currentQuestion');
});

app.use(logger('tiny')).get('/assessment/quizAttempt/currentQuestion', requireAuthentication, requireActiveAttempt,  function(req, res, next){
  console.log("GOT INTO THIS");
  console.log("REQ PARAMS: ");
  for (key in req.session){
    console.log("\t" + key + " : " + req.session[key]);
  }
  dbInstance.getQuizById(req.session.activeAttemptQuizId, (quiz) => {
    if(quiz == 'undefined' || quiz == []){
      console.log("COULD NOT FIND QUIZ");
      next();
    }
    console.log("GOT HERE BY QUIZ ID");
    dbInstance.getQuizQuestions(req.session.activeAttemptQuizId, (questionList) => {
      if(questionList == 'undefined' || questionList == []){
        console.log("COULD NOT FIND QUESTIONS");
        next();
      }
      console.log("GOT HERE BY QUIZ QUESTIONS");
      for (key in questionList){
        for(innerkey in questionList[key]){
          console.log("\t" + key + " : " + questionList[key] + " : " + questionList[key][innerkey]);

        }
      }
      dbInstance.getQuestionById(questionList[req.session.activeAttemptQuestionIndex - 1].id, (question)=>{
        dbInstance.getUserAttemptAnswer(req.session.activeAttemptId, question.id , (userAttemptAnswer) => {

          if(userAttemptAnswer != undefined){
            console.log("USER HAS ALREADY ANSWERED THIS QUESTION");
            
            for(option in question.answerOptions){
              if(question.answerOptions[option].correct){
                console.log("FOUND CORRECT ANSWER: " + question.answerOptions[option]);
                res.send({activeAttempt: 1, quiz: quiz, question: question, questionAnswer: {userAnswer: userAttemptAnswer.user_question_answer, correctAnswer: question.answerOptions[option].answer}, isLoggedIn: req.session.isAuthenticated});            
              }
            }
          }
          else{
            console.log("USER HAS NOT YET ANSWERED THIS QUESTION");
            console.log(question.id);
            res.send({activeAttempt: 1, quiz: quiz, question: question, questionAnswer: {userAnswer: undefined, correctAnswer: undefined}, isLoggedIn: req.session.isAuthenticated}); 
          }
        })
      })
    })
  });
});

//STATUSCODE 501 = Deze vraag is al een keer beantwoord
app.use(logger('tiny')).post('/assessment/quizAttempt/answerQuestion', requireAuthentication, requireActiveAttempt, function(req, res, next){
  console.log("RECEIVED ANSWER POST REQUIST");
  for(key in req.body){
    console.log("\t" + key + " : " + req.body[key]);
  }
  console.log("GOT HERE BY QUIZ ID");
  dbInstance.getQuizQuestions(req.session.activeAttemptQuizId, (questionList) => {
    if(questionList == 'undefined' || questionList == []){
      console.log("COULD NOT FIND QUESTIONS");
      next();
    }
    console.log("GOT HERE BY QUIZ QUESTIONS");
    for (key in questionList){
      console.log("\t" + key + " : " + questionList[key]);
    }
    if(questionList[req.session.activeAttemptQuestionIndex - 1].id != req.body.questionId){
      console.log("INVALID QUESTION IND");
      console.log("\t" + questionList[req.session.activeAttemptQuestionIndex -1].id + " : " + req.body.questionId);
      next();
    }

    dbInstance.getQuestionById(questionList[req.session.activeAttemptQuestionIndex - 1].id, (question)=>{
      dbInstance.getUserAttemptAnswer(req.session.activeAttemptId, question.id , (userAttemptAnswer) => {
        console.log("GOT TO THE END");
        console.log("SEARCHING FOR QUESTION: " + req.session.activeAttemptQuestionIndex);
        console.log("FOUND QUESTION: " + question);
        console.log("--");
        for (key in question){
          console.log("\t" + key + " : " + question[key]);
        }
        console.log("--");
        for (key in question.answerOptions){
          for(innerkey in question.answerOptions[key]){
            console.log("\t" + key + " : " + innerkey + " : " +  question.answerOptions[key][innerkey]);

          }
        }
        console.log("USER ATTEMPT ANSWER");
        for (key in userAttemptAnswer){
          console.log("\t" + key + " : " + userAttemptAnswer[key]);
        }
        if(userAttemptAnswer != undefined){
          console.log("USER HAS ALREADY ANSWERED THIS QUESTION");
          next();
        }
        else{
          console.log("USER HAS NOT YET ANSWERED THIS QUESTION");
          for(option in question.answerOptions){
            console.log(question.answerOptions[option]);
            if(question.answerOptions[option].correct){
              console.log("FOUND CORRECT ANSWER: " + question.answerOptions[option].answer);
              dbInstance.addUserAttemptAnswer(question.id, req.session.activeAttemptId, req.body.answer, ((question.answerOptions[option].answer == req.body.answer)? true : false), () => {
                res.send({activeAttempt: 1, quiz: quiz, question: question, questionAnswer: {userAnswer: req.body.answer, correctAnswer: question.answerOptions[option].answer}, isLoggedIn: req.session.isAuthenticated});            

              });
            }
          }
        }
      })
    })
  })
});








app.use(logger('tiny')).get('/register', (req, res) => {
  if (req.session.isAuthenticated == true){
    res.redirect("/"); //logged in people cannot register
  }
  else {
    res.render('pages/register', {isLoggedIn: req.session.isAuthenticated, registerFault: false} )
  }
});

app.use(logger('tiny')).post('/register', (req, res) =>{
  const HashPass = md5(req.body.regPassword);
  dbInstance.getUserByUsername(req.body.regUsername, (user) => {
    if (!user){
      console.log("user is not found in the db");
      dbInstance.addNewUser(req.body.regFirstname, req.body.regMiddlename, req.body.regLastname,req.body.regUsername, HashPass);
      res.redirect("/login");
    }
    else{
    console.log("This user already exists");
    res.render("pages/register", {isLoggedIn: req.session.isAuthenticated, registerFault: true});
    }
  });      
});

app.use(logger('tiny')).get('/login', (req, res) => {
  if (req.session.isAuthenticated == true){
  res.redirect("/"); //{name: req.session.name, username: req.session.username, isLoggedIn: req.session.isAuthenticated}
  }
  else{    
  res.render('pages/login', {isLoggedIn: req.session.isAuthenticated, loginFault: false}); //
  }
});

app.use(logger('tiny')).post('/login', (req, res) => {
 let HashPass = md5(req.body.authPassword);
  dbInstance.getUserByUsername(req.body.authUsername, (user) => {
    if (user) { //check if user existst by username
      if(HashPass === user["password"]){ //easy to hack but simple implementation
        console.log("You are now logged in");
        req.session.isAuthenticated = true; 
        req.session.username = user["username"];
        req.session.name = user["firstname"];
        res.redirect('/');
        //res.render("pages/index", {name: user["firstname"], username: user["username"], isLoggedIn: req.session.isAuthenticated});
        console.log(req.session.username);
        console.log(user["firstname"]);
      }
      else{
        console.log("Wrong password");
        res.render("pages/login", {isLoggedIn: req.session.isAuthenticated, loginFault: true }) //communicates that there has been a false attempt 
      }
     }
     else{
      console.log("Wrong username");
      res.render("pages/login", {isLoggedIn: req.session.isAuthenticated, loginFault: true }) //communicates that there has been a false attempt 
     }
   })
});

app.use(logger('tiny')).get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect("/")
});



var createError = require('http-errors');
const { Hash } = require('crypto');
// catch 404 and forward to error handler
app.use(function(err, req, res, next) {
  console.log("CAUGHT 404");
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

module.exports = app; 
