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

app.get('/', function(req, res) {
  res.render('pages/index', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
  console.log(req.session.username);
});

app.get('/history', (req,res) =>{
  res.render('pages/history', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});

app.get('/tutorial', (req,res) =>{
  res.render('pages/tutorial', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});

app.get('/contact', (req,res) =>{
  res.render('pages/contact', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});

app.get('/best-practices', (req,res) =>{
  res.render('pages/best-practices', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});

app.get('/assessment', function(req, res) {
  res.render('pages/assessment', {name: req.session.name, isLoggedIn: req.session.isAuthenticated});
});


app.get('/assessment/topicOverview', function(req, res){
  console.log("PAGE ASKED FOR TOPIC OVERVIEW");
  if(req.session.isAuthenticated && req.session.activeAttempt){
    console.log("USER IS AUTHENTICATED AND HAS AN ACTIVE ATTEMPT")
    dbInstance.getUserAttemptById(req.session.activeAttempt, (attempt) => {
      if(attempt == undefined){
        //something went wrong, redirect to main page
        console.log("NO ATTEMPT FOUND ON: " + req.session.activeAttempt);
      }
      else{
        console.log("SENDING ANSWER")
        console.log(attempt);
        for(key in attempt){
          console.log(key + " : " + attempt[key]);
          }console.log("REDIRECTING TO : " + 'assessment/quiz/' + attempt.quiz_id + '/question/' + req.session.prevQuestionIndex)
        res.redirect('/assessment/quiz/:quizId/question/:questionIndex');
      }
    });
  }else{
    //USER IS NOG NIET BEZIG MET DEZE QUIZ
    //  TODO: Laad de topic overview
    // Verstuur: attemptStatus
    console.log("\n\tASSESSMENT PAGE LOGGING:");
    console.log("\t\tAUTHENTICATED: " + req.session.isAuthenticated);
    console.log("\t\tUSER ATTEMPT: " + req.session.activeAttempt);
    dbInstance.getTopicQuizes( (topicQuizes) => {
      
      console.log("SENDING: " + topicQuizes);
      res.send({activeAttempt: 0, topicQuizes: topicQuizes, isLoggedIn: req.session.isAuthenticated}); 
    });
  }
});


app.get('/assessment/quizOverview/:quizId', function(req, res){
  if(req.session.isAuthenticated && req.session.activeAttempt){
    dbInstance.getUserAttemptById(req.session.activeAttempt, (attempt) => {
      if(!attempt){
        //something went wrong, redirect to main page
      }
      else{
        res.redirect('/assessment/quiz/' + attempt.quiz_id + 'question/' + req.session.prevQuestionIndex);
      }
    });
  }else if(req.params.quizId){
    //USER IS NOG NIET BEZIG MET DEZE QUIZ
    //  TODO: Laad de topic overview
    // Verstuur: attemptStatus
    
    dbInstance.getQuizById(req.params.quizId, (quiz) => {
      if(!quiz){
        //send an error
      }
      else{
        dbInstance.getQuizQuestions(req.params.quizId, (questions) => {
          if(!questions){
            //send an error
            console.log("NO QUESTIONS FOUND!!!");
          }
          else{
            
            res.send({activeAttempt: 0, quiz: quiz, questions: questions, isLoggedIn: req.session.isAuthenticated});            
          }
        })
      }
    });
  }
});


app.get('/assessment/quiz/:quizId/newAttempt', function(req, res) {
  console.log("NEW ATTEMPT REQUEST");
  if(req.session.isAuthenticated){
    if(!req.session.activeAttempt){
      //USER IS NOG NIET BEZIG MET EEN ATTEMPT EN IS INGELOGD
      dbInstance.addUserAttempt(req.session.username, req.params.quizId, req.sessionID, (quiz, firstQuestion, userAttemptId)=>{
        if(!quiz || !firstQuestion){
          //send an error
        }
        else{
          console.log("STARTING ACTIVE ATTEMPT");
          req.session.activeAttempt = userAttemptId;
          req.session.prevQuestionIndex = 1;
          console.log("ACTIVE ATTEMPT ID: " + req.session.activeAttempt);
          console.log("ACTIVE ATTEMPT ID: " + userAttemptId);
          console.log("PREVQUESITION INDEX: " + req.session.prevQuestionIndex);
          res.send({activeAttempt: 1, quiz: quiz, question: firstQuestion, questionIndex: 1, isLoggedIn: req.session.isAuthenticated});
        }
      })
    }
    else{
      dbInstance.getUserAttemptById(req.session.activeAttempt, (attempt) => {
        if(!attempt){
          //something went wrong, redirect to main page
          res.redirect('/assessment');
        }
        else{
          //USER IS AL BEZIG MET EEN ATTEMPT. REDIRECT
          res.redirect('/assessment/quiz/:quizId/question/:questionIndex');
        }
      });    
    }
  }
  else{
    //USER IS NOG NIET INGELOGD MAAR WIL WEL EEN ATTEMPT STARTEN. IETS GING FOUT
    console.log("SOMETHING HAS GONE WRONG")
    res.redirect('/assessment');
  }
});


app.get('/assessment/quiz/:quizId/question/:questionIndex', function(req, res) { 
  console.log("NEW LOAD QUESTION REQUEST OBTAINED");
  console.log("PARAMS: " + req.params.quizId + " : " + req.params.questionIndex);
  if(req.session.isAuthenticated && req.session.activeAttempt){
    dbInstance.getUserAttemptById(req.session.activeAttempt, (attempt) => {
      if(!attempt){
        //verstuur een error
        console.log("NO ATTEMPT FOUND");
      }
      else{
        dbInstance.getQuizById((req.params.quizId == attempt.quiz_id) ? req.params.quizId : attempt.quiz_id, (quiz) => {
          if(!quiz){
            //verstuur een error
            console.log("NO QUIZ FOUND");

          }
          else{
            dbInstance.getQuizQuestions(quiz.id, (questionList) => { 
              if(!questionList ){ 
                //verstuur een error
                console.log("ERROR: GEEN QUESTIONLIST OF VERKEERDE INDEX")
              }
              else{
                console.log("PREVQUESITION INDEX: " + req.session.prevQuestionIndex);

                questionIndex = (req.params.questionIndex > questionList.length) ? req.params.questionIndex : req.session.prevQuestionIndex;
                dbInstance.getQuestionById(questionList[questionIndex], (question) => {
                  if(!question){
                    //throw an error
                  }
                  else{
                    dbInstance.getUserAttemptAnswer(req.session.activeAttempt, question.id, (userAttemptAnswer) => {
                      req.session.prevQuestionIndex = questionIndex;
                      if(userAttemptAnswer){
                        res.send({activeAttempt: 1, quiz: quiz, question: question, questionIndex: req.session.prevQuestionIndex, userAttemptAnswer: userAttemptAnswer, isLoggedIn: req.session.isAuthenticated});
                      }
                      else{
                        res.send({activeAttempt: 1, quiz: quiz, question: question, questionIndex: req.session.prevQuestionIndex, isLoggedIn: req.session.isAuthenticated}); 
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }else{
    //USER IS NOG NIET INGELOGD MAAR WIL WEL EEN ATTEMPT ITEREREN
    console.log("SOMETHING HAS GONE WRONG")
    res.redirect('/assessment');
  }
});













/*
app.get('/assessment/quiz/:quizId/question/:questionIndex', function(req, res) {
  console.log("\nASSESSMENT PAGE ROUTER CALLED: ");
  console.log("\tQUIZID: " + req.params.quizId);
  console.log("\tQUESTIONID: " + req.params.questionId);

  if(req.session.isAuthenticated && req.session.activeAttempt){
    dbInstance.getUserAttemptById(req.session.activeAttempt, (attempt) => {
      if(!attempt){
        //verstuur een error
      }
      else{
        dbInstance.getQuizById((req.params.quizId == attempt.quiz_id) ? req.params.quizId : attempt.quiz_id, (quiz) => {
          if(!quiz){
            //verstuur een error
          }
          else{
            dbInstance.getQuizQuestions(quiz.id, (questionList) => { //(req.params.questionId != 0) ? req.params.questionId : req.session.quizAttemptQuestion, (question) => {
            //dbInstance.getQuestionById((req.params.questionId != 0) ? req.params.questionId : req.session.quizAttemptQuestion, (question) => {
              if(!questionList ){ //question.quiz_id != attempt.quiz_id){
                //verstuur een error
                console.log("ERROR: GEEN QUESTIONLIST OF VERKEERDE INDEX")
              }
              else{
                questionIndex = (req.params.questionIndex > sizeof(questionList)) ? req.params.questionIndex : req.session.prevQuestionIndex;
                dbInstance.getQuestionById(questionList[questionIndex], (question) => {
                  if(!question){
                    //throw an error
                  }
                  else{
                    dbInstance.getUserAttemptAnswer(req.session.activeAttempt, question.id, (userAttemptAnswer) => {
                      req.session.prevQuestionIndex = questionIndex;
                      if(userAttemptAnswer){
                        res.send({activeAttempt: 1, quiz: quiz, question: question, userAttemptAnswer: userAttemptAnswer, isLoggedIn: req.session.isAuthenticated});
                      }
                      else{
                        res.send({activeAttempt: 1, quiz: quiz, question: question, isLoggedIn: req.session.isAuthenticated}); 
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }
  else if(req.params.quizId > 0 && req.params.questionId == 0){
    console.log("\n\tASSESSMENT PAGE LOGGING:\n\t");
    console.log("\t\tAUTHENTICATED: " + req.session.isAuthenticated);
    console.log("\t\tUSER ATTEMPT: " + req.session.activeAttempt);
    console.log("\t\tVIEWING QUIZ: " + req.params.quizId);
    
    dbInstance.getQuizById(req.params.quizId, (quiz) => {
      if(!quiz){
        //send an error
      }
      dbInstance.getQuizQuestions(req.params.quizId, (questions) => {
        if(!questions){
          //send an error
        }
        console.log("GOTTEN: " + quiz);
        console.log("AND QUESTIONS: " + questions);
        res.send({activeAttempt: 0, quiz: quiz, questions: questions, isLoggedIn: req.session.isAuthenticated});
      })
    });
  }
  else{
    //USER IS NOG NIET BEZIG MET DEZE QUIZ
    //  TODO: Laad de topic overview
    // Verstuur: attemptStatus
    console.log("\n\tASSESSMENT PAGE LOGGING:");
    console.log("\t\tAUTHENTICATED: " + req.session.isAuthenticated);
    console.log("\t\tUSER ATTEMPT: " + req.session.activeAttempt);
    dbInstance.getTopicQuizes( (topicQuizes) => {
      
      console.log("SENDING: " + topicQuizes);
      res.send({activeAttempt: 0, topicQuizes: topicQuizes, isLoggedIn: req.session.isAuthenticated}); 
    });
  }
});

app.get('/assessment/topicOverview', function(req, res){
  if(req.session.isAuthenticated && req.session.activeAttempt){
    dbInstance.getUserAttemptById(req.session.activeAttempt, (attempt) => {
      if(!attempt){
        //something went wrong, redirect to main page
      }
      else{
        req.redirect('assessment/quiz/' + attempt.quiz_id + 'question/' + req.session.prevQuestionIndex);
      }
    }
  }
})


app.post('/assessment/quiz/:quizId/question/:questionId/answer/:answerId', function(req, res){
  if(req.session.isAuthenticated && req.session.activeAttempt){
    
    dbInstance.getUserAttemptById(req.session.activeAttempt, (attempt) => {
      if(req.query.quizId != attempt.quiz_id || req.query.questionId != req.session.activeAttemptQuestion){
        //stuur een error
      }
      dbInstance.addUserAttemptAnswer(req.session.activeAttempt, req.query.answerId, (exists) => {
        if(exists){
          //Send an error, the user has already answered this question before
        }
        dbInstance.getQuestionByid(req.query.questionId, (question) => {
          correctAnswer = question.answerList.find( (answer) => {return answer.id == req.query.answerId});
          if(!correctAnswer){
            //send an error, no correct answers exist
          }
          res.send({correctAnswer: correctAnswer});
        })
      })
    });
  }
  else{
    req.redirect('/assessment');
  }
});

app.get('/assessment/quiz/:quizId/newAttempt', function(req, res) {
  console.log("NEW ATTEMPT REQUEST");
  if(req.session.isAuthenticated && !req.session.activeAttempt){
    console.log("USER IS LOGGED IN AND HAS NO ATTEMPT ACTIVE")
    //User is logged in and does not have a session active

    dbInstance.addUserAttempt(req.session.username, req.params.quizId, req.sessionID, (quiz, firstQuestion, userAttemptId)=>{
      if(!quiz || !firstQuestion){
        //send an error
      }
      else{
        req.session.activeAttempt = userAttemptId;
        req.session.prevQuestionIndex = 1;
        res.send({activeAttempt: 1, quiz: quiz, question: firstQuestion, isLoggedIn: req.session.isAuthenticated});
      }
    })
  }
  else{
    console.log("USER IS EITHER NOT LOGGED IN OR HAS AN ACTIVE ATTEMPT. REDIRECT TO MAIN PAGE");
    //Something has gone wrong, redirect to the home assessment page for new referal
    req.redirect('/assessment');
  }
});












*/


















/*
app.get('/assessment/quizOverview',  function (req, res) {
  console.log("GETTING QUIZ WITH ID: " + req.query.quizId);
  dbInstance.getQuizById(req.query.quizId, (quiz) => {
    dbInstance.getAllQuestionsByQuizId(req.query.quizId, (questions) => {
      console.log("GOTTEN: " + quiz);
      console.log("AND QUESTIONS: " + questions);
      res.send({quiz: quiz, questions: questions, isLoggedIn: req.session.isAuthenticated});
    })
  });

});


app.get('/assessment/quiz/:quizId/question/:questionId', function(req, res){
  if(req.session.isAuthenticated && req.session.activeAttempt){
    dbInstance.getQuestionById(questionId, (question) => {
      if(!question){
        //throw an error
      }
      dbInstance.getQuestionAnswers(questionId, (answerList) => {
        if(!answerList){
          //throw an error
        }
        res.send({question: question, answerList: answerList});
      })
    })
  }
  else{
    //USER IS NOG NIET BEZIG MET DEZE QUIZ
    //  TODO: Laad de topic overview
    // Verstuur: attemptStatus
    dbInstance.getTopicQuizes( (topicQuizes) => {
      console.log("SENDING: " + topicQuizes);
      res.send({activeAttempt: 0, topicQuizes: topicQuizes, isLoggedIn: req.session.isAuthenticated}); 
    });
  }

});





//session.activeAttemptId (0 = no active attempt, >0 = attempt id)
//session.quizAttemptQuestion
app.get('/assessment/attemptStatus',  function (req, res) {
  if (req.session.isAuthenticated && req.session.activeAttempt){
    //USER IS BEZIG MET QUIZ ATTEMPT
    //  TODO: Laad de huidige question voor de actieve user attempt en stuur die naar de quiz
    //  Verstuur: attemptStatus, active quiz, active question, question attempt
    dbInstance.getUserAttemptById(req.session.activeAttempt, (attempt) => {
      if(!attempt){
        //verstuur een error
      }
      dbInstance.getQuizById(attempt.quiz_id, (quiz) => {
        if(!quiz){
          //verstuur een error
        }
        dbInstance.getQuestionById(req.session.quizAttemptQuestion, (currentQuestion) => {
          if(!currentQuestion){
            //verstuur een error
          }
          dbInstance.getQuestionAnswers(req.session.quizAttemptQuestion, (answerList) => {
            if(!answerList){
              //verstuur een error
            }
            dbInstance.getUserAttemptAnswer(req.session.activeAttempt, req.session.activeAttemptQuestion, (userAttemptAswer) => {
              if(userAttemptAnswer){
                res.send({activeAttempt: 1, quiz: quiz, currentQuestion: question, questionAnswers: answerList, userAttemptAnswer: userAttemptAnswer, isLoggedIn: req.session.isAuthenticated});
              }
              else{
                res.send({activeAttempt: 1, quiz: quiz, currentQuestion: question, questionAnswers: answerList, isLoggedIn: req.session.isAuthenticated}); 
              }
            })
          })
        })
      })
    })
  }
  else {
    //USER IS NOG NIET BEZIG MET DEZE QUIZ
    //  TODO: Laad de topic overview
    // Verstuur: attemptStatus
    dbInstance.getTopicQuizes( (topicQuizes) => {
      console.log("SENDING: " + topicQuizes);
      res.send({activeAttempt: 0, topicQuizes: topicQuizes, isLoggedIn: req.session.isAuthenticated}); 
    });
  }
});


app.post('/assessment/quiz/:quizId/question/:questionId/answer/:answerId', function(req, res){
  if(req.session.isAuthenticated && req.session.activeAttempt){
    dbInstance.newUserAttemptAnswer(req.session.activeAttempt, req.body.questionId, req.body.answerId, (userAnswer) =>{
      if(userAnswer.correct){
        res.send({correctAnswer: userAnswer.id});
      }
      else{
        dbInstance.getQuestionAnswer(req.body.questionId, (answerList) => {
          for(answer in answerList){
            if(answerList[answer].correct){
              res.send({correctAnswer: answerList[answer].id});
            }
          }
          //No correct answer found
          //Send an error
        })
      }
    });
  }else{
    //USER IS NOG NIET BEZIG MET DEZE QUIZ
    //  TODO: Laad de topic overview
    // Verstuur: attemptStatus
    dbInstance.getTopicQuizes( (topicQuizes) => {
      console.log("SENDING: " + topicQuizes);
      res.send({activeAttempt: 0, topicQuizes: topicQuizes, isLoggedIn: req.session.isAuthenticated}); 
    });
  }
});
*/



app.get('/register', (req, res) => {
  if (req.session.isAuthenticated == true){
    res.redirect("/"); //logged in people cannot register
  }
  else {
    res.render('pages/register', {isLoggedIn: req.session.isAuthenticated, registerFault: false} )
  }
});

app.post('/register', (req, res) =>{
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

app.get('/login', (req, res) => {
  if (req.session.isAuthenticated == true){
  res.redirect("/"); //{name: req.session.name, username: req.session.username, isLoggedIn: req.session.isAuthenticated}
  }
  else{    
  res.render('pages/login', {isLoggedIn: req.session.isAuthenticated, loginFault: false}); //
  }
});

app.post('/login', (req, res) => {
 let HashPass = md5(req.body.authPassword);
  dbInstance.getUserByUsername(req.body.authUsername, (user) => {
    if (user) { //check if user existst by username
      if(HashPass === md5(user["password"])){ //easy to hack but simple implementation
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
        console.log("Wrong username or password");
        res.render("pages/login", {isLoggedIn: req.session.isAuthenticated, loginFault: true }) //communicates that there has been a false attempt 
      }
     }
     else{
      console.log("Wrong username or password");
      res.render("pages/login", {isLoggedIn: req.session.isAuthenticated, loginFault: true }) //communicates that there has been a false attempt 
     }
   })
});

app.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect("/")
});



/* //lifehack om even snel een test user te registreren al dit nog niet gebeurd is
app.get('/register', function(req,res){
  dbInstance.addNewUser("Test","Test","Test","Test", md5("Test")); 
})
/*

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
}); */

module.exports = app; 
