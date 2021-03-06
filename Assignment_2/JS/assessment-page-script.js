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

class questions {
    constructor(title, problem, correctAnswer, input) {
        this.title = title;
        this.problem = problem;
        this.correctAnswer = correctAnswer;
        this.input = input;
        this.check = function (){
            if (this.input == this.correctAnswer){
                alert("You've got the right answer")
            }
            else alert("My boi you got it all wrong")
        };
        this.questionDisplay = function (){
            var questionTitle = document.createElement('h2');
            var questionTitleText = document.createTextNode(this.title);
            questionTitle.appendChild(questionTitleText);
            section.appendChild(questionTitle);
            var problemStatement = document.createElement('h3');
            problemStatement.appendChild(document.createTextNode(this.problem));
            section.appendChild(problemStatement);    
        }
    }
}

question1 = new questions("History question", "When did Tim-Berners-lee invent HTML", "1989", "Test" )
question1.questionDisplay();

class fillInBlanks extends questions{

}

class multipleChoice extends questions{

}




