const sqlite3 = require('sqlite3');



class DatabaseServer {
    constructor(dbFilePath){
        this.db = new sqlite3.Database(__dirname + "/" + dbFile, (err) => {
            if (err) {
                console.log("Could not connect to the database", err);
            }
            else {
                console.log("Succesfully connected to the database");
            }
        });
    }
};

DatabaseServer.prototype.executeRUNQuery = function(queryString, params = []){
    return new Promise((resolve, reject) => {
        this.db.run(queryString, params, (err) => {
            if (err) {
                console.log('Error running query: ', queryString, ", with parameters: " + params);
                console.log(err);
                reject(err);
            }
            else {
                resolve( {id : this.lastID})
            }
        });
    });
};

DatabaseServer.prototype.executeGETQuery = function(queryString, params = []) {
    return new Promise((resolve, reject) => {
        this.db.get(queryString, params, (err, result) => {
            if(err){
                console.log('Error running GET query: ' + queryString + ", with parameters: " + params);
                console.log(err);
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};

DatabaseServer.prototype.executeALLQuery = function(queryString, params = []) {
    return new Promise((resolve, reject) => {
        this.db.all(queryString, params, (err, result) => {
            if (err){
                console.log('Error running ALL query: ' + queryString + ", with parameters: " + params);
                console.log(err);
                reject(err);
            }
            else{
                resolve(result);
            }
        });
    });
};




/*QUIZ TOPIC*/
class QuizTopic{
    constructor(db){
        this.db = db;
    }
};

QuizTopic.prototype.createTable = function() {
    const queryString = `
        CREATE TABLE IF NOT EXISTS QuizTopic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(50) NOT NULL,
            descriptionLink VARCHAR(255) NOT NULL,
            enabled BOOLEAN NOT NULL,
            CONSTRAINT PK_Quiz_topic PRIMARY KEY (id)
        );`;
    return this.db.executeRUNQuery(queryString);
};

QuizTopic.prototype.newEntry = function(title, descriptionLink, enabled) {
    return this.db.executeRUNQuery(
        'INSERT INTO QuizTopic (title, descriptionLink, enabled) VALUES ( ?, ?, ?);'
    , [title, descriptionLink, enabled]
    );
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


/*QUIZ*/
class Quiz{
    constructor(db){
        this.db = db;
    };
};

Quiz.prototype.createTable = function() {
    const queryString =`
        CREATE TABLE IF NOT EXISTS Quiz (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topicId INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            enabled BOOLEAN NOT NULL,
            CONSTRAINT PK_Quiz PRIMARY KEY (id),
            CONSTRAINT FK_Quiz_topic FOREIGN KEY (topicId) REFERENCES QuizTopic(id) ON DELETE NO ACTION ON UPDATE CASCADE
        );`;
    return this.db.executeRUNQuery(queryString);
};

Quiz.prototype.newEntry = function(topicId, title, enabled) {
    return this.db.executeRUNQuery(`
        INSERT INTO Quiz ( title, enabled) VALUES (?, ?, ?)
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







var fs = require("fs");
const { resolve } = require('path');
var dbFile = "test.db";
var exists = fs.existsSync(dbFile);
if(!exists) {
    fs.openSync(dbFile, "w");
}

const dbServer = new DatabaseServer(dbFile);
const quiztopic1 = {title : 'html tutorial', descriptionLink : 'Lol, nee', enabled : true};
const quiztopic2 = {title : 'html best practice', descriptionLink : 'Wat zei ik nou. Nee', enabled : false};
const quiz1 = {topicId : 1, title : "Basic HTML #1", enabled : true};
const quiz2 = {topicId : 2, title : "Basic HTML #2", enabled : false};

const quizRepo = new Quiz(dbServer);
const quizTopicRepo = new QuizTopic(dbServer);

let quizId;

quizTopicRepo.createTable()
    .then(() => quizRepo.createTable())
    .then(() => quizTopicRepo.newEntry(quiztopic1.title, quiztopic1.descriptionLink, quiztopic1.enabled))

    .then((data) => {
        quizId = data.id;
        const quizez = [
            {
                topicId : 1,
                title : "Basic HTML #1",
                enabled: true
            },
            {
                topicId : 2,
                title : "Basic HTML #2",
                enabled: false
            },
        ]
        return Promise.all(quizes.map((quiz) => {
            const {topicId, title, enabled} = quiz;
            return quizRepo.newEntry(topicId, title, enabled);
        }))
    })
    .then(() => {
        quizTopicRepo.getEntryById(1);
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




