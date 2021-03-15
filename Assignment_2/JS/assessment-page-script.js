var questionCounter = 0;
var questionList = [];
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
// class="main-content__text--base col-s__2 col-e__9 row-s__3 row-e__4"

function submitText(e){
    e.preventDefault();
    var questionId = e.target.id;
    var index = parseInt(questionId.replace( /^\D+/g, '')) -1;
    questionList[index].check(e.target.children[1].value); 
   
}

function clickFormItem(e){   
    if(e.target.nodeName == "INPUT" || e.target.nodeName == "LABEL"){ // e.target didnt works    
        var questionId = e.target.parentNode.id;
        // https://stackoverflow.com/questions/10003683/how-can-i-extract-a-number-from-a-string-in-javascript
        var index = parseInt(questionId.replace( /^\D+/g, '')) -1; //extract the indexnumber from the question id
        questionList[index].check(e.target.textContent);       
    }
};

//class and displaymethods
class questions {
    constructor(title, problem, correctAnswer) {
        this.title = title;
        this.problem = problem;
        this.correctAnswer = correctAnswer;
        questionList.push(this);
        questionCounter++;

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
//(input, this.input = input)
questions.prototype.check = function (input){ 
    if (input === this.correctAnswer) console.log("You've got the right answer");
    else console.log("My boi you got it all wrong");

};

class fillInBlanks extends questions{
    constructor(title, problem, correctAnswer){
        super(title, problem, correctAnswer)
         
        
    }
    questionDisplay(){      
        var section = document.createElement('section');
        section.setAttribute('class', 'grid-container main-content__grid-container--base');
        article.appendChild(section);        
        var innerSection = document.createElement('section');

        innerSection.setAttribute('class', 'main-content__text--base col-s__2 col-e__9 row-s__3 row-e__4');
        section.appendChild(innerSection); //niet vergeten aan te passen / gelijk temaken

        var questionTitle = document.createElement('h2');
        var questionTitleText = document.createTextNode(this.title);
        questionTitle.appendChild(questionTitleText);
        innerSection.appendChild(questionTitle);

        var inputForm = document.createElement('form'); //form for identying input and label for input (in this case the problem statement)
        inputForm.addEventListener('submit', submitText,false);
        inputForm.setAttribute('id', "question" + questionCounter)
        var label = document.createElement('label');
        var problemStatement = document.createElement('h3');        
        problemStatement.appendChild(document.createTextNode(this.problem));
        label.appendChild(problemStatement);
        inputForm.appendChild(label);
        var inputBox = document.createElement('input');
        inputBox.setAttribute('type', 'text');
        //inputBox.addEventListener("submit", clickFormItem, false);
        inputForm.appendChild(inputBox);       
        innerSection.appendChild(inputForm); 
        
    }
};

class multipleChoice extends questions{
    constructor(title, problem, correctAnswer, options){ //can add a parameter for one or more answers
        super(title, problem, correctAnswer) 
        this.options = options;
    }
    questionDisplay(){
        var section = document.createElement('section');
        section.setAttribute('class', 'grid-container main-content__grid-container--base');
        article.appendChild(section);    
        
        var innerSection = document.createElement('section');
        innerSection.setAttribute('class', 'main-content__text--base col-s__2 col-e__9 row-s__3 row-e__4');
        section.appendChild(innerSection);

        var questionTitle = document.createElement('h2');
        var questionTitleText = document.createTextNode(this.title);
        questionTitle.appendChild(questionTitleText);
        innerSection.appendChild(questionTitle);
        var problemStatement = document.createElement('h3');
        problemStatement.appendChild(document.createTextNode(this.problem));
        innerSection.appendChild(problemStatement);   

        var choiceForm = document.createElement('form'); //form for identifying input part of the section
        choiceForm.addEventListener("click", clickFormItem, false);
        choiceForm.setAttribute('id', "question" + questionCounter); // unique question identifier
        innerSection.appendChild(choiceForm);   

        for (var i=0; i<this.options.length; i++){
            var inputOptions = document.createElement('input');
            inputOptions.setAttribute('type','radio');  
            inputOptions.setAttribute('name', 'option'); //have to watch this one if adding multiple questions
            choiceForm.appendChild(inputOptions);
            var inputLabels = document.createElement('label');
            inputLabels.setAttribute('for', 'option' + (i+1));
            inputLabels.appendChild(document.createTextNode(this.options[i]));
            choiceForm.appendChild(inputLabels);
        };      
    }
};

var question1 = new fillInBlanks("History question", "Tim-Berners-Lee invented HTML in", "1989");
question1.questionDisplay();
var question2 = new multipleChoice("Syntax qustion", "What should be the first element of a HTML5 document?", "<!DOCTYPE html>", ["x","<!DOCTYPE html>","<head>","x"]);
question2.questionDisplay();
//var questionList = [question1, question2];
//document.addEventListener('load', xxxx);

/*
        inputForm.setAttribute('type', 'number');
        inputForm.setAttribute('min', 0);
        inputForm.setAttribute('max', 9999);
        inputForm.setAttribute('placeholder', 'Waarom werkt dit niet')
        inputForm.setAttribute('class', 'wtf')
*/

// class="main-content__text--base col-s__2 col-e__9 row-s__3 row-e__4"


