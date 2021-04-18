


class Question {
    constructor(title, finalQuestion, problemStatement, questionId, userAnswer=undefined, correctAnswer=undefined){
        this.title = title;
        this.finalQuestion = finalQuestion;
        this.problemStatement = problemStatement;
        this.questionId = questionId;
        this.userAnswer = userAnswer;
        this.correctAnswer = correctAnswer;
    }
};

Question.prototype.getQuestionDisplay = function(){
    var questionSection = document.createElement('section');
    questionSection.setAttribute('class', 'main-content__text--base col-s__2 col-e__9 question-enclosure');
    var feedbackBox = document.createElement('img');
    feedbackBox.setAttribute('id', 'questionForm__feedbackBox');

    feedbackBox.setAttribute('src', "images/assessment-feedbackicon-incorrect.png");
    feedbackBox.style.visibility = "hidden";

    questionSection.appendChild(feedbackBox);

    var questionHeading = document.createElement('h2');
    questionHeading.setAttribute('class', "questionForm__title--base col-s__1 col-e__11 row-s__1 row-e__2");
    questionHeading.appendChild(document.createTextNode(this.title));
    questionSection.appendChild(questionHeading);

    var problemStatementHeading = document.createElement('h3');
    problemStatementHeading.setAttribute('class', "questionForm__problemStatement col-s__1 col-e__11 row-s__1 row-e__2");
    problemStatementHeading.appendChild(document.createTextNode(this.problemStatement));
    questionSection.appendChild(problemStatementHeading);
    return questionSection;
}

Question.prototype.submitAnswer = function(answerText){
    var req = new XMLHttpRequest();
    req.open("POST", "/assessment/quizAttempt/answerQuestion", true);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //var displayFunc = this.displayResults();
    req.onreadystatechange = () =>{
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);    
            this.userAnswer = serverData.questionAnswer.userAnswer;
            this.correctAnswer = serverData.questionAnswer.correctAnswer;    
            
            
            //displayFunc();
            this.displayResults();
        }
    }
    req.send("answer=" + answerText + "&questionId=" + this.questionId);
}

Question.prototype.displayResults = function(){
    if(this.userAnswer != undefined){
        console.log("DISPLAYING RESULTS");
        console.log("ANSWERS: ");
        console.log(this.userAnswer);
        console.log(this.correctAnswer);    
        var submitButton = document.getElementById("questionForm__submitButton");
        var progressButton = document.getElementById("questionForm__progressButton");
        var feedbackText = document.getElementById("questionForm__feedbackText");
        var feedbackBox = document.getElementById("questionForm__feedbackBox");
    


        submitButton.disabled = true;
        progressButton.disabled = false;
        feedbackText.style.visibility = "visible";
        feedbackBox.style.visibility = "visible";
    
        if(this.userAnswer != this.correctAnswer){
            feedbackText.setAttribute('class', "questionForm__feedbackText--incorrect");
            feedbackText.appendChild(document.createTextNode("Incorrect! The correct answer was: '" + this.correctAnswer + "', You answered: '" + this.userAnswer + "'.")); 
            feedbackBox.setAttribute('src', "images/assessment-feedbackicon-incorrect.png");
        }
        else{
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

class FillInBlanks extends Question{
    constructor(title, finalQuestion, problemStatement, questionId, userAnswer=undefined, correctAnswer=undefined){
        console.log(userAnswer, correctAnswer);
        super(title, finalQuestion, problemStatement, questionId, userAnswer, correctAnswer);            //takes all the parameter inputs from the superclass constructor      
    }

    getQuestionDisplay(){
        var questionSection = super.getQuestionDisplay(this);                               

        //form for identying input and label for the input (in this case label = the problem statement)
        var inputForm = document.createElement('form'); 
        inputForm.addEventListener('submit', this.submitAnswer.bind(this),false);
        inputForm.setAttribute('id', 'questionForm');
        var inputBox = document.createElement('input');
        var submitButton = document.createElement('input');         //the submit button for accessibility
        var progressButton = document.createElement('button');
        var feedbackText = document.createElement('label');


        inputBox.setAttribute('type', 'text');
        inputBox.setAttribute('id', "questionForm__textInput");
        submitButton.setAttribute('type', 'submit');    
        submitButton.setAttribute('value', 'Submit');
        submitButton.setAttribute('id', "questionForm__submitButton");

        progressButton.setAttribute('id', "questionForm__progressButton");        
        if(!this.finalQuestion){
            progressButton.appendChild(document.createTextNode('Next Question'));
            progressButton.addEventListener("click", nextQuestion);
        }
        else{
            progressButton.appendChild(document.createTextNode('Finish Quiz'));
            progressButton.addEventListener("click", finishQuiz);
        }
        feedbackText.setAttribute('id', "questionForm__feedbackText");
        progressButton.disabled = true;
        inputForm.appendChild(inputBox);
        inputForm.appendChild(submitButton);
        questionSection.appendChild(inputForm); 
        questionSection.appendChild(progressButton);  
        questionSection.appendChild(feedbackText);
        console.log("IM HERE NOW")
        
        return questionSection;
    }

    submitAnswer(event){
        event.preventDefault();
        var answerText = document.getElementById("questionForm__textInput").value;
        super.submitAnswer(answerText);
        var inputBox = document.getElementById("questionForm__textInput");
        inputBox.disabled = true; 
    }

    displayResults(){
        if(super.displayResults()){
            console.log("SHOWING FILL IN THE BLANKS RESULTS")
            var inputBox = document.getElementById("questionForm__textInput"); //createElement('input');

            console.log(inputBox);
            inputBox.disabled = true;
        }
    }
}

class MultipleChoice extends Question{
    constructor(title, finalQuestion, problemStatement, questionId, answerOptions, userAnswer=undefined, correctAnswer=undefined){
        console.log(userAnswer, correctAnswer);
        super(title, finalQuestion, problemStatement, questionId, userAnswer, correctAnswer);            //takes all the parameter inputs from the superclass constructor      
        this.answerOptions = answerOptions;

    }

    getQuestionDisplay(){
        var questionSection = super.getQuestionDisplay(this);                               

        //form for identying input and label for the input (in this case label = the problem statement)
        var inputForm = document.createElement('form'); 
        inputForm.addEventListener('submit', this.submitAnswer.bind(this),false);
        inputForm.setAttribute('id', 'questionForm');
        var submitButton = document.createElement('input');         //the submit button for accessibility
        var progressButton = document.createElement('button');
        var feedbackText = document.createElement('label');

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
            progressButton.disabled = true;
            
            inputForm.appendChild(optionLabel);
        }
        

        //inputBox.setAttribute('type', 'text');
        //inputBox.setAttribute('id', "questionForm__textInput");
        
        
        submitButton.setAttribute('type', 'submit');    
        submitButton.setAttribute('value', 'Submit');
        submitButton.setAttribute('id', "questionForm__submitButton");

        progressButton.setAttribute('id', "questionForm__progressButton");        
        if(!this.finalQuestion){
            progressButton.appendChild(document.createTextNode('Next Question'));
            progressButton.addEventListener("click", nextQuestion);
        }
        else{
            progressButton.appendChild(document.createTextNode('Finish Quiz'));
            progressButton.addEventListener("click", finishQuiz);
        }
        feedbackText.setAttribute('id', "questionForm__feedbackText");
        
        //inputForm.appendChild(inputBox);
        inputForm.appendChild(submitButton);
        questionSection.appendChild(inputForm); 
        questionSection.appendChild(progressButton);  
        questionSection.appendChild(feedbackText);
        console.log("IM HERE NOW")
        
        return questionSection;
    }

    submitAnswer(event){
        event.preventDefault();

        
        var radioButtons = document.getElementsByName('questionForm__optionButton');
        console.log("NEW OPTION");

        for(var i=0; i < radioButtons.length; i++){
            console.log(radioButtons[i]);
            if(radioButtons[i].checked){
                console.log("FOUND BUTTON PRESSED: ")
                console.log( radioButtons[i].value);
                super.submitAnswer(radioButtons[i].value);
                break;
            }
        }      
    }

    displayResults(){
        //Super class returns wether the question was answered or not
        if(super.displayResults()){
            console.log("SHOWING FILL IN THE BLANKS RESULTS")
            for (var i=0; i<this.answerOptions.length; i++){
                var optionRadioInput = document.getElementById("questionForm__optionButton--" + (i+1));
                optionRadioInput.disabled = true;
            }     
        }
    }
}



function displayAttemptQuestion(quiz, question, finalQuestion, userAnswer, correctAnswer){
    var contentEnclosure = document.getElementById("main-content-enclosure");
    contentEnclosure.innerHTML = "";

    var quizTitle = document.createElement("h1");
    quizTitle.appendChild(document.createTextNode(quiz.title));
    quizTitle.setAttribute('class', "quizAttempt__quizTitle");
    contentEnclosure.appendChild(quizTitle);

    if(question.quiz_question_type_id == 1){
        console.log("CREATING FILL IN THE BLANKS QUESTION");
        var newQuestion = new FillInBlanks(question.title, finalQuestion, question.problem_statement, question.id, userAnswer, correctAnswer);
    }
    else{
        var newQuestion = new MultipleChoice(question.title, finalQuestion, question.problem_statement, question.id, question.answerOptions, userAnswer, correctAnswer);

        console.log("CREATING MULTIPLE CHOICE QUESTION");

    }
    console.log(newQuestion);
    contentEnclosure.appendChild(newQuestion.getQuestionDisplay()); //Geef mij de basis vraag html section 
    newQuestion.displayResults(); //Update of je bent beantwoord of niet
}


function takeQuiz(event){
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/overview/newAttempt/" + this.getAttribute('data-id'), true);

    req.onreadystatechange = function() {
        console.log("Got attempt question");
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);

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


function finishQuiz(event){
    
    console.log("FINISHING QUIZ");
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/quizAttempt/finishQuiz", true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            console.log("Got finish question");

            serverData = JSON.parse(req.responseText);
            //{finishSuccess: boolean, quiz: quiz, quizScore: {correctAnswers: int, totalQuestions: int}};
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




function nextQuestion(event){
    console.log("CALLING NEXT QUESTION");
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/quizAttempt/nextQuestion", true);

    req.onreadystatechange = function() {
        console.log("Got question");
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);

            if(!serverData.activeAttempt){
                //dont load the question
                displayTopicOverview();
            }
            else{
                displayAttemptQuestion(serverData.quiz, serverData.question, serverData.finalQuestion,serverData.questionAnswer.userAnswer, serverData.questionAnswer.correctAnswer);
            }
        }
    }
    req.send();}
















function displayTopicOverview(){
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/overview/topics", true);
    
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);    
    
            if(serverData.activeAttempt){
                //dont load the overview
                
                displayAttemptQuestion(serverData.quiz, serverData.question, serverData.finalQuestion,serverData.questionAnswer.userAnswer, serverData.questionAnswer.correctAnswer);
            }
            else{
                var contentEnclosure = document.getElementById("main-content-enclosure");
                var pageHeading = document.createElement('h1');
                pageHeading.setAttribute('class', "page__title--base col-s__1 col-e__11 row-s__1 row-e__2");
                pageHeading.appendChild(document.createTextNode("Assessment"));
                contentEnclosure.appendChild(pageHeading);
            
                for(topic in serverData.topicQuizes){
                    var topicHeading = document.createElement('h2');
                    topicHeading.setAttribute('class', "quiz-topic-overview__title col-s__1 col-e__11 row-s__1 row-e__2");
                    topicHeading.appendChild(document.createTextNode(serverData.topicQuizes[topic].topicTitle));
            
                    var topicSection = document.createElement('section');
                    topicSection.setAttribute('class', "grid-container quiz-topic-overview__grid-container");
            
                    for(quiz in serverData.topicQuizes[topic].quizes){
                        var quizSection = document.createElement('section');
                        quizSection.setAttribute('class', "quiz-topic-overview__quiz-question");
                        quizSection.setAttribute('data-id', serverData.topicQuizes[topic].quizes[quiz].quizId);
            
                        var quizHeading = document.createElement('h2');
                        quizHeading.appendChild(document.createTextNode(serverData.topicQuizes[topic].quizes[quiz].quizTitle));
                        quizSection.appendChild(quizHeading);
                        quizSection.addEventListener("click", displayQuiz); //displayQuiz
                        topicSection.appendChild(quizSection); 
                    }
                    contentEnclosure.appendChild(topicHeading);
                    contentEnclosure.appendChild(topicSection);
                }   
            }
        }
    }
    req.send();
}

function displayQuizOverview(quizId){
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/overview/quiz/" + quizId, true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);

            if(serverData.activeAttempt){
                //dont load the question
                displayAttemptQuestion(serverData.quiz, serverData.question, serverData.finalQuestion,serverData.questionAnswer.userAnswer, serverData.questionAnswer.correctAnswer);
            }
            else{
                var contentEnclosure = document.getElementById("main-content-enclosure");
                contentEnclosure.innerHTML = "";
    
                var quizHeading = document.createElement('h1');
                quizHeading.setAttribute('class', "page__title--base col-s__1 col-e__11 row-s__1 row-e__2");
                quizHeading.appendChild(document.createTextNode(serverData.quiz.title));
                contentEnclosure.appendChild(quizHeading);
    
                var questionTable = document.createElement("table");
                var questionTableBody = document.createElement("tbody");
    
                for (var rowIndex = 0; rowIndex < serverData.questions.length ; rowIndex++){
                    // creates a table row
                    var questionRow = document.createElement("tr");
                    var questionIdData = document.createElement("td");
                    questionIdData.appendChild(document.createTextNode(rowIndex + 1));
                    var questionTitleData = document.createElement("td");
                    questionTitleData.appendChild(document.createTextNode(serverData.questions[rowIndex].title));
                    var questionProblemStatementData = document.createElement("td");
                    questionProblemStatementData.appendChild(document.createTextNode(serverData.questions[rowIndex].problem_statement));
    
                    questionRow.appendChild(questionIdData);
                    questionRow.appendChild(questionTitleData);
                    questionRow.appendChild(questionProblemStatementData);
                    questionTableBody.appendChild(questionRow);
    
                }
    
                questionTable.appendChild(questionTableBody);
                contentEnclosure.appendChild(questionTable);
    
                var takeQuizButton = document.createElement('button');
                takeQuizButton.appendChild(document.createTextNode('Take Quiz'));
                takeQuizButton.setAttribute('data-id', quizId);
                takeQuizButton.addEventListener("click", takeQuiz);

                if(!serverData.isLoggedIn){
                    takeQuizButton.disabled = true;
                }
                contentEnclosure.appendChild(takeQuizButton);
            }
        }
    }
    req.send();
}

function displayQuiz(event){
    displayQuizOverview(this.getAttribute('data-id'));
}





displayTopicOverview();











