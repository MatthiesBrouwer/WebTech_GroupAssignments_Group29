
const { raw } = require('express');
const { resolve } = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require("fs");
const { RequestHeaderFieldsTooLarge } = require('http-errors');


const required = name => {
    throw new Error("Parameter " + name + " is required");
};


class DatabaseTable {
    constructor(tableName, attributes){
        this.tableName = tableName;
        this.attributes = attributes;
    }
};


DatabaseTable.prototype.createTable = function(attributeStatements = [], constraints = []){
    var queryString = 'CREATE TABLE IF NOT EXISTS ' + this.tableName + " (";

    var statementCounter = attributeStatements.length;
    for (statement of attributeStatements){
        queryString += statement + (!--statementCounter ? "" : "," );
    }

    var constraintCounter = constraints.length;
    queryString += (!constraintCounter ? ");" : ",");

    for (constraint of constraints){
        queryString += constraint + (!--constraintCounter ? ");" : "," );
    }

    return queryString;
};

DatabaseTable.prototype.newEntryStatement = function() {
    var queryString = "INSERT INTO " + this.tableName  + " (" + this.attributes.toString() + ") VALUES (";
    var statementCounter = this.attributes.length;
    for (var i = 0; i < this.attributes.length; i++){
        queryString += "?" + (!--statementCounter ? ");" : "," );
    }

    return queryString;
};


//Returns the tables name, attributenames and the filepath of the backup file
DatabaseTable.prototype.getTableInfo = function(backupFilePath){
    return [this.tableName, this.attributes, __dirname + "/databaseBackupFiles/" + this.tableName + "_backup_container.json"];
};




class DatabaseServer {
    constructor(dbFile) {
        this.dbFile = __dirname + "/" + dbFile;
        var exists = fs.existsSync(this.dbFile);
        this.databaseTables = {};
        this.databaseTables["QuizTopic"] = new DatabaseTable("QuizTopic", ["title", "description_link", "enabled"]);
        this.databaseTables["Quiz"] = new DatabaseTable("Quiz", ["topic_id", "title", "enabled" ]);
        this.databaseTables["QuizQuestionType"] = new DatabaseTable("QuizQuestionType", ["type"]);
        this.databaseTables["QuizQuestion"] = new DatabaseTable("QuizQuestion", ["quiz_id", "quiz_question_type_id", "title", "problem_statement", "enabled"]);
        this.databaseTables["QuizQuestionAnswer"] = new DatabaseTable("QuizQuestionAnswer", ["quiz_question_id", "answer", "correct"]);
        this.databaseTables["User"] = new DatabaseTable("User", ["firstname", "middlename", "lastname", "username", "password"]);
        this.databaseTables["UserAttemptStatus"] = new DatabaseTable("UserAttemptStatus", ["status"]);
        this.databaseTables["UserAttempt"] = new DatabaseTable("UserAttempt", ["user_id", "quiz_id", "user_attempt_status_id", "session_id"]);
        //this.databaseTables["UserAttemptAnswer"] = new DatabaseTable("UserAttemptAnswer", ["user_attempt_id", "quiz_question_answer_id"]);
        this.databaseTables["UserAttemptAnswer"] = new DatabaseTable("UserAttemptAnswer", ["quiz_question_id", "user_attempt_id", "user_question_answer", "correct"]);
        
        console.log("DIRNAME: " + __dirname);

        if(!exists) {
            fs.openSync(this.dbFile, "w");
            this.createDatabase();
        }

    };
};


DatabaseServer.prototype.createDatabase = function(){
    
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });

    console.log("running");
    
    db.serialize( () => {
        //Create all tabels
        db.run(
            this.databaseTables["QuizTopic"].createTable([
                "id INTEGER CONSTRAINT PK_QuizTopic PRIMARY KEY AUTOINCREMENT", 
                "title VARCHAR(50) NOT NULL", 
                "description_link VARCHAR(255) NOT NULL", 
                "enabled BOOLEAN NOT NULL"
            ])
        ).run(
            this.databaseTables["Quiz"].createTable([
                "id INTEGER CONSTRAINT PK_QuizTopic PRIMARY KEY AUTOINCREMENT", 
                "topic_id INT NOT NULL",
                "title VARCHAR(50) NOT NULL", 
                "enabled BOOLEAN NOT NULL",
                ],[
                "CONSTRAINT FK_QuizTopic FOREIGN KEY (topic_id) REFERENCES QuizTopic(id) ON DELETE NO ACTION ON UPDATE CASCADE"
            ])
        ).run(
            this.databaseTables["QuizQuestionType"].createTable([
                "id INTEGER CONSTRAINT PK_QuizQuestionType PRIMARY KEY AUTOINCREMENT", 
                "type VARCHAR(50) NOT NULL UNIQUE"
            ])
        ).run(
            this.databaseTables["QuizQuestion"].createTable([
                "id INTEGER CONSTRAINT PK_QuizQuestion PRIMARY KEY AUTOINCREMENT", 
                "quiz_id INT NOT NULL",
                "quiz_question_type_id INT NOT NULL",
                "title VARCHAR(50) NOT NULL",
                "problem_statement VARCHAR(255) NOT NULL",
                "enabled BOOLEAN NOT NULL"
                ],[
                "CONSTRAINT FK_Quiz FOREIGN KEY (quiz_id) REFERENCES Quiz(id) ON DELETE CASCADE ON UPDATE CASCADE",
                "CONSTRAINT FK_QuizQuestionType FOREIGN KEY (quiz_question_type_id) REFERENCES QuizQuestionType(id) ON DELETE NO ACTION ON UPDATE CASCADE"
            ])
        ).run(
            this.databaseTables["QuizQuestionAnswer"].createTable([
                "id INTEGER CONSTRAINT PK_QuizQuestionAnswer PRIMARY KEY AUTOINCREMENT", 
                "quiz_question_id INT NOT NULL",
                "answer VARCHAR(255) NOT NULL",
                "correct BOOLEAN NOT NULL"
                ],[
                "CONSTRAINT FK_QuizQuestion FOREIGN KEY (quiz_question_id) REFERENCES QuizQuestion(id) ON DELETE CASCADE ON UPDATE CASCADE"
            ])
        ).run(
            this.databaseTables["User"].createTable([
                "id INTEGER CONSTRAINT PK_User PRIMARY KEY AUTOINCREMENT",
                "firstname VARCHAR(50) NOT NULL",
                "middlename VARCHAR(50)",
                "lastname VARCHAR(50) NOT NULL",
                "username VARCHAR(50) NOT NULL UNIQUE",
                "password VARCHAR(50) NOT NULL"
            ])
        ).run(
            this.databaseTables["UserAttemptStatus"].createTable([
                "id INTEGER CONSTRAINT PK_UserAttemptStatus PRIMARY KEY AUTOINCREMENT",
                "status VARCHAR(50) NOT NULL UNIQUE"
            ])
        ).run(
            this.databaseTables["UserAttempt"].createTable([
                "id INTEGER CONSTRAINT PK_UserAttempt PRIMARY KEY AUTOINCREMENT",
                "user_id INT NOT NULL",
                "quiz_id INT NOT NULL",
                "user_attempt_status_id INT ONT NULL",
                "session_id VARCHAR(255) NOT NULL",
                ],[
                "CONSTRAINT FK_User FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE",
                "CONSTRAINT FK_Quiz FOREIGN KEY (quiz_id) REFERENCES Quiz(id) ON DELETE SET NULL ON UPDATE CASCADE",
                "CONSTRAINT FK_UserAttemptStatus FOREIGN KEY (user_attempt_status_id) REFERENCES UserAttemptStatus(id) ON DELETE NO ACTION ON UPDATE CASCADE"
            ])
        /*).run(
            this.databaseTables["UserAttemptAnswer"].createTable([
                "id INTEGER CONSTRAINT PK_UserAttemptAnswer PRIMARY KEY AUTOINCREMENT",
                "user_attempt_id INT NOT NULL",
                "quiz_question_answer_id INT NOT NULL",
                ],[
                "CONSTRAINT FK_UserAttempt FOREIGN KEY (user_attempt_id) REFERENCES UserAttempt(id) ON DELETE CASCADE ON UPDATE CASCADE",
                "CONSTRAINT FK_QuizQuestionAnswer FOREIGN KEY (quiz_question_answer_id) REFERENCES QuizQuestionAnswer(id) ON DELETE NO ACTION ON UPDATE NO ACTION"
            ])
        );*/
        ).run(
            this.databaseTables["UserAttemptAnswer"].createTable([
                "id INTEGER CONSTRAINT PK_UserAttemptAnswer PRIMARY KEY AUTOINCREMENT",
                "quiz_question_id INT NOT NULL",
                "user_attempt_id INT NOT NULL",
                "user_question_answer VARCHAR(50) NOT NULL",
                "correct BOOLEAN NOT NULL"
                ],[
                "CONSTRAINT FK_UserAttempt FOREIGN KEY (user_attempt_id) REFERENCES UserAttempt(id) ON DELETE CASCADE ON UPDATE CASCADE",
                "CONSTRAINT FK_QuizQuestion FOREIGN KEY (quiz_question_id) REFERENCES QuizQuestion(id) ON DELETE CASCADE ON UPDATE CASCADE"

            ])
        );
        console.log("FILLING DATA INTO TABLES");
        for (tableName in this.databaseTables){
            console.log(tableName);
            var tableInfo = this.databaseTables[tableName].getTableInfo();
            if(fs.existsSync(tableInfo[2])){
                var rawJsonData = fs.readFileSync(tableInfo[2]);
                var backupDataObjects = JSON.parse(rawJsonData)[tableInfo[0]];
                console.log(backupDataObjects);
                var entryStmt = db.prepare(this.databaseTables[tableName].newEntryStatement());
                for (object in backupDataObjects){
                    var attributeValues = [];
                    for (attributeName of tableInfo[1]){
                        attributeValues.push(backupDataObjects[object][attributeName]);
                    } 
                    console.log("PUSHING " + attributeValues + " INTO " +  attributeName);
                    entryStmt.run(attributeValues);
                }
                entryStmt.finalize(); 
            }
        }
    }, (err) => {
        if(err){
            console.log("ERROR CAUGHT DURING CREATION");

        }
    });

    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.getUserById = function(userId = required('userId'), callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    }); 
    db.serialize( () => {
        var stmt = db.prepare(`SELECT * FROM User WHERE id = ?;`);
        user = stmt.get([userId], (err, user) => {
            if (err){
                console.log("Could not find user by id: " + userId);
                throw err;
            }
            callback(user);
        });
        stmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.getUserByUsername = function(username = required('username'), callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    db.serialize( () => {
        
        var stmt = db.prepare('SELECT * FROM User WHERE username=?;');
        stmt.get([username], (err, user) => {
            if(err){
                console.log("Could not find user by username: " + username);
                throw err;
            }
            console.log("FOUND USER: " + user);
            for(key in user){
                console.log("\t" + key + " : " + user[key]);
            }
            callback(user);
        });
        stmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});

};

DatabaseServer.prototype.addNewUser = function(
                                        firstname =  required('firstname'), 
                                        middlename = null, 
                                        lastname =   required('lastname'), 
                                        username =   required('username'), 
                                        password =   required('password')){

    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    db.serialize( () => {
        var entryStmt = db.prepare(this.databaseTables["User"].newEntryStatement());
        entryStmt.run([firstname, middlename, lastname, username, password], (err) => {
            if (err){
                console.log("Error adding new user: \n\t" + firstname + "\n\t" + middlename + "\n\t" + lastname  + "\n\t" + username  + "\n\t" + password );
                throw err;
            }
        });
        entryStmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.removeUser = function(userId = required('userId')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    db.serialize( () => {
        var deleteStmt = db.prepare(`DELETE FROM User WHERE id = ?;`);
        deleteStmt.run([userId], (err) => {
            if (err){
                console.log("Could not find user by id: " + userId);
                throw err;
            }
            console.log("Removed user with id: " + userId);
        });
        deleteStmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.updateUser = function(updatedUser = required('UpdatedUser')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });

    db.serialize( () => {
        var updateStmt = db.prepare(`UPDATE User SET firstname=?, middlename=?, lastname=?, username=?, password=? WHERE id = ?;`);
        console.log("RUNNING");
        updateStmt.run( [updatedUser.firstname,
                         updatedUser.middlename,
                         updatedUser.lastname,
                         updatedUser.username,
                         updatedUser.password,
                         updatedUser.id], (err) => {
            if (err){
                console.log("Could not find user: " + updatedUser);
                throw err;
            }
            console.log("updated user: " + updatedUser.firstname);
        });
        updateStmt.finalize();
    });

    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.getTopicQuizes = function(callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    
    db.serialize( () => {
        var stmt = db.prepare(`SELECT QuizTopic.id AS topicId, QuizTopic.title AS topicTitle, Quiz.id AS quizId, Quiz.title as quizTitle FROM QuizTopic JOIN Quiz ON QuizTopic.id = Quiz.topic_id;`);

        stmt.all((err, topicQuizes) => {
            if (err){
                console.log("Could not find any topics ");
                throw err;
            }
            topics = [];
            for (quiz of topicQuizes) {
                if(!topics[quiz.topicId - 1]){
                    topics[quiz.topicId - 1] = {
                        topicId : quiz.topicId,
                        topicTitle : quiz.topicTitle,
                        quizes : []
                    };
                }

                topics[quiz.topicId - 1].quizes.push({quizId : quiz.quizId, quizTitle : quiz.quizTitle});
                
            }
            callback(topics);
        });
        stmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.getQuizById = function(quizId = required('quizId'), callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    }); 
    db.serialize( () => {
        var stmt = db.prepare(`SELECT * FROM Quiz WHERE id = ?;`);

        stmt.get([quizId], (err, quiz) => {
            if (err){
                console.log("Could not find quiz by id: " + quizId);
                throw err;
            }
            callback(quiz);
        });
        stmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.getQuizQuestions = function(quizId = required('quizId'), callback=required('callback')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    }); 
    db.serialize( () => {
        var quizStmt = db.prepare(`SELECT * FROM QuizQuestion WHERE quiz_id = ?;`);


        quizStmt.all([quizId], (err, result) => {
            if (err){
                console.log("Could not find quiz by id: " + quizId);
                throw err;
            }
            for(key in result){
                console.log("KEY" + key + " : " + result[key])
            }

            callback(result)
        });
        quizStmt .finalize();

    });
    db.close((err) => { if (err) {return console.error(err.message);}});
}


DatabaseServer.prototype.getQuestionById = function(questionId = required('questionId'), callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    }); 
    console.log("DATABASE QUESTIONED");

    
    db.serialize( () => {
        var answerStmt = db.prepare(`SELECT * FROM QuizQuestionAnswer WHERE quiz_question_id = ?;`);
        var answerList = [];
        answerStmt.each([questionId], (err, result) => {
            if (err){
                console.log("Could not find answers for question by id: " + questionId);
                throw err;
            }
            console.log("FOUND ANSWERLIST");
            answerList.push(result);
        });
        answerStmt.finalize();


        var questionStmt = db.prepare(`SELECT * FROM QuizQuestion WHERE id = ?;`);

        questionStmt.get([questionId], (err, result) => {
            if (err){
                console.log("Could not find question by id: " + questionId);
                throw err;
            }
            result.answerList = answerList;
            console.log("FOUND QUESTION WITH ID: " + result.id);

            callback(result);
        });
        questionStmt.finalize();

        console.log("CALLING STATEMENT FOR QUESTIONS");

        
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.getAnswersByQuestionId = function(questionId = required('questionIndex'), callback = required('callback')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    }); 
    db.serialize( () => {

        var answerStmt = db.prepare(`SELECT * FROM QuizQuestionAnswer WHERE quiz_question_id=?;`);
        console.log("\tDATABASE LOG: GOING TO RUN ANSWERSTATEMENT");
        answerStmt.all([questionId], (err, selectedAnswers) => {
            console.log("\tDATABASE LOG: ANSWER STATEMENT HADS RUN");
            if (err){
                console.log("Could not find answers for question by id: " + questionId);
                throw err;
            }
            console.log("\tDATABASE LOG: ENTERED FINAL CALLBACK FUNCTION")
            callback(selectedAnswers);
        });
        answerStmt.finalize();

    });
    db.close((err) => { if (err) {return console.error(err.message);}});
} 



DatabaseServer.prototype.getUserAttemptById = function(attemptId = required('attemptId'), callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    }); 
    db.serialize( () => {
        //var stmt = db.prepare(`SELECT Quiz.id, Quiz.title, QuizQuestion.title FROM (SELECT * FROM Quiz WHERE Quiz.id = ?) AS Quiz JOIN QuizQuestion ON Quiz.id = QuizQuestion.quiz_id;`);
        var stmt = db.prepare(`SELECT * FROM UserAttempt WHERE id = ?;`);
        user = stmt.get([attemptId], (err, attempt) => {
            if (err){
                throw err;
            }
            callback(attempt);
        });
        stmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};


DatabaseServer.prototype.addUserAttempt = function(username =  required('username'), 
                                                   quizId = required('quizId'),
                                                   sessionId = required('sessionId'),
                                                   callback = required('callback')){

    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    db.serialize( () => {

        var entryStmt = db.prepare('INSERT INTO UserAttempt (user_id,quiz_id,user_attempt_status_id,session_id) VALUES ((SELECT id FROM User WHERE username=?),?,1,?)');

        entryStmt.run([username, quizId, sessionId], (err) => {
            console.log("\tDATABASE LOG: RUN ENTRY STMNT FOR UserAttempt");
            if (err){
                console.log("Error adding new user attempt: \n\tusername : " + username  + "\n\t" + "quizId : " + quizId + "\n\t" + "sessionId : " + sessionId);
                throw err;
            }
            console.log("\tDATABASE LOG: SUCCESFULLY ADDED");

            
        });
        entryStmt.finalize();

        var attemptStmt = db.prepare("SELECT id FROM UserAttempt WHERE user_id=(SELECT User.id FROM User WHERE username=?)ORDER BY id DESC LIMIT 1;");
            attemptStmt.get([username], (err, userAttemptId) => {
                console.log("\tDATABASE LOG: RUNNING QUESTION STATEMENT");
                if (err){
                    console.log("Error finding userAttempt: \n\tuserAttemptId : " + userAttemptId);
                    throw err;
                }
                else if(!userAttemptId){
                    console.log("User has no active attempts");
                    throw err;
                }
                callback(userAttemptId.id);
            })
            attemptStmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};


DatabaseServer.prototype.getUserAttemptAnswer = function(attemptId = required('attemptId'), questionId = required('questionId'), callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    }); 
    db.serialize( () => {
        //var stmt = db.prepare(`SELECT Quiz.id, Quiz.title, QuizQuestion.title FROM (SELECT * FROM Quiz WHERE Quiz.id = ?) AS Quiz JOIN QuizQuestion ON Quiz.id = QuizQuestion.quiz_id;`);
        //var stmt = db.prepare(`SELECT UserAttemptAnswer.quiz_question_answer_id FROM UserAttemptAnswer WHERE UserAttemptAnswer.user_attempt_id=? AND UserAttemptAnswer.quiz_question_answer_id IN 
        //(SELECT quizQuestionAnswer.id FROM quizQuestionAnswer WHERE quizQuestionAnswer.quiz_question_id=?);`);
        var stmt = db.prepare(`SELECT * FROM UserAttemptAnswer WHERE user_attempt_id=? AND quiz_question_id=?;`)
        
        user = stmt.get([attemptId, questionId], (err, attemptAnswer) => {
            if (err){
                throw err;
            }
            console.log("SEARCHED DATABASE FOR :");
            console.log("\tattemptId: " + attemptId);
            console.log("\tquestionId: " + questionId);
            console.log("\tAttempt answer: ");
            for(key in attemptAnswer){
                console.log("\t" + key + " : " + attemptAnswer[key]);
            }
            callback(attemptAnswer);
        });
        stmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.addUserAttemptAnswer = function(questionId = required('questionId'),
                                                         userAttemptId =  required('userAttemptId'), 
                                                         userAnswer = required('userAnswer'),
                                                         correct = required('correct'), callback = required('callback function')){

    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    db.serialize( () => {

            var entryStmt = db.prepare(this.databaseTables["UserAttemptAnswer"].newEntryStatement());
            entryStmt.run([questionId, userAttemptId, userAnswer, correct], (err) => {
                if (err){
                    console.log("Error adding new user attempt answer: userAttemptId : " + userAttemptId  + "\n\t" + "userAnswerId : " + userAnswerId );
                    throw err;
                }
            });
            entryStmt.finalize();
            callback();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};

DatabaseServer.prototype.getCorrectAnswer = function(questionId = required('questionId'), callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    }); 
    db.serialize( () => {

        var stmt = db.prepare(`SELECT * FROM QuizQuestionAnswer WHERE quiz_question_id=? AND correct=true;`)
        
        user = stmt.get([questionId], (err, correctAnswer) => {
            if (err){
                throw err;
            }
            console.log("FOUND ANSWER: " + correctAnswer);
            callback(correctAnswer);
        });
        stmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};

/*
DatabaseServer.prototype.getTopics = function(callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    
    db.serialize( () => {
        var stmt = db.prepare(`SELECT * FROM QuizTopic;`);
        stmt.all((err, quizTopics) => {
            if (err){
                console.log("Could not find any topics ");
                throw err;
            }
            console.log(quizTopics)
            callback(quizTopics);
        });
        stmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};*/

DatabaseServer.prototype.getTopicQuizes = function(callback = required('callback function')){
    const db = new sqlite3.Database(this.dbFile, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    
    db.serialize( () => {
        var stmt = db.prepare(`SELECT QuizTopic.id AS topicId, QuizTopic.title AS topicTitle, Quiz.id AS quizId, Quiz.title as quizTitle FROM QuizTopic JOIN Quiz ON QuizTopic.id = Quiz.topic_id;`);

        stmt.all((err, topicQuizes) => {
            if (err){
                console.log("Could not find any topics ");
                throw err;
            }
            topics = [];
            for (quiz of topicQuizes) {
                if(!topics[quiz.topicId - 1]){
                    topics[quiz.topicId - 1] = {
                        topicId : quiz.topicId,
                        topicTitle : quiz.topicTitle,
                        quizes : []
                    };
                }

                topics[quiz.topicId - 1].quizes.push({quizId : quiz.quizId, quizTitle : quiz.quizTitle});
                
            }
            callback(topics);
        });
        stmt.finalize();
    });
    db.close((err) => { if (err) {return console.error(err.message);}});
};





DatabaseServer.prototype.testfunction = function() {
    console.log("WERKT");
};

module.exports = DatabaseServer;
