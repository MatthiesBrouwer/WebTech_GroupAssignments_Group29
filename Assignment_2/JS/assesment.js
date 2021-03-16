var body = document.getElementsByTagName('body')[0]; // Location where to add elements
var article = document.createElement('article');
article.setAttribute('class', 'main-content-enclosure');
body.appendChild(article);

var section = document.createElement('section');
section.setAttribute('class', 'grid-container main-content__grid-container--base');
article.appendChild(section);
 

var h1 = document.createElement('h1');
h1.setAttribute('class','main-content__title--base col-s__1 col-e__11 row-s__1 row-e__2' )
var title = document.createTextNode(quiz);
h1.appendChild(title);
section.appendChild(h1);
var myQuestions = 
[
    {
      question1: "Who invented HTML?",
      answers: {
        a: "Douglas Crockford",
        b: "Sheryl Sandberg",
        c: "Brendan Eich"
      },
      correctAnswer: "c"
    },
    {
        question2: "",
        answers: {

        },
        correctAnswer: "x"
    
    }
];