var body = document.getElementsByTagName('body')[0]; // Location where to add elements

var article = document.createElement('article');
article.setAttribute('class', 'main-content-enclosure');
body.appendChild(article);

var section = document.createElement('section');
section.setAttribute('class', 'grid-container main-content__grid-container--base');
article.appendChild(section);

var h1 = document.createElement('h1');
h1.setAttribute('class','main-content__title--base col-s__1 col-e__11 row-s__1 row-e__2')   
var pageTitle = document.createTextNode("5 questions about HTML");
h1.appendChild(pageTitle);
section.appendChild(h1);

//event handlers

function clickFormItem(e){   
    if(e.target.nodeName == "INPUT" || e.target.nodeName == "LABEL") // e.target didnt works
    //this.check()
    alert("test, loop nu toch wel erg vast");
}

//class and displaymethods
class questions {
    constructor(title, problem, correctAnswer) {
        this.title = title;
        this.problem = problem;
        this.correctAnswer = correctAnswer;
    }       
};

questions.prototype.questionDisplay = function (){
    var questionTitle = document.createElement('h2');
    var questionTitleText = document.createTextNode(this.title);
    questionTitle.appendChild(questionTitleText);
    section.appendChild(questionTitle);
    var problemStatement = document.createElement('h3');
    problemStatement.appendChild(document.createTextNode(this.problem));
    section.appendChild(problemStatement);  
};

questions.prototype.check = function (input){
    this.input = input;
    if (this.input === this.correctAnswer) alert("You've got the right answer");
    else alert("My boi you got it all wrong");

};

class fillInBlanks extends questions{
    constructor(title, problem, correctAnswer){
        super(title, problem, correctAnswer) 
    }
    questionDisplay(){
        var questionTitle = document.createElement('h2');
        var questionTitleText = document.createTextNode(this.title);
        questionTitle.appendChild(questionTitleText);
        section.appendChild(questionTitle);
        var problemStatement = document.createElement('h3');
        problemStatement.appendChild(document.createTextNode(this.problem));
        section.appendChild(problemStatement);  
        var inputForm = document.createElement('input');    
        section.appendChild(inputForm); 
    }
};

class multipleChoice extends questions{
    constructor(title, problem, correctAnswer, options){ //can add a parameter for one or more answers
        super(title, problem, correctAnswer) 
        this.options = options;
    }
    questionDisplay(){
        var choiceForm = document.createElement('form');
        choiceForm.addEventListener("click", clickFormItem, false);
        choiceForm.setAttribute('id', title[0-3] + this.problem.length); // unique question identifier
        var questionTitle = document.createElement('h2');
        var questionTitleText = document.createTextNode(this.title);
        questionTitle.appendChild(questionTitleText);
        choiceForm.appendChild(questionTitle);
        var problemStatement = document.createElement('h3');
        problemStatement.appendChild(document.createTextNode(this.problem));
        choiceForm.appendChild(problemStatement);      

        for (var i=0; i<this.options.length; i++){
            var inputOptions = document.createElement('input');
            inputOptions.setAttribute('type','radio');  
            inputOptions.setAttribute('id', 'option' + (i+1)); 
            inputOptions.setAttribute('value', 'option' + (i+1));
            inputOptions.setAttribute('name', 'option'); //have to watch this one if adding multiple questions
            choiceForm.appendChild(inputOptions);
            var inputLabels = document.createElement('label');
            inputLabels.setAttribute('for', 'option' + (i+1));
            inputLabels.appendChild(document.createTextNode(this.options[i]));
            choiceForm.appendChild(inputLabels);
        };
        section.appendChild(choiceForm);
    }
};

question1 = new fillInBlanks("History question", "Tim-Berners-Lee invented HTML in", "1989");
question1.questionDisplay();
question2 = new multipleChoice("Syntax qustion", "What should be the first element of a HTML5 document?", "<!DOCTYPE html>", ["x","<!DOCTYPE html>","<head>","x"]);
question2.questionDisplay();
//document.addEventListener('load', xxxx);

/*
        inputForm.setAttribute('type', 'number');
        inputForm.setAttribute('min', 0);
        inputForm.setAttribute('max', 9999);
        inputForm.setAttribute('placeholder', 'Waarom werkt dit niet')
        inputForm.setAttribute('class', 'wtf')
*/


