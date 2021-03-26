var questionCounter = 0; //global scope variables used later on in the document
var questionList = [];
var body = document.getElementsByTagName('body')[0]; // Location where to add elements

//default article/sections created using DOM to pe compatible with the other pages
var article = document.createElement('article');
article.setAttribute('class', 'main-content-enclosure');
body.appendChild(article);

//page title placed inside a seperate section
var section = document.createElement('section');
section.setAttribute('class', 'grid-container main-content__grid-container--base');
article.appendChild(section);
var h1 = document.createElement('h1');
h1.setAttribute('class','main-content__title--base col-s__1 col-e__11 row-s__1 row-e__2')   
var pageTitle = document.createTextNode("5 questions about HTML");
h1.appendChild(pageTitle);
section.appendChild(h1);

//event handlers
function submitText(e){
    e.preventDefault();  //to prevent page reloading
    var questionId = e.target.id;
    //Used for inspiration on how to extract numbers from a string: https://stackoverflow.com/questions/10003683/how-can-i-extract-a-number-from-a-string-in-javascript
    var index = parseInt(questionId.replace( /^\D+/g, '')) -1; //extract the indexnumber from the question id
    questionList[index].check(e.target.children[1].value); 
   
};

function clickFormItem(e){ 
    var questionId = e.target.parentNode.parentNode.id;  //Extraxt the form ID
    var index = parseInt(questionId.replace( /^\D+/g, '')) -1; //extract the indexnumber from the form id
    if(e.target.nodeName === "INPUT"){  //for press on one of the objects
        questionList[index].check(e.target.parentNode.textContent);    
    }
};

//Super class and general display method
class question {
    constructor(title, problem, correctAnswer) {
        this.title = title;
        this.problem = problem;
        this.correctAnswer = correctAnswer;
        questionList.push(this);                //add objects to array:questionList
    }       
};

question.prototype.questionDisplay = function (){
    questionCounter++;  //increase questionCounter by one for variable id assignation / needs to be in display method because of code structure
    //consistent use of section and innersection taken from the structure of the other webpages       
    var innerSection = document.createElement('section');
    innerSection.setAttribute('class', 'main-content__text--base col-s__2 col-e__9 question-enclosure');
    innerSection.setAttribute('id', 'innerSection' + questionCounter); //for later retrieval of this section (simple solve for complex matter of retreiving local variables by getting them through functions)
    var feedbackBox = document.createElement('img');
    feedbackBox.setAttribute('class', 'feedbackBox');
    feedbackBox.setAttribute('id', 'feedbackBox' + questionCounter);
    feedbackBox.setAttribute('src', "images/assessment-feedbackicon-incorrect.png");
    feedbackBox.style.visibility = "hidden";
    innerSection.appendChild(feedbackBox);
    section.appendChild(innerSection);     
    
    //creation of questiontitle
    var questionTitle = document.createElement('h2');
    var questionTitleText = document.createTextNode(this.title);
    questionTitle.appendChild(questionTitleText);
    innerSection.appendChild(questionTitle);
   
};

//standard check function for comparing general input with the object's correctAnswer
question.prototype.check = function (input){ 
    var index = questionList.indexOf(this) + 1; //get the index of the question object in questionList
    var feedbackBox = document.getElementById('feedbackBox' + index);    
    feedbackBox.src = (input == this.correctAnswer) ? "images/assessment-feedbackicon-correct.png" : "images/assessment-feedbackicon-incorrect.png";
    feedbackBox.style.visibility = "visible";     
};

//First subclass "fillInBlanks" 
class fillInBlanks extends question{
    constructor(title, problem, correctAnswer){
        super(title, problem, correctAnswer)            //takes all the parameter inputs from the superclass constructor      
    }
    questionDisplay(){   
        super.questionDisplay(this);                               

        //form for identying input and label for the input (in this case label = the problem statement)
        var inputForm = document.createElement('form'); 
        inputForm.addEventListener('submit', submitText,false);
        inputForm.setAttribute('id', "question" + questionCounter)  //variable id assignation
        var label = document.createElement('label');
        var h3 = document.createElement('h3')
        label.appendChild(h3);  
        h3.appendChild(document.createTextNode(this.problem));   //assigning the object problem as a question label
        inputForm.appendChild(label);
        var inputBox = document.createElement('input');             //The actual box where the user can put in its answer
        inputBox.setAttribute('type', 'text');
        inputForm.appendChild(inputBox);
        var submitButton = document.createElement('input');         //the submit button for accessibility
        submitButton.setAttribute('type', 'submit');    
        submitButton.setAttribute('value', 'Submit');
        inputForm.appendChild(submitButton);  
        var innerSection = document.getElementById('innerSection' + questionCounter);   
        innerSection.appendChild(inputForm); 
        
    }
};

//second subclass "multipleChoice"
class multipleChoice extends question{
    constructor(title, problem, correctAnswer, options){ //can add a parameter for one or more answers
        super(title, problem, correctAnswer) 
        this.options = options;
    }
    questionDisplay(){   
        super.questionDisplay(this);
       
        //Multiple choice form using radiobuttons for display
        var choiceForm = document.createElement('form'); 
        choiceForm.addEventListener("change", clickFormItem, false); //change instead of click to prevent duplicate checks
        choiceForm.setAttribute('id', "question" + questionCounter); //variable id assignation
        var problemStatement = document.createElement('h3');
        problemStatement.appendChild(document.createTextNode(this.problem));
        var innerSection = document.getElementById('innerSection' + questionCounter);   
        innerSection.appendChild(problemStatement); 
        innerSection.appendChild(choiceForm);  

        //the display for multiple choice options so you can have an variable amount of options 
        for (var i=0; i<this.options.length; i++){
            var inputLabels = document.createElement('label');
            inputLabels.setAttribute('for', 'option' + (i+1) + "_question" + questionCounter);
            var inputOptions = document.createElement('input');
            inputOptions.setAttribute('type','radio');  
            inputOptions.setAttribute('name', 'options_question' + questionCounter); 
            inputOptions.setAttribute('value', 'option' + (i+1));
            inputOptions.setAttribute('id', 'option' + (i+1) + "_question" + questionCounter);
            inputLabels.appendChild(inputOptions);
            inputLabels.appendChild(document.createTextNode(this.options[i])); //text display for options
            choiceForm.appendChild(inputLabels);
        }       
    }
};

// the actual questions created as objects (Note: they don't need to be in a variable because they already get stored in an array by the question constructor)
new fillInBlanks("History question", "Tim-Berners-Lee invented HTML in", "1989");
new multipleChoice("Syntax question", "What should be the first element of a HTML5 document?", "<!DOCTYPE html>", ["<header>","<!DOCTYPE html>","<head>","<title>"]);
new multipleChoice("HTML styling question", "What is the best place to style your HTML?", "An external stylesheet", ["An external stylesheet","Inline", "Embedded", "A javascript file"]);
new fillInBlanks("Attribute question", "Which attribute is used to give a alternative text for when an image which doesn't load?", "alt", ["src", "figcaption", "alt", "link"]);
new multipleChoice("Basic HTML question", "Which tag should be used to create emphasised 'bold' elements?", "<strong>", ["<b>", "<bold>", "<emphasise>", "<strong>"]);
// for loop to display it using the array questionList
for (let i of questionList) {
i.questionDisplay();
}
