

function displayAttemptQuestion(quiz, question, userAnswer){
    var contentEnclosure = document.getElementById("main-content-enclosure");
    contentEnclosure.innerHTML = "";

    //Add the quiz title as the main header 
    var quizHeading = document.createElement('h1');
    quizHeading.setAttribute('class', "page__title--base col-s__1 col-e__11 row-s__1 row-e__2");
    quizHeading.appendChild(document.createTextNode(quiz.title));
    contentEnclosure.appendChild(quizHeading);

    //Add the question title as a heading for the question 
    var questionHeading = document.createElement('h2');
    questionHeading.setAttribute('class', "question__title--base col-s__1 col-e__11 row-s__1 row-e__2");
    questionHeading.appendChild(document.createTextNode(question.title));
    contentEnclosure.appendChild(questionHeading);

    //Also add the problem statement 
    var problemStatementHeading = document.createElement('h3');
    problemStatementHeading.setAttribute('class', "question-attempt__problemStatement col-s__1 col-e__11 row-s__1 row-e__2");
    problemStatementHeading.appendChild(document.createTextNode(question.problem_statement));
    contentEnclosure.appendChild(problemStatementHeading);
}


function displayTopicOverview(){
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/overview/topics", true);
    
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);    
            for(key in serverData){
                console.log(serverData[key]);
            }
    
            if(serverData.activeAttempt){
                //dont load the overview
                displayAttemptQuestion(serverData.quiz, serverData.question, serverData.userAttemptAnswer);
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
                        quizSection.addEventListener("click", displayQuiz)
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
                displayAttemptQuestion(serverData.quiz, serverData.question, serverData.userAttemptAnswer);
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
/*
PageContentHandler.prototype.displayAttemptQuestion = function(quizId, questionIndex){
    console.log("FUNCTI ON CLALE");
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/overview/newAttempt/" + quizId, true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);

            for (key in serverData){
                console.log(key + " : " + serverData[key]);
            }

            if(!serverData.activeAttempt){
                //dont load the question
                this.displayTopicOverview();
            }
            else{
                var contentEnclosure = document.getElementById("main-content-enclosure");
                contentEnclosure.innerHTML = "";

                //Add the quiz title as the main header 
                var quizHeading = document.createElement('h1');
                quizHeading.setAttribute('class', "page__title--base col-s__1 col-e__11 row-s__1 row-e__2");
                quizHeading.appendChild(document.createTextNode(serverData.quiz.title));
                contentEnclosure.appendChild(quizHeading);

                //Add the question title as a heading for the question 
                var questionHeading = document.createElement('h2');
                questionHeading.setAttribute('class', "question__title--base col-s__1 col-e__11 row-s__1 row-e__2");
                questionHeading.appendChild(document.createTextNode(serverData.question.title));
                contentEnclosure.appendChild(questionHeading);

                //Also add the problem statement 
                var problemStatementHeading = document.createElement('h3');
                problemStatementHeading.setAttribute('class', "question-attempt__problemStatement col-s__1 col-e__11 row-s__1 row-e__2");
                problemStatementHeading.appendChild(document.createTextNode(serverData.question.problem_statement));
                contentEnclosure.appendChild(problemStatementHeading);




            }


        }
    }
    req.send();
}*/








displayTopicOverview();







function displayQuiz(event){
    displayQuizOverview(this.getAttribute('data-id'));
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
                
                displayAttemptQuestion(serverData.quiz, serverData.question, serverData.userAttemptAnswer);
            }
        }
    }
    req.send();
}












/*



PageContentHandler.prototype.displayTopicOverview = function(topicQuizes){
   
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

};




PageContentHandler.prototype.displayQuizById = function(quizId) {
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/quiz/" + quizId + "/question/0", true);

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
            var quizSection = document.createElement('section');

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
    req.send();
}

PageContentHandler.prototype.displayQuizAttempt = function(quizId) {
    console.log("DISPLAYING QUIZ ATTEMPT: " + quizId);
    var req = new XMLHttpRequest();
    req.open("GET", "/assessment/quiz/" + quizId + "/newAttempt", true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            serverData = JSON.parse(req.responseText);
            console.log(serverData);
            for (key in serverData){
                console.log(serverData[key]);
            }
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





contentHandler = new PageContentHandler;

var req = new XMLHttpRequest();
req.open("GET", "/assessment/quiz/0/question/0", true);

req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
        serverData = JSON.parse(req.responseText);
        console.log(serverData);

        for(key in serverData){
            console.log(serverData[key]);
        }

        if(serverData.activeAttempt){
            //load the question
        }
        else{
            contentHandler.displayTopicOverview(serverData.topicQuizes);
        }
    }
}
req.send();*/