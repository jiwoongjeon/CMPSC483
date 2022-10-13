let csv = require('csv-parse');
let fs = require('fs');
let mySQL = require('mysql')
let SQL = require('sql-template-strings');


// Edit with your MySQL Password:
const mySQLPassword = 'Best40MSOfMyLife'

const preferencesCSV = 'studentsFinal.csv';
const projectsCSV = 'projectsFinal.csv';
const studentsCSV = 'studentAssignments.csv';

let preferences;
let projects;
let students;

// MySQL connection objects.
const mySQLConnection = mySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: mySQLPassword
});

const databaseName = 'capstone'
const databaseConnection = mySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: mySQLPassword,
    database: databaseName
});


// Main code.
databaseSetup(function() {
    readCSVs(function() {
        addStudent('drs5972', 'Dan', 'Stebbins', 'CMPSC', 1, 1, 0, function() {});
        addProject('XKCD', 'PSU', 'Test Project', 'CMPSC', 'EE', 'ME; CMPEN', 1, 0, '4 AM', 'CMPSC -2^10', 1, function() {});
        addPreference('XKCD', 'drs5972', '8 AM', '10 AM', '4 AM', 2, 'Please no anything but this project I hate it.', function() {});
        addAssignment('XKCD', 'drs5972', function() {})
    });
});


// Database Setup.
function databaseSetup(callback) {
    connectToMySQL(function () {
        createDatabase(function () {
            connectToDatabase(function () {
                createTables(function () {
                    callback();
                });
            });
        });
    });
}

function connectToMySQL(callback) {
    mySQLConnection.connect(function (err) {
        if (err) throw err;
        console.log('Connected to MySQL!');
        callback();
    });
}

function createDatabase(callback) {
    mySQLConnection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, function (err, result) {
        if (err) throw err;
        console.log('Database created!');
        callback();
    });
}

function connectToDatabase(callback) {
    databaseConnection.connect(function (err) {
        if (err) throw err;
        console.log('Connected to the database!');
        callback();
    });
}

// Really does delete all data, be careful.
function dropDatabase(callback) {
    databaseConnection.query(`DROP DATABASE ${databaseName}`, function (err, result) {
        if (err) throw err;
        console.log('Database dropped!');
        callback();
    });
}


// Table Creation.
function createTables(callback) {
    createAssignmentsTable(function () {
        createPreferencesTable(function () {
            createProjectsTable(function () {
                createStudentsTable(function () {
                    callback();
                });
            });
        });
    });
}

function createAssignmentsTable(callback) {
    const query = (SQL `CREATE TABLE IF NOT EXISTS assignments (
                        project_id          VARCHAR(64),
                        student_id          VARCHAR(64))`);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        console.log('Assignments table created!');
        callback();
    });
}

function createPreferencesTable(callback) {
    const query = (SQL `CREATE TABLE IF NOT EXISTS preferences (
                        project_id          VARCHAR(64),
                        student_id          VARCHAR(64),
                        time_a              VARCHAR(64),
                        time_b              VARCHAR(64), 
                        time_c              VARCHAR(64),
                        preference          TINYINT(1),
                        comment            TEXT)`);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        console.log('Preferences table created!');
        callback();
    });
}

function createProjectsTable(callback) {
    const query = (SQL `CREATE TABLE IF NOT EXISTS projects (
                        id                  VARCHAR(64),
                        company             VARCHAR(255),
                        title               VARCHAR(255),
                        primary_major       VARCHAR(16),
                        secondary_major     VARCHAR(16),
                        tertiary_majors     VARCHAR(255),
                        confidentiality     TINYINT(1),
                        ip                  TINYINT(1),
                        course_time         VARCHAR(64),
                        course_name         VARCHAR(64),
                        prototype           TINYINT(1))`);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        console.log('Projects table created!');
        callback();
    });
}

function createStudentsTable(callback) {
    const query = (SQL `CREATE TABLE IF NOT EXISTS students (
                        id                  VARCHAR(64),
                        first_name           VARCHAR(255),
                        last_name           VARCHAR(255),
                        major               VARCHAR(16),
                        nda                 TINYINT(1),
                        ip                  TINYINT(1),
                        on_campus           TINYINT(1))`);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        console.log('Students table created!');
        callback();
    });
}


// CSV Reading.
function readCSVs(callback) {
    readCSV(preferencesCSV, csv.parse({ delimiter: ',' }, function (err, data) { preferences = data.slice(1, data.length) }), function () {
        readCSV(projectsCSV, csv.parse({ delimiter: ',' }, function (err, data) { projects = data.slice(1, data.length) }), function () {
            readCSV(studentsCSV, csv.parse({ delimiter: ',' }, function (err, data) { students = data.slice(1, data.length) }), function () {
                callback();
            });
        });
    });
}

function readCSV(file, parser, callback) {
    fs.createReadStream(file).pipe(parser).on('error', function (err) { console.log(err) }).on('close', callback);
}



// ==================================== QUERIES ====================================

// Adding rows to tables.
function addAssignment(studentID, projectID, callback) {
    const query = (SQL `INSERT INTO assignments
                        (student_id, project_id)
                        VALUES (${studentID}, ${projectID})`);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        console.log('Assignment added!');
        callback();
    });
}

function addPreference(projectID, studentID, timeA, timeB, timeC, preference, comment, callback) {
    const query = (SQL `INSERT INTO preferences
                        (project_id, student_id, time_a, time_b, time_c, preference, comment)
                        VALUES (${projectID}, ${studentID}, ${timeA}, ${timeB}, ${timeC}, ${preference}, ${comment})`);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        console.log('Preference added!');
        callback();
    });
}

function addProject(id, company, title, primary, secondary, tertiary, confidentiality, ip, courseTime, courseName, prototype, callback) {
    const query = (SQL `INSERT INTO projects
                        (id, company, title, primary_major, secondary_major, tertiary_majors, confidentiality, ip, course_time, course_name, prototype)
                        VALUES (${id}, ${company}, ${title}, ${primary}, ${secondary}, ${tertiary}, ${confidentiality}, ${ip}, ${courseTime}, ${courseName}, ${prototype})`);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        console.log('Project added!');
        callback();
    });
}

function addStudent(id, first, last, major, nda, ip, onCampus, callback) {
    const query = (SQL `INSERT INTO students
                        (id, first_name, last_name, major, nda, ip, on_campus)
                        VALUES (${id}, ${first}, ${last}, ${major}, ${nda}, ${ip}, ${onCampus})`);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        console.log('Student added!');
        callback();
    });
}

// Given a number, return all the teams that have less than that number of students.
function getTeamsAbove(n, callback) {
    // Put the query in the ``.
    const query = (SQL ``);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        // Do something with the result.
        callback();
    });
}

// Given a number, return all the teams that have less than that number of students.
function getTeamsBelow(n, callback) {
    // Put the query in the ``.
    const query = (SQL ``);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        // Do something with the result.
        callback();
    });
}

// Given a project and a major, return how many students of that major are on that project.
function getMajorCount(projectID, major, callback) {
    // Put the query in the ``.
    const query = (SQL ``);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        // Do something with the result.
        callback();
    });
}

// Given a project, return whether or not it has the right amount of primary, secondary, and tertiary majors.
function holdsMajorInequality(projectID, callback) {
    // Put the query in the ``. Remember to use getMajorInequality().
    const query = (SQL ``);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        // Do something with the result.
        callback();
    });
}

// Given a student, return a list of other projects they could be moved to according to their preferences and major.
function getAlternateProjects(studentID, callback) {
    // Put the query in the ``.
    const query = (SQL ``);
    databaseConnection.query(query, function (err, result) {
        if (err) throw err;
        // Do something with the result.
        callback();
    });
}