
//Super class and general display method
class question {
    constructor(questionId, title, problemStatement, userAttemptAnswer = null){
        this.questionId = questionId;
        this.title = title;
        this.problemStatement = problemStatement;
        if(userAttempt){
            this.userAttemptAnswer = userAttemptAnswer;
        }
    };
};

question.prototype.submitAnswer = function() {
    //donothing
};


question.prototype.display = function(){
    var questionSection = document.createElement('section');
    questionSection.setAttribute('class', 'quizQuestion__enclosure');

    var feedbackBox = document.createElement('img');
    feedbackBox.setAttribute('class', 'feedbackBox');
    if(this.userAttemptAnswer){
        feedbackBox.setAttribute('src', (this.userAttemptAnswer.correct) ? "images/assessment-feedbackicon-correct.png" : "images/assessment-feedbackicon-incorrect.png");
    }
    else{
        feedbackBox.style.visibility = "hidden";
    }
    questionSection.appendChild(feedbackBox);
    var titleHeading = document.createElement("h2");
    titleHeading.appendChild(document.createTextNode(this.title));
    questionSection.appendChild(titleHeading);

    //Create the question input form
    var questionForm = document.createElement('form'); 

    questionForm.addEventListener('submit', submitAnswer,false);
    questionForm.setAttribute('class', 'quizQuestion__form');
    
    var problemStatementLabel = document.createElement('label');
    var problemStatementHeading = document.createElement('h3');
    problemStatementHeading.appendChild(document.createTextNode(this.problemStatement));
    problemStatementLabel.appendChild(problemStatementHeading);
    questionForm.appendChild(problemStatementLabel);

};



class fillInBlanks extends question {
    constructor(questionId, title, problemStatement, userAttemptAnswer = null ){
        super(questionId, title, problemStatement, userAttemptAnswer);            //takes all the parameter inputs from the superclass constructor      
    };


    display(){
        super.display(this);

        var answerBox = document.createElement('input');
        answerBox.setAttribute('type', 'text');

        questionForm.appendChild(answerBox);
        var submitButton = document.createElement('input');
        submitButton.setAttribute('type', 'submit');
        submitButton.setAttribute('value', 'Submit');
        questionForm.appendChild(submitButton);  

        questionSection.appendChild(questionForm);

        var contentEnclosure = document.getElementById("main-content-enclosure");
        contentEnclosure.appendChild(questionSection);
    }
};

class QuizHandler {
    constructor(quizId, quizTitle){
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.userAttempt = userAttempt;
    };
};

QuizHandler.prototype.startQuiz = function() {
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/quizAttempt?quizId=" + this.quizId, true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);

        }
    }
    req.send();
}












class PageContentHandler {
    constructor(){
        this.state = 0;
    };
};


PageContentHandler.prototype.displayTopicOverview = function(){
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/overview", true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            topicQuizes = JSON.parse(req.responseText);
            
            var contentEnclosure = document.getElementById("main-content-enclosure");
            var pageHeading = document.createElement('h1');
            pageHeading.setAttribute('class', "page__title--base col-s__1 col-e__11 row-s__1 row-e__2");
            pageHeading.appendChild(document.createTextNode("Assessment"));
            contentEnclosure.appendChild(pageHeading);

            for(topic in topicQuizes){
                var topicHeading = document.createElement('h2');
                topicHeading.setAttribute('class', "quiz-topic-overview__title col-s__1 col-e__11 row-s__1 row-e__2");
                topicHeading.appendChild(document.createTextNode(topicQuizes[topic].topicTitle));

                var topicSection = document.createElement('section');
                topicSection.setAttribute('class', "grid-container quiz-topic-overview__grid-container");

                for(quiz in topicQuizes[topic].quizes){
                    var quizSection = document.createElement('section');
                    quizSection.setAttribute('class', "quiz-topic-overview__quiz-question");
                    quizSection.setAttribute('data-id', topicQuizes[topic].quizes[quiz].quizId);

                    var quizHeading = document.createElement('h2');
                    quizHeading.appendChild(document.createTextNode(topicQuizes[topic].quizes[quiz].quizTitle));
                    quizSection.appendChild(quizHeading);
                    quizSection.addEventListener("click", displayQuiz)
                    topicSection.appendChild(quizSection);
                }
                contentEnclosure.appendChild(topicHeading);
                contentEnclosure.appendChild(topicSection);
            }   
        }
    }
    req.send();
};



PageContentHandler.prototype.displayQuizById = function(quizId) {
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/quizOverview?quizId=" + quizId, true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);
            console.log(serverData);
            

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
            quizSection.setAttribute('data-id', quizId);
            quizSection.addEventListener("click", takeQuiz)

            if(!serverData.isLoggedIn){
                takeQuizButton.disabled = true;
            }
            contentEnclosure.appendChild(takeQuizButton);
            
            
        }
    }
    req.send();
}



PageContentHandler.prototype.displayQuizAttempt = function(quizId) {
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/quizAttempt?quizId=" + quizId, true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);
            console.log(serverData);
            

            //var contentEnclosure = document.getElementById("main-content-enclosure");
            //contentEnclosure.innerHTML = "";



        }
    }
    req.send();
}



function displayQuiz(event){
    contentHandler.displayQuizById(this.getAttribute('data-id'));
}

function takeQuiz(event){
    contentHandler.displayQuizAttempt(this.getAttribute('data-id'));
}






// Function to register all events
function registerEvents() {
    contentHandler = new PageContentHandler;
    contentHandler.displayTopicOverview();

     
    //var quizArray = document.getElementsByClassName("quiz-topic-overview__quiz-question");

    //for(let i = 0; i < quizArray.length; i++) {
    //    quizArray[i].addEventListener("click", function() {displayQuiz()});
   // }
}


registerEvents()








/*
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200){
        xmlDoc = JSON.parse(this.responseText);
        console.log(xmlDoc);
    }
    console.log("READY STATE: " + this.readyState);
    console.log("STATUS CODE: " + this.status);
}
xhttp.open("GET", "quiz/overview", true);
xhttp.send();
 <!--
    <% topicQuizes.forEach(function(topic) { %>
        <h2 class="quiz-topic-overview__title col-s__1 col-e__11 row-s__1 row-e__2"><%= topic.topicTitle %></h2>    
        <section class="grid-container quiz-topic-overview__grid-container">
                    <% topic.quizes.forEach(function(quiz) { %>
                        <article class="quiz-topic-overview__quiz-question ">
                            <h2><%= quiz.quizTitle %></h2>
                        </article>
                    <% }); %>
        </section>
    <% }); %>-->
        

*/






/*var req = new XMLHttpRequest();
window.onload = function()
{
req.onreadystatechange= function ()
{
    if (this.readyState == 4 && this.status == 200)
    {
        console.log(req.responseText)
    }

}
req.open("GET", "./testdata.json", true);
req.send();}*/
/*
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send(); 
}*/

// this requests the file and executes a callback with the parsed result once
//   it is available
/*fetchJSONFile('testdata.json', function(data){
    // do something with your data
    console.log(data);
});*/