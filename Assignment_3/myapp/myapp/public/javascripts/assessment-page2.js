var quizList 

function getQuizById(quizId){
    var req = new XMLHttpRequest();

    req.open("GET", "/assessment/quiz?quizId=" + quizId, true);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            console.log(req.responseText);
        }
    }
    req.send();
    
}

// Function to register all events
function registerEvents() {

    var quizArray = document.getElementsByClassName("quiz-topic-overview__quiz-question");

    console.log(quizArray);


    for(let i = 0; i < quizArray.length; i++) {
        quizArray[i].addEventListener("click", function() {getQuizById(i + 1)});
    }
}


registerEvents()

var quizes = '<%= topicQuizes  %>';
console.log(quizes);







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