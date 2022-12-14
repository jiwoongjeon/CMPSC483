const {
  addAssignment,
  addPreference,
  addProject,
  addStudent,
  mySQLConnection,
  databaseConnection,
  connectToMySQL,
  connectToDatabase,
  databaseName,
  getAssignmentsQuery,
  getStudentDataForWriteQuery,
  getCommentQuery,
} = require("./db.js");
Error.stackTraceLimit = Infinity;

const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parse");
const fs = require("fs");
const SQL = require("sql-template-strings");
const { exit } = require("process");

const preferencesCSV = "studentsFinal.csv";
const projectsCSV = "projectsFinal.csv";
const studentsCSV = "studentAssignments.csv";
const studentsNoSurveyCSV = "Students Without Prefs.csv";

const majors = [
  "BME",
  "CMPEN",
  "CMPSC",
  "DS",
  "ED",
  "EE",
  "EGEE",
  "ESC",
  "IE",
  "MATSE",
  "ME",
];

async function loadAssignmentsTable(callback) {
  console.log("loadAssigmentsTable()");
  let assignedStudents = []
  for (const student of students) {
    //  studentid,projectid,
    assignedStudents.push(student[8])
    await addAssignment(student[8], student[1], function () {});
  }
  for (const student of studentsNoSurvey) {
    if(!assignedStudents.includes(student[2].substring(0, student[2].indexOf("@"))))
    {
      await addAssignment(
        student[2].substring(0, student[2].indexOf("@")),
        null,
        function () {}
      );
    }
  }
  callback();
}

async function loadPreferencesTable(callback) {
  console.log("loadPreferencesTable()");
  for (const preference of preferences) {
    // projectID, studentID, timeA, timeB, timeC, preference, comment.
    await addPreference(
      preference[1],
      preference[9],
      preference[2],
      preference[3],
      preference[4],
      preference[5],
      preference[6],
      function () {}
    );
  }
  for (const student of studentsNoSurvey) {
    await addPreference(null, student[2].substring(0, student[2].indexOf("@")), student[4], null, null, null, null, function () { });
  }
  console.log("Preference Table Loaded!");
  callback();
}

async function loadProjectsTable(callback) {
  console.log("loadProjectsTable()");
  for (const project of projects) {
    // Getting primary, secondary, and tertiary majors from 1-2-3 format
    let primary = "";
    let secondary = "";
    let tertiary = "";
    for (let j = 0; j < majors.length; j++) {
      if (project[j + 3] == 1) primary = majors[j];
      else if (project[j + 3] == 2) secondary = majors[j];
      else if (project[j + 3] == 3) tertiary += majors[j] + ";";
    }

    // id, company, title, primary, secondary, tertiary, confidentiality, ip, courseTime, courseName, prototype.
    await addProject(
      project[0],
      project[1],
      project[2],
      primary,
      secondary,
      tertiary,
      project[14],
      project[15],
      project[16],
      project[17],
      project[18],
      function () {}
    );
  }
  console.log("Projects Table Loaded!");
  callback();
}

async function loadStudentsTable(callback) {
  console.log("loadStudentsTable()");
  for (const student of students) {
    // id, first, last, major, nda, ip, onCampus.
    await addStudent(
      student[8],
      student[10],
      student[9],
      student[0],
      student[6],
      student[7],
      student[11] == "Yes" ? 1 : 0,
      function () {}
    );
  }
  for (const student of studentsNoSurvey) {
    // Assume NULL for major and 0 for NDA, IP, and onCampus until further notice.
    await addStudent(
      student[2].substring(0, student[2].indexOf("@")),
      student[0],
      student[1],
      student[3].substring(0, student[3].indexOf(4) - 1),
      0,
      0,
      0,
      function () {}
    );
  }
  callback();
}

function loadTables(callback) {
  loadAssignmentsTable(function () {
    loadPreferencesTable(function () {
      loadProjectsTable(function () {
        loadStudentsTable(function () {
          callback();
        });
      });
    });
  });
}

function createAssignmentsTable(callback) {
  console.log("createAssignmentsTable()");
  const query = SQL`CREATE TABLE IF NOT EXISTS assignments (
                        project_id          VARCHAR(64),
                        student_id          VARCHAR(64))`;
  databaseConnection.query(query, function (err, result) {
    if (err) throw err;
    console.log("Assignments table created!");
    callback();
  });
}

function createPreferencesTable(callback) {
  console.log("createPreferencesTable()");
  const query = SQL`CREATE TABLE IF NOT EXISTS preferences (
                        project_id          VARCHAR(64),
                        student_id          VARCHAR(64),
                        time_a              VARCHAR(64),
                        time_b              VARCHAR(64), 
                        time_c              VARCHAR(64),
                        preference          TINYINT(1),
                        comment            TEXT)`;
  databaseConnection.query(query, function (err, result) {
    if (err) throw err;
    console.log("Preferences table created!");
    callback();
  });
}

function createProjectsTable(callback) {
  console.log("createProjectsTable()");
  const query = SQL`CREATE TABLE IF NOT EXISTS projects (
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
                        prototype           TINYINT(1))`;
  databaseConnection.query(query, function (err, result) {
    if (err) throw err;
    console.log("Projects table created!");
    callback();
  });
}

function createStudentsTable(callback) {
  console.log("createStudentsTable()");
  const query = SQL`CREATE TABLE IF NOT EXISTS students (
                        id                  VARCHAR(64),
                        first_name           VARCHAR(255),
                        last_name           VARCHAR(255),
                        major               VARCHAR(16),
                        nda                 TINYINT(1),
                        ip                  TINYINT(1),
                        on_campus           TINYINT(1))`;
  databaseConnection.query(query, function (err, result) {
    if (err) throw err;
    console.log("Students table created!");
    callback();
  });
}

function databaseSetup(callback) {
  console.log("databaseSetup()");
  connectToMySQL(() => {
    createDatabase(() => {
      connectToDatabase(() => {
        createTables(() => {
          callback();
        });
      });
    });
  });
}

function readCSVFile(file, parser, callback) {
  console.log("readCSVFile()");
  fs.createReadStream(file)
    .pipe(parser)
    .on("error", function (err) {
      console.log(err);
    })
    .on("close", callback);
}

function readCSVs(callback) {
  console.log("readCSVs()");
  readCSVFile(
    preferencesCSV,
    csv.parse({ delimiter: "," }, function (err, data) {
      preferences = data.slice(1, data.length);
    }),
    function () {
      readCSVFile(
        projectsCSV,
        csv.parse({ delimiter: "," }, function (err, data) {
          projects = data.slice(1, data.length);
        }),
        function () {
          readCSVFile(
            studentsCSV,
            csv.parse({ delimiter: "," }, function (err, data) {
              students = data.slice(1, data.length);
            }),
            function () {
              readCSVFile(
                studentsNoSurveyCSV,
                csv.parse({ delimiter: "," }, function (err, data) {
                  studentsNoSurvey = data.slice(1, data.length);
                }),
                function () {
                  callback();
                }
              );
            }
          );
        }
      );
    }
  );
}

function createTables(callback) {
  console.log("createTables()");
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

function createDatabase(callback) {
  console.log("createDatabase()");
  mySQLConnection.query(
    `CREATE DATABASE IF NOT EXISTS ${databaseName}`,
    function (err, result) {
      //if (err) throw err;
      console.log("Database created!");
      callback();
    }
  );
}

// Main code.
databaseSetup(() => {
  readCSVs(() => {
    loadTables(() => {
      console.log("Done!");
      exit(0);
    });
  });
});
