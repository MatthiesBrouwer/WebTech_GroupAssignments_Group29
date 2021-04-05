
const { raw } = require('express');
const { resolve } = require('path');
const sqlite3 = require('sqlite3').verbose();
var dbFilePath = "test.db";
const fs = require("fs");


const required = name => {
    throw new Error(`Parameter ${name} is required`);
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
    console.log(queryString);

    return queryString;
};


//Returns the tables name, attributenames and the filepath of the backup file
DatabaseTable.prototype.getTableInfo = function(backupFilePath){
    return [this.tableName, this.attributes, "./databaseBackupFiles/" + this.tableName + "_backup_container.json"];
};




class DatabaseServer {
    constructor(dbFilePath) {
        this.dbFilePath = dbFilePath;
        var exists = fs.existsSync(dbFilePath);
        this.databaseTables = {};
        this.databaseTables["QuizTopic"] = new DatabaseTable("QuizTopic", ["title", "description_link", "enabled"]);
        this.databaseTables["Quiz"] = new DatabaseTable("Quiz", ["topic_id", "title", "enabled" ]);
        this.databaseTables["QuizQuestionType"] = new DatabaseTable("QuizQuestionType", ["type"]);
        this.databaseTables["QuizQuestion"] = new DatabaseTable("QuizQuestion", ["quiz_id", "quiz_question_type_id", "title", "problem_statement", "enabled"]);
        this.databaseTables["QuizQuestionAnswer"] = new DatabaseTable("QuizQuestionAnswer", ["quiz_question_id", "answer", "correct"]);
        this.databaseTables["User"] = new DatabaseTable("User", ["firstname", "middlename", "lastname", "username", "password"]);
        this.databaseTables["UserAttemptStatus"] = new DatabaseTable("UserAttemptStatus", ["status"]);
        this.databaseTables["UserAttempt"] = new DatabaseTable("UserAttempt", ["user_id", "quiz_id", "user_attempt_status_id", "session_id"]);
        this.databaseTables["UserAttemptAnswer"] = new DatabaseTable("UserAttemptAnswer", ["user_attempt_id", "quiz_question_answer_id"]);


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
                "session_id INT NOT NULL",
                ],[
                "CONSTRAINT FK_User FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE",
                "CONSTRAINT FK_Quiz FOREIGN KEY (quiz_id) REFERENCES Quiz(id) ON DELETE SET NULL ON UPDATE CASCADE",
                "CONSTRAINT FK_UserAttemptStatus FOREIGN KEY (user_attempt_status_id) REFERENCES UserAttemptStatus(id) ON DELETE NO ACTION ON UPDATE CASCADE"
            ])
        ).run(
            this.databaseTables["UserAttemptAnswer"].createTable([
                "id INTEGER CONSTRAINT PK_UserAttemptAnswer PRIMARY KEY AUTOINCREMENT",
                "user_attempt_id INT NOT NULL",
                "quiz_question_answer_id INT NOT NULL",
                ],[
                "CONSTRAINT FK_UserAttempt FOREIGN KEY (user_attempt_id) REFERENCES UserAttempt(id) ON DELETE CASCADE ON UPDATE CASCADE",
                "CONSTRAINT FK_QuizQuestionAnswer FOREIGN KEY (quiz_question_answer_id) REFERENCES QuizQuestionAnswer(id) ON DELETE NO ACTION ON UPDATE NO ACTION"
            ])
        );

        for (tableName in this.databaseTables){
            var tableInfo = this.databaseTables[tableName].getTableInfo();
            if(fs.existsSync(tableInfo[2])){
                var rawJsonData = fs.readFileSync(tableInfo[2]);
                var backupDataObjects = JSON.parse(rawJsonData)[tableInfo[0]];
    
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
    const db = new sqlite3.Database(__dirname + "/" + this.dbFilePath, (err) => {
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
    const db = new sqlite3.Database(__dirname + "/" + this.dbFilePath, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    
    db.serialize( () => {
        var stmt = db.prepare(`SELECT * FROM User WHERE username = ?;`);
        stmt.get([username], (err, user) => {
            if (err){
                console.log("Could not find user by username: " + username);
                throw err;
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

    const db = new sqlite3.Database(__dirname + "/" + this.dbFilePath, (err) => {
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
    const db = new sqlite3.Database(__dirname + "/" + this.dbFilePath, (err) => {
        if (err) {
            console.log("Could not connect to the database", err);
        }
    });
    db.serialize( () => {
        var deleteStmt = db.prepare(`DELETE FROM User WHERE id = ?;`);
        deleteStmt.run([username], (err, user) => {
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

const dbServer = new DatabaseServer(dbFilePath);
//console.log("DB Created");
dbServer.getUserById(2, function(user){console.log("Gotten user: " + user["id"]);});
//console.log("User gitotten");
dbServer.getUserByUsername("MatthiesBrouwer", function(user){console.log("Gotten user: " + user["id"]);});
//console.log("User added");

//dbServer.addNewUser(firstname = "Maya", middlename = null, lastname = "Brouwer", username="I_Screm_too_much", password = "AAAAAAAAAAAAAAAAHHH");

//user = dbServer.getUserById(4);

console.log(user);

dbServer.removeUser(4);
