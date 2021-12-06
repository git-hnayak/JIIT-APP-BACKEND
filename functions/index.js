const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { FBAuth } = require('./utils/fbAuthMiddleware');
const {
    userSignin,
    userSignup,
    getAllUsers,
    getAuthenticatedUser,
    fetchCounters,
    updateUserDetails
} = require('./handlers/users');
const {
    fetchAllStudents,
    fetchRecentStudents,
    createNewStudent,
    updateStudent,
    fetchStudentById,
    fetchAllStudentsByBranchAndCertType,
    fetchStudentsByQuery
} = require('./handlers/students');
const {
    sarvaRegistrationProgress,
    sarvaRegistrationComplete
} = require('./handlers/sarva');
const {
    fetchAllCourses,
    fetchCoursesByBranch,
    createNewCourse,
    updateCourse
} = require('./handlers/courses');
const {
    createNewExpense,
    fetchAllExpenses,
    updateExpense
} = require('./handlers/expenses');
const app = express();

app.use(cors());

app.get('/hello', (req, res) => {
    res.send('Welcome to JIIT');
});

// User Routes
app.post('/signup', userSignup);
app.post('/signin', userSignin);
app.post('/user', FBAuth, updateUserDetails);
app.get('/allusers', FBAuth, getAllUsers);
app.get('/loggeduser', FBAuth, getAuthenticatedUser);

// Student Routes
app.get('/allStudents', FBAuth, fetchAllStudents);
app.get('/recentStudents', FBAuth, fetchRecentStudents);
app.post('/student', FBAuth, createNewStudent);
app.post('/student/update', FBAuth, updateStudent);
app.get('/student/:id', FBAuth, fetchStudentById);
app.post('/student/bybranchandcertType', FBAuth, fetchAllStudentsByBranchAndCertType);
app.post('/student/byquery', FBAuth, fetchStudentsByQuery);

// Student Sarva Regd Progress
app.post('/sarvaregdprogress', FBAuth, sarvaRegistrationProgress);
app.post('/sarvaregdcomplete', FBAuth, sarvaRegistrationComplete);
app.get('/counters', FBAuth, fetchCounters);

// Course Routes
app.post('/course', FBAuth, createNewCourse);
app.post('/course/update', FBAuth, updateCourse);
app.get('/allcourses', FBAuth, fetchAllCourses);
app.get('/courses/:branch', FBAuth, fetchCoursesByBranch);

// Expenses Routes
app.post('/expense', FBAuth, createNewExpense);
app.post('/expense/update', FBAuth, updateExpense);
app.get('/expense/allexpenses', FBAuth, fetchAllExpenses);

// exports.api = functions.region('asia-south1').https.onRequest(app);
exports.api = functions.https.onRequest(app);


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
