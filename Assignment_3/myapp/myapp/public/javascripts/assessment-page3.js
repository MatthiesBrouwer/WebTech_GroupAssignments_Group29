


class Question { // Main class defining the question
    constructor(title, finalQuestion, problemStatement, questionId, userAnswer=undefined, correctAnswer=undefined){
        this.title = title; // has a title
        this.finalQuestion = finalQuestion; // Last question or not
        this.problemStatement = problemStatement; // Problem statement of the question
        this.questionId = questionId; // Question id
        this.userAnswer = userAnswer; // The answer given by the user
        this.correctAnswer = correctAnswer; // The correct answer
    }
};

Question.prototype.getQuestionDisplay = function(){ // create domstructure of a question (fill in the blanks or multiple choice)
    var questionSection = document.createElement('section'); // create a section for the question
    questionSection.setAttribute('class', 'main-content__text--base col-s__2 col-e__9 question-enclosure');
    var feedbackBox = document.createElement('img'); // create a feedback box which displays a image
    feedbackBox.setAttribute('id', 'questionForm__feedbackBox');

    feedbackBox.setAttribute('src', "images/assessment-feedbackicon-incorrect.png");
    feedbackBox.style.visibility = "hidden";

    questionSection.appendChild(feedbackBox);

    var questionHeading = document.createElement('h2'); // create a question heading
    questionHeading.setAttribute('class', "questionForm__title--base col-s__1 col-e__11 row-s__1 row-e__2");
    questionHeading.appendChild(document.createTextNode(this.title));
    questionSection.appendChild(questionHeading);

    var problemStatementHeading = document.createElement('h3'); // create a problem statement heading
    problemStatementHeading.setAttribute('class', "questionForm__problemStatement col-s__1 col-e__11 row-s__1 row-e__2");
    problemStatementHeading.appendChild(document.createTextNode(this.problemStatement));
    questionSection.appendChild(problemStatementHeading);
    return questionSection;
}

Question.prototype.submitAnswer = function(answerText){ // Sends the answer to the server and updates page
    var req = new XMLHttpRequest(); // AJAX object
    req.open("POST", "/assessment/quizAttempt/answerQuestion", true); // opens
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); // sets header
    req.onreadystatechange = () =>{
        if (req.readyState == 4 && req.status == 200) { // when finished and server is ready
            serverData = JSON.parse(req.responseText);    
            this.userAnswer = serverData.questionAnswer.userAnswer;
            this.correctAnswer = serverData.questionAnswer.correctAnswer;    
            
            
            this.displayResults();
        }
    }
    req.send("answer=" + answerText + "&questionId=" + this.questionId); // sends the answer + the id to the server
}

Question.prototype.displayResults = function(){   // function to display the results
    if(this.userAnswer != undefined){ 

        var submitButton = document.getElementById("questionForm__submitButton"); // domstructure of the diplaying of the results
        var progressButton = document.getElementById("questionForm__progressButton");
        var feedbackText = document.getElementById("questionForm__feedbackText");
        var feedbackBox = document.getElementById("questionForm__feedbackBox");
    


        submitButton.disabled = true;
        progressButton.disabled = false;
        feedbackText.style.visibility = "visible";
        feedbackBox.style.visibility = "visible";
    
        if(this.userAnswer != this.correctAnswer){ // if the answer of the user is not correct display a feedback
            feedbackText.setAttribute('class', "questionForm__feedbackText--incorrect");
            feedbackText.appendChild(document.createTextNode("Incorrect! The correct answer was: '" + this.correctAnswer + "', You answered: '" + this.userAnswer + "'.")); 
            feedbackBox.setAttribute('src', "images/assessment-feedbackicon-incorrect.png");
        }
        else{ // display correct feedback
            feedbackText.setAttribute('class', "questionForm__feedbackText--correct");
            feedbackText.appendChild(document.createTextNode("Correct! You answered: '" + this.userAnswer + "'."));
            feedbackBox.setAttribute('src', "images/assessment-feedbackicon-correct.png");
        }  
        return true;
    }
    else{
        console.log("USER HAS NOT YET ANSWERED THIS.");
        return false;
    }
}

class FillInBlanks extends Question{ // subclass of a question: Fill in the blanks
    constructor(title, finalQuestion, problemStatement, questionId, userAnswer=undefined, correctAnswer=undefined){
        console.log(userAnswer, correctAnswer);
        super(title, finalQuestion, problemStatement, questionId, userAnswer, correctAnswer);            //takes all the parameter inputs from the superclass constructor      
    }

    getQuestionDisplay(){ // display the questions of the fill in the blank class
        var questionSection = super.getQuestionDisplay(this);                               

        //form for identying input and label for the input (in this case label = the problem statement)
        var inputForm = document.createElement('form'); 
        inputForm.addEventListener('submit', this.submitAnswer.bind(this),false);
        inputForm.setAttribute('id', 'questionForm');
        var inputBox = document.createElement('input');
        var submitButton = document.createElement('input');         //the submit button for accessibility
        var progressButton = document.createElement('button'); 
        var feedbackText = document.createElement('label');  // the feedback test placement


        inputBox.setAttribute('type', 'text');
        inputBox.setAttribute('id', "questionForm__textInput");
        submitButton.setAttribute('type', 'submit');    
        submitButton.setAttribute('value', 'Submit');
        submitButton.setAttribute('id', "questionForm__submitButton");

        progressButton.setAttribute('id', "questionForm__progressButton");        
        if(!this.finalQuestion){ // if the question is not the last question create a text next question
            progressButton.appendChild(document.createTextNode('Next Question'));
            progressButton.addEventListener("click", nextQuestion);
        }
        else{
            progressButton.appendChild(document.createTextNode('Finish Quiz')); // if it is the last question create a node with finish quiz
            progressButton.addEventListener("click", finishQuiz);
        }
        feedbackText.setAttribute('id', "questionForm__feedbackText");
        
        inputForm.appendChild(inputBox);
        inputForm.appendChild(submitButton);
        questionSection.appendChild(inputForm); 
        questionSection.appendChild(progressButton);  
        questionSection.appendChild(feedbackText);
        return questionSection;
    }

    submitAnswer(event){ // function to submit the answer to the fill in the blanks questions
        event.preventDefault();
        var answerText = document.getElementById("questionForm__textInput").value;
        super.submitAnswer(answerText);
        var inputBox = document.getElementById("questionForm__textInput");
        inputBox.disabled = true; 
    }

    displayResults(){ // checks if the question is finished and update the display to the users results
        if(super.displayResults()){
            console.log("SHOWING FILL IN THE BLANKS RESULTS")
            var inputBox = document.getElementById("questionForm__textInput");

            inputBox.disabled = true;
        }
    }
}

class MultipleChoice extends Question{ // subclass of the class question for a multiple choice question
    constructor(title, finalQuestion, problemStatement, questionId, answerOptions, userAnswer=undefined, correctAnswer=undefined){
        super(title, finalQuestion, problemStatement, questionId, userAnswer, correctAnswer);            //takes all the parameter inputs from the superclass constructor      
        this.answerOptions = answerOptions;

    }

    getQuestionDisplay(){ // Dom display of the multiplechoice questions 
        var questionSection = super.getQuestionDisplay(this);                               

        //form for identying input and label for the input (in this case label = the problem statement)
        var inputForm = document.createElement('form'); 
        inputForm.addEventListener('submit', this.submitAnswer.bind(this),false);
        inputForm.setAttribute('id', 'questionForm');
        var submitButton = document.createElement('input');         //the submit button for accessibility
        var progressButton = document.createElement('button'); // next question or finish quiz button
        var feedbackText = document.createElement('label'); // the feedback text

        for (var i=0; i<this.answerOptions.length; i++){
            var optionLabel = document.createElement('label');
            optionLabel.setAttribute('class', "questionForm__optionLabel");
            optionLabel.setAttribute('id', "questionForm__optionLabel--" + i+1);
            optionLabel.setAttribute('for', 'questionForm__optionLabel--' + (i+1));

            var optionRadioInput = document.createElement('input');
            optionRadioInput.setAttribute('type','radio');  
            optionRadioInput.setAttribute('name', 'questionForm__optionButton'); 
            optionRadioInput.setAttribute('value', this.answerOptions[i].answer);
            optionRadioInput.setAttribute('id', 'questionForm__optionButton--' + (i+1));

            optionLabel.appendChild(optionRadioInput);
            optionLabel.appendChild(document.createTextNode(this.answerOptions[i].answer));
            
            inputForm.appendChild(optionLabel);
        }

        submitButton.setAttribute('type', 'submit');    
        submitButton.setAttribute('value', 'Submit');
        submitButton.setAttribute('id', "questionForm__submitButton");

        progressButton.setAttribute('id', "questionForm__progressButton");        
        if(!this.finalQuestion){ // if final question create node with next question
            progressButton.appendChild(document.createTextNode('Next Question'));
            progressButton.addEventListener("click", nextQuestion);
        }
        else{
            progressButton.appendChild(document.createTextNode('Finish Quiz')); // create finish quiz text otherwise
            progressButton.addEventListener("click", finishQuiz);
        }
        feedbackText.setAttribute('id', "questionForm__feedbackText");
        
        inputForm.appendChild(submitButton);
        questionSection.appendChild(inputForm); 
        questionSection.appendChild(progressButton);  
        questionSection.appendChild(feedbackText);
        
        return questionSection;
    }

    submitAnswer(event){ // sends the answer of the multiple choice questions
        event.preventDefault();

        var radioButtons = document.getElementsByName('questionForm__optionButton'); // a multiplechoice radio button

        for(var i=0; i < radioButtons.length; i++){
            console.log(radioButtons[i]);
            if(radioButtons[i].checked){ // if the button is checked
                console.log("FOUND BUTTON PRESSED: ")
                console.log( radioButtons[i].value);
                super.submitAnswer(radioButtons[i].value); // submit
                break;
            }
        }      
    }

    displayResults(){ //shows the result of the multiple choice questions
        //Super class returns wether the question was answered or not
        if(super.displayResults()){
            for (var i=0; i<this.answerOptions.length; i++){ 
                var optionRadioInput = document.getElementById("questionForm__optionButton--" + (i+1)); // loop through radio option buttons
                optionRadioInput.disabled = true;
            }     
        }
    }
}



function displayAttemptQuestion(quiz, question, finalQuestion, userAnswer, correctAnswer){
    var contentEnclosure = document.getElementById("main-content-enclosure"); // load the main content of the assesment page
    contentEnclosure.innerHTML = "";
 // Domstructure of the particular quiz
    var quizTitle = document.createElement("h1");  // display title
    quizTitle.appendChild(document.createTextNode(quiz.title));
    quizTitle.setAttribute('class', "quizAttempt__quizTitle");
    contentEnclosure.appendChild(quizTitle);

    if(question.quiz_question_type_id == 1){ // check what class of question and pass characteristics of the fill in the blanks question 
        var newQuestion = new FillInBlanks(question.title, finalQuestion, question.problem_statement, question.id, userAnswer, correctAnswer);
    }
    else{ // pass characteristics of the fill in the multiple choice question
        var newQuestion = new MultipleChoice(question.title, finalQuestion, question.problem_statement, question.id, question.answerOptions, userAnswer, correctAnswer);


    }
    console.log(newQuestion);
    contentEnclosure.appendChild(newQuestion.getQuestionDisplay()); //append the question to the html 
    newQuestion.displayResults(); //Update if you finish the question or not
}


function takeQuiz(event){ // notices the server to start a quiz 
    var req = new XMLHttpRequest(); // Ajax object
    req.open("GET", "/assessment/overview/newAttempt/" + this.getAttribute('data-id'), true);

    req.onreadystatechange = function() {
        console.log("Got attempt question");
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);

            if(!serverData.activeAttempt){ 
                //dont load the question if an active attempt was not already there
                displayTopicOverview(); // display the overview
            }
            else{ // pass the question characteristics and display the question that the user was working on 
                console.log(serverData.question.title);
                displayAttemptQuestion(serverData.quiz, serverData.question,serverData.finalQuestion, serverData.questionAnswer.userAnswer, serverData.questionAnswer.correctAnswer);
            }
        }
    }
    req.send();
}


function finishQuiz(event){
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/quizAttempt/finishAttempt/", true);

    req.onreadystatechange = function() {
        console.log("Got attempt question");
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);
            if(serverData.finishSuccess){
                contentEnclosure.innerHTML = "";

            }


            if(!serverData.activeAttempt){
                //dont load the question
                displayTopicOverview();
            }
            else{

                console.log(serverData.question.title);
                displayAttemptQuestion(serverData.quiz, serverData.question,serverData.finalQuestion, serverData.questionAnswer.userAnswer, serverData.questionAnswer.correctAnswer);
            }
        }
    }
    req.send();
}



function nextQuestion(event){ // sends thats the user goes to the next question to the server
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/quizAttempt/nextQuestion", true);

    req.onreadystatechange = function() {
        console.log("Got question");
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);

            if(!serverData.activeAttempt){
                //dont load the question
                displayTopicOverview(); // show the topic overview
            }
            else{ // display the question of the quiz the user was working on
                displayAttemptQuestion(serverData.quiz, serverData.question, serverData.finalQuestion,serverData.questionAnswer.userAnswer, serverData.questionAnswer.correctAnswer);
            }
        }
    }
    req.send();}




function displayTopicOverview(){ // function to display the topic overview 
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/overview/topics", true);
    
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);    
    
            if(serverData.activeAttempt){ // if a user attempt was already there dont load the overview but the active question
                
                displayAttemptQuestion(serverData.quiz, serverData.question, serverData.finalQuestion,serverData.questionAnswer.userAnswer, serverData.questionAnswer.correctAnswer);
            }
            else{ // if the user does not have an active attempt make the domstructure of the topic overview
                var contentEnclosure = document.getElementById("main-content-enclosure"); // main content section
                var pageHeading = document.createElement('h1'); // heading of the topic overview
                pageHeading.setAttribute('class', "page__title--base col-s__1 col-e__11 row-s__1 row-e__2");
                pageHeading.appendChild(document.createTextNode("Assessment"));
                contentEnclosure.appendChild(pageHeading);
            
                for(topic in serverData.topicQuizes){ // load all topics from the data base and create a domstructure for the topic overview
                    var topicHeading = document.createElement('h2');
                    topicHeading.setAttribute('class', "quiz-topic-overview__title col-s__1 col-e__11 row-s__1 row-e__2");
                    topicHeading.appendChild(document.createTextNode(serverData.topicQuizes[topic].topicTitle));
            
                    var topicSection = document.createElement('section'); // section for a certain topic
                    topicSection.setAttribute('class', "grid-container quiz-topic-overview__grid-container");
            
                    for(quiz in serverData.topicQuizes[topic].quizes){ // load all quizes from a certain topic and create a domstructure
                        var quizSection = document.createElement('section');
                        quizSection.setAttribute('class', "quiz-topic-overview__quiz-question");
                        quizSection.setAttribute('data-id', serverData.topicQuizes[topic].quizes[quiz].quizId);
            
                        var quizHeading = document.createElement('h2'); // create quiz heading
                        quizHeading.appendChild(document.createTextNode(serverData.topicQuizes[topic].quizes[quiz].quizTitle));
                        quizSection.appendChild(quizHeading);
                        quizSection.addEventListener("click", displayQuiz); //displayQuiz
                        topicSection.appendChild(quizSection); 
                    }
                    contentEnclosure.appendChild(topicHeading); // add topic heading and topic section
                    contentEnclosure.appendChild(topicSection);
                }   
            }
        }
    }
    req.send();
}

function displayQuizOverview(quizId){ // function to display the quiz overview
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/overview/quiz/" + quizId, true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);

            if(serverData.activeAttempt){ // if the user has already an active attempt display the question instead
                displayAttemptQuestion(serverData.quiz, serverData.question, serverData.finalQuestion,serverData.questionAnswer.userAnswer, serverData.questionAnswer.correctAnswer);
            }
            else{ // else display the quiz overview
                var contentEnclosure = document.getElementById("main-content-enclosure"); // main content section
                contentEnclosure.innerHTML = "";
    
                var quizHeading = document.createElement('h1'); // make quiz heading (title)
                quizHeading.setAttribute('class', "page__title--base col-s__1 col-e__11 row-s__1 row-e__2");
                quizHeading.appendChild(document.createTextNode(serverData.quiz.title));
                contentEnclosure.appendChild(quizHeading);
    
                var questionTable = document.createElement("table"); // make table to fill in the question
                var questionTableBody = document.createElement("tbody"); // make the body of the table
    
                for (var rowIndex = 0; rowIndex < serverData.questions.length ; rowIndex++){ // fill in the quiz table with the questions of the quiz
                    
                    var questionRow = document.createElement("tr");// creates a table row
                    var questionIdData = document.createElement("td"); // add the id for the question to the table
                    questionIdData.appendChild(document.createTextNode(rowIndex + 1));
                    var questionTitleData = document.createElement("td"); // add the title of the question to the table
                    questionTitleData.appendChild(document.createTextNode(serverData.questions[rowIndex].title));
                    var questionProblemStatementData = document.createElement("td"); // add the problem statement of the question to the table
                    questionProblemStatementData.appendChild(document.createTextNode(serverData.questions[rowIndex].problem_statement));
    
                    questionRow.appendChild(questionIdData); // append the data to the question row
                    questionRow.appendChild(questionTitleData);
                    questionRow.appendChild(questionProblemStatementData);
                    questionTableBody.appendChild(questionRow);
    
                }
    
                questionTable.appendChild(questionTableBody); 
                contentEnclosure.appendChild(questionTable);
    
                var takeQuizButton = document.createElement('button'); // buton to start the quiz
                takeQuizButton.appendChild(document.createTextNode('Take Quiz'));
                takeQuizButton.setAttribute('data-id', quizId);
                takeQuizButton.addEventListener("click", takeQuiz);

                if(!serverData.isLoggedIn){ // if the user is not logged in the take quiz button is disabled so access is denied. 
                    takeQuizButton.disabled = true;
                }
                contentEnclosure.appendChild(takeQuizButton);
            }
        }
    }
    req.send();
}

function displayQuiz(event){ // if pressed on quiz call display the quiz
    displayQuizOverview(this.getAttribute('data-id'));
}


displayTopicOverview(); // first function to get called : To display the topic overview











