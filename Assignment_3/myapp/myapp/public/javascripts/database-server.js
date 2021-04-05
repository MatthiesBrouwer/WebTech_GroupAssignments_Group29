
const { raw } = require('express');
const { resolve } = require('path');
const sqlite3 = require('sqlite3').verbose();
var dbFilePath = "test.db";
const fs = require("fs");





class DatabaseServer {
    constructor(dbFilePath) {
        this.dbFilePath = dbFilePath;
        var exists = fs.existsSync(dbFilePath);

        if(!exists) {
            fs.openSync(dbFilePath, "w");
            this.createDatabase();
        }

    };
};

DatabaseServer.prototype.createDatabase = function(){
    
    const db = new sqlite3.Database(__dirname + "/" + this.dbFilePath, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });

    db.serialize( function(){
        //Create all tabels
        db.run(
            `
            CREATE TABLE IF NOT EXISTS QuizTopic (
                id INTEGER CONSTRAINT PK_QuizTopic PRIMARY KEY AUTOINCREMENT, 
                title VARCHAR(50) NOT NULL, 
                description_link VARCHAR(255) NOT NULL, 
                enabled BOOLEAN NOT NULL
            );
            `
        ).run(
            `
            CREATE TABLE IF NOT EXISTS Quiz (
                id INTEGER  PRIMARY KEY AUTOINCREMENT, 
                topic_id INT NOT NULL,
                title VARCHAR(50) NOT NULL, 
                enabled BOOLEAN NOT NULL,
                CONSTRAINT FK_QuizTopic FOREIGN KEY (topic_id) REFERENCES QuizTopic(id) ON DELETE NO ACTION ON UPDATE CASCADE
            );
            `
        ).run(
            `
            CREATE TABLE IF NOT EXISTS QuizQuestionType (
                id INTEGER CONSTRAINT PK_QuizQuestionType PRIMARY KEY AUTOINCREMENT, 
                type VARCHAR(50) NOT NULL UNIQUE
            );
            `
        ).run(
            `
            CREATE TABLE IF NOT EXISTS QuizQuestion (
                id INTEGER CONSTRAINT PK_QuizQuestion PRIMARY KEY AUTOINCREMENT, 
                quiz_id INT NOT NULL,
                quiz_question_type_id INT NOT NULL,
                title VARCHAR(50) NOT NULL,
                problem_statement VARCHAR(255) NOT NULL,
                enabled BOOLEAN NOT NULL,
                CONSTRAINT FK_Quiz FOREIGN KEY (quiz_id) REFERENCES Quiz(id) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT FK_QuizQuestionType FOREIGN KEY (quiz_question_type_id) REFERENCES QuizQuestionType(id) ON DELETE NO ACTION ON UPDATE CASCADE
            );
            `
        ).run(
            `
            CREATE TABLE IF NOT EXISTS QuizQuestionAnswer (
                id INTEGER CONSTRAINT PK_QuizQuestionAnswer PRIMARY KEY AUTOINCREMENT, 
                quiz_question_id INT NOT NULL,
                answer VARCHAR(255) NOT NULL,
                correct BOOLEAN NOT NULL,
                CONSTRAINT FK_QuizQuestion FOREIGN KEY (quiz_question_id) REFERENCES QuizQuestion(id) ON DELETE CASCADE ON UPDATE CASCADE
            );
            `
        ).run(
            `
            CREATE TABLE IF NOT EXISTS User (
                id INTEGER CONSTRAINT PK_User PRIMARY KEY AUTOINCREMENT,
                fistname VARCHAR(50) NOT NULL,
                middlename VARCHAR(50),
                lastname VARCHAR(50) NOT NULL,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(50) NOT NULL
            );
            `
        ).run(
            `
            CREATE TABLE IF NOT EXISTS UserAttemptStatus (
                id INTEGER CONSTRAINT PK_UserAttemptStatus PRIMARY KEY AUTOINCREMENT,
                status VARCHAR(50) NOT NULL UNIQUE
            );
            `
        ).run(
            `
            CREATE TABLE IF NOT EXISTS UserAttempt (
                id INTEGER CONSTRAINT PK_UserAttempt PRIMARY KEY AUTOINCREMENT,
                user_id INT NOT NULL,
                quiz_id INT NOT NULL,
                user_attempt_status_id INT ONT NULL,
                session_id INT NOT NULL,
                CONSTRAINT FK_User FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT FK_Quiz FOREIGN KEY (quiz_id) REFERENCES Quiz(id) ON DELETE SET NULL ON UPDATE CASCADE,
                CONSTRAINT FK_UserAttemptStatus FOREIGN KEY (user_attempt_status_id) REFERENCES UserAttemptStatus(id) ON DELETE NO ACTION ON UPDATE CASCADE
                );
            `
        ).run(
            `
            CREATE TABLE IF NOT EXISTS UserAttemptAnswer (
                id INTEGER CONSTRAINT PK_UserAttemptAnswer PRIMARY KEY AUTOINCREMENT,
                user_attempt_id INT NOT NULL,
                quiz_question_answer_id INT NOT NULL,
                CONSTRAINT FK_UserAttempt FOREIGN KEY (user_attempt_id) REFERENCES UserAttempt(id) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT FK_QuizQuestionAnswer FOREIGN KEY (quiz_question_answer_id) REFERENCES QuizQuestionAnswer(id) ON DELETE NO ACTION ON UPDATE NO ACTION
            );
            `
        );
        let rawJsonData = fs.readFileSync('base_quiz_container.json');
        var quizData = JSON.parse(rawJsonData);
        var stmt = db.prepare("INSERT INTO Quiz (topic_id, title, enabled) VALUES (?, ?, ?);")
        for (key in quizData){
            var values = []
            for(object in quizData[key]){
                console.log(quizData[key][object].value + " , " + quizData[key][object] + " , " + quizData[key][object]);
                stmt.run(quizData[key][object], quizData[key][object], quizData[key][object]);        }
            }
        stmt.finalize();
        
    });

    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });

    //Insert predefined quizez into the database
    /*let rawJsonData = fs.readFileSync('base_quiz_container.json');

    var quizData = JSON.parse(rawJsonData);
    this.quizTable.getById(1);
    for (key in quizData){

        this.quizTable.newEntry(quizData[key]);
    }*/
};



const dbServer = new DatabaseServer(dbFilePath);

/*
class QueryHandler {
    constructor(dbFilePath){
        this.dbFilePath = dbFilePath; 
        console.log("QUERY HANDLER CREATED!!");new sqlite3.Database(__dirname + "/" + dbFile, (err) => {
            if (err) {
                console.log("Could not connect to the database", err);
            }
            else {
                console.log("Succesfully connected to the database");
            }
        });
    }
};

QueryHandler.prototype.executeRUNQuery = function(queryString, params = []){
    console.log("\n\nExecuting RUN: " + queryString);
    console.log("With values: " + params + "\n\n");

    const db = new sqlite3.Database(__dirname + "/" + this.dbFilePath, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });

    db.serialize( () =>{
        var runStmt = db.prepare(queryString);
        runStmt.run(params, function (err) {
            if (err) {
                console.log('Error running query: ', queryString, ", with parameters: " + params);
                console.log(err);
            }
            else {
                console.log("No error caught");
                console.log("\n\nFINISHED Executing RUN: " + queryString + "\n\n");

            }
        });

        runStmt.finalize();
    });

    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });


};

QueryHandler.prototype.executeGETQuery = function(queryString, params = []) {
    console.log("\n\nExecuting GET: " + queryString);
    console.log("With values: " + params);
    const db = new sqlite3.Database(__dirname + "/" + this.dbFilePath, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });

    db.serialize( () => {
        db.each(queryString, params, (err, result) => {
            if(err){
                console.log('Error running GET query: ' + queryString + ", with parameters: " + params);
                console.log(err);
            }
            else{
                console.log("No error caught");
                console.log(result);
                return result;
            }
        });
    });
    console.log("Closing database!");

    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });
};

QueryHandler.prototype.executeALLQuery = function(queryString, params = []) {

    const db = new sqlite3.Database(__dirname + "/" + this.dbFilePath, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });

    this.db.all(queryString, params, (err, result) => {
        if (err){
            console.log('Error running ALL query: ' + queryString + ", with parameters: " + params);
            console.log(err);
        }
        else{
            console.log("No error caught");
        }
    });
   
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });
};


class DatabaseTable {
    constructor(queryHandler, tableName, attributeStatements = []){
        this.queryHandler = queryHandler;
        this.tableName = tableName;
    }
};

DatabaseTable.prototype.createTable = function(attributeStatements = [], constraints = [], callback){
    this.attributes = [];
    var queryString = 'CREATE TABLE IF NOT EXISTS ' + this.tableName + " (";

    var statementCounter = attributeStatements.length;
    for (statement of attributeStatements){
        queryString += statement + (!--statementCounter ? "" : "," );
        this.attributes.push(statement.split(' ')[0]);
    }

    this.attributes.splice(this.attributes.indexOf("id"), 1); //Remove the "id" variable from the attribute list, as it is not used during queries


    var constraintCounter = constraints.length;
    queryString += (!constraintCounter ? ");" : ",");

    for (constraint of constraints){
        queryString += constraint + (!--constraintCounter ? ");" : "," );
    }

    

    this.queryHandler.executeRUNQuery(queryString);

    callback();
};


DatabaseTable.prototype.newEntry = function(attributeValues = []) {
    var queryString = "INSERT INTO " + this.tableName  + " (" + this.attributes.toString() + ") VALUES (";
    var statementCounter = attributeValues.length;
    for (var i = 0; i < attributeValues.length; i++){
        queryString += "?" + (!--statementCounter ? ");" : "," );
    }
    console.log(queryString);

    return this.queryHandler.executeRUNQuery(queryString, attributeValues);
};

DatabaseTable.prototype.getById = function(id) {
    return this.queryHandler.executeGETQuery(
        'SELECT * FROM ' + this.tableName + ' WHERE id = ?;', [id]
    );
};



-------------------------------------------------
const quizTopicTable = new DatabaseTable(dbServer, "QuizTopic");
const quizTable = new DatabaseTable(dbServer, "Quiz");

quizTopicTable.createTable(["id INTEGER CONSTRAINT PK_QuizTopic PRIMARY KEY AUTOINCREMENT", 
                                     "title VARCHAR(50) NOT NULL", 
                                     "descriptionLink VARCHAR(255) NOT NULL", 
                                     "enabled BOOLEAN NOT NULL"]);
quizTable.createTable(["id INTEGER CONSTRAINT PK_QuizTopic PRIMARY KEY AUTOINCREMENT", 
                       "topicId INT NOT NULL",
                       "title VARCHAR(50) NOT NULL", 
                       "enabled BOOLEAN NOT NULL",
                       ], [
                        "CONSTRAINT FK_Quiz_topic FOREIGN KEY (topicId) REFERENCES QuizTopic(id) ON DELETE NO ACTION ON UPDATE CASCADE"
                       ]);


console.log("Adding values");
var entryValues = ["'HTML Tutorial'", "'LOL NEE'", true];

quizTopicTable.newEntry(entryValues);
console.log("GETTING BY ID");
quizTopicTable.getById(1);
console.log("GITGOT BY ID JO");


                     */                   
/*
class QuizTopic{
    constructor(db){
        this.db = db;
    }
};

QuizTopic.prototype.createTable = function() {
    const queryString = `
        CREATE TABLE IF NOT EXISTS QuizTopic (
            id INTEGER CONSTRAINT PK_Quiz_topic PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(50) NOT NULL,
            descriptionLink VARCHAR(255) NOT NULL,
            enabled BOOLEAN NOT NULL
        );`;
    return this.db.executeRUNQuery(queryString);
};

QuizTopic.prototype.newEntry = function(title, descriptionLink, enabled) {
    console.log("Entered quiztopic newentry function");
    var TEMP =  this.db.executeRUNQuery(
        'INSERT INTO QuizTopic (title, descriptionLink, enabled) VALUES ( ?, ?, ?);'
    , [title, descriptionLink, enabled]
    );
    console.log("DIT WORD ER GERETURNED: " + TEMP);
    return TEMP;
};

QuizTopic.prototype.updateEntry = function(updatedQuizTopic) {
    const {id, title, descriptionLink, enabled} = updatedQuizTopic;
    return this.db.executeRUNQuery(`
        UPDATE QuizTopic 
            SET title = ?,
                descriptionLink = ?,
                enabled = ?
            WHERE id = ?;
        `, [title, descriptionLink, enabled, id]
    );
};

QuizTopic.prototype.deleteEntry = function(entryId) {
    return this.db.executeRUNQuery(`
        DELETE FROM QuizTopic 
            WHERE id = ?;
        `, [id]
    );
};

QuizTopic.prototype.getEntryById = function(id) {
    return this.db.executeGETQuery(`
        SELECT * FROM QuizTopic
            WHERE id = ?;
        `, [id]
    );
};


class Quiz{
    constructor(db){
        this.db = db;
    };
};

Quiz.prototype.createTable = function() {
    const queryString =`
        CREATE TABLE IF NOT EXISTS Quiz (
            id INTEGER CONSTRAINT PK_Quiz PRIMARY KEY AUTOINCREMENT,
            topicId INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            enabled BOOLEAN NOT NULL,
            CONSTRAINT FK_Quiz_topic FOREIGN KEY (topicId) REFERENCES QuizTopic(id) ON DELETE NO ACTION ON UPDATE CASCADE
        );`;
    return this.db.executeRUNQuery(queryString);
};

Quiz.prototype.newEntry = function(topicId, title, enabled) {
    console.log("Entered quiz newentry function");

    return this.db.executeRUNQuery(`
        INSERT INTO Quiz ( topicId, title, enabled) VALUES (?, ?, ?);
    `, [topic_id, title, enabled]
    );
};

Quiz.prototype.updateEntry = function(updatedQuiz) {
    const {id, topicId, title, enabled} = updatedQuiz;
    return this.db.executeRUNQuery(`
        UPDATE Quiz
            SET topicIdd = ?,
                title = ?,
                enabled = ?
            WHERE id = ?;
        `, [topic_id, title, enabled, id]
    );
};

Quiz.prototype.deleteEntry = function(entryId) {
    return this.db.executeRUNQuery(`
        DELETE FROM Quiz 
            WHERE id = ?;
        `, [id]
    );
};

Quiz.prototype.getEntryById = function(id) {
    return this.db.executeGETQuery(`
        SELECT * FROM Quiz
            WHERE id = ?;
        `, [id]
    );
};

Quiz.prototype.getAllEntries = function() {
    return this.db.executeALLQuery(`
        SELECT * FROM Quiz;
        `
    );
}



*/






/*const quiztopic1 = {title : 'html tutorial', descriptionLink : 'Lol, nee', enabled : true};
const quiztopic2 = {title : 'html best practice', descriptionLink : 'Wat zei ik nou. Nee', enabled : false};
const quiz1 = {topicId : 1, title : "Basic HTML #1", enabled : true};
const quiz2 = {topicId : 2, title : "Basic HTML #2", enabled : false};

console.log("CREATING QUIZ OBJECT");
const quizTopicRepo = new QuizTopic(dbServer);
console.log("CREATING QUIZ TOPIC");
const quizRepo = new Quiz(dbServer);

let quizId;

console.log("Creating quiz database");

quizTopicRepo.createTable()
    .then(() => {
        console.log("Creating quiz table");
        quizRepo.createTable();
    })
    .then(() => {
        console.log("New entry into quiz topic...");
        return quizTopicRepo.newEntry(quiztopic1.title, quiztopic1.descriptionLink, quiztopic1.enabled)
    })
    .then((data) => {
        console.log("Getting data id...");
        console.log(data);
        topicId = data.id;
        const quizez = [
            {
                topicId,
                title : "Basic HTML #1",
                enabled: true
            },
            {
                topicId,
                title : "Basic HTML #2",
                enabled: false
            },
        ];
        console.log("Entering data into quiz....");
        return Promise.all(quizes.map((quiz) => {
            console.log("Reading quiz: " + quiz);
            const {topicId, title, enabled} = quiz;
            console.log("ADDING: " + quiz);
            return quizRepo.newEntry(topicId, title, enabled);
        }))
    })
    .then(() => {
        console.log("Entering data into quiz....");
        quizTopicRepo.getEntryById(1);
        console.log("Getting entry");
    })
    .then((quizTopic) => {
        console.log(`\nRetrieved quiz topic from database`);
        console.log(`quiz topic id = ${quizTopic.id}`);
        console.log(`quiz topic title = ${quizTopic.title}`);
        console.log(`quiz topic description link = ${quizTopic.descriptionLink}`);
        console.log(`quiz topic enabled = ${quizTopic.enabled}`);
        return db.executeALLQuery(`
            SELECT * FROM quiz WHERE topicId = ${quizTopic.id}
        `);
    })
    .then((quizes) => {
        console.log(`\nRetrieved quizez from database`);
        return new Promise((resolve, reject) => {
            quizes.forEach((quiz) => {
                console.log(`quiz id = ${quiz.id}`);
                console.log(`quiz topic id = ${quiz.topicId}`);
                console.log(`quiz title = ${quiz.title}`);
                console.log(`quiz enabled = ${quiz.enabled}`);
            });
        })
        resolve('succes');
    })
    .catch((err) => {
        console.log("Error!!!: ");
        console.log(JSON.stringify(err))
    })
*/



