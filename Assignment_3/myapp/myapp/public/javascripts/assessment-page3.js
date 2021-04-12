
class PageContentHandler {
    constructor(){
    };
};

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

function displayQuiz(event){
    contentHandler.displayQuizById(this.getAttribute('data-id'));
}

contentHandler = new PageContentHandler;

var req = new XMLHttpRequest();
req.open("GET", "/assessment/quiz/0/question/0", true);

req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
        serverData = JSON.parse(req.responseText);
        console.log(serverData);

        if(serverData.activeAttempt){
            //load the question
        }
        else{
            contentHandler.displayTopicOverview(serverData.topicQuizes);
        }
    }
}
req.send();