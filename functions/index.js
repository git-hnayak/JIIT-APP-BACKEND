const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { FBAuth } = require('./utils/fbAuthMiddleware');
const { addRentExpenseJob, addElectricityExpenseJob, addSalaryExpenseJob } = require('./utils/schedulers');
const {
    userSignin,
    userSignup,
    getAllUsers,
    getAuthenticatedUser,
    fetchCounters,
    updateUserDetails,
    sendPasswordResetEmail,
    phoneSignup
} = require('./handlers/users');
const {
    fetchAllStudents,
    fetchRecentStudents,
    createNewStudent,
    updateStudent,
    fetchStudentById,
    fetchAllStudentsByBranchAndCertType,
    fetchStudentsByQuery,
    fetchStudentInfoInTotal,
    createAppliedStudent,
    fetchAppliedStudents,
    rejectAppliedStudents
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
    updateExpense,
    deleteExpense,
    filterExpenses,
    getExpenseTotalNumbers,
    getJiitFundBalance
} = require('./handlers/expenses');
const {
    createSalaryExpenseOptions,
    updateRecuringExpenseOptions,
    createNewRecurringExpense,
    updateRecurringExpense,
    fetchRecurringExpenses,
    getRecuringExpenseOptions,
    getRecurringExpenseTotalNumbers
} = require('./handlers/recurringExpenses');
const {
    fetchMyPortfolio
} = require('./handlers/portfolio');

const {
    fetchMonthlyStudentsAndPayment,
    fetchMonthlyRecurringExpenses,
    fetchMonthlyGeneralExpenses,
    fetchMonthlyGainForYear,
    fetchMonthlyExpenseForYear,
    fetchQuarterGainForYear,
    fetchQuarterRecurringExpenses,
    fetchQuarterlyGeneralExpenses,
    createQuarterlyProfitLossForInvestors,
    getProfitEntries,
    createProfitEntry,
    updateProfitEntry,
    deleteProfitEntry,
    fetchQuarterlyProfitLossForInvestors
} = require('./handlers/profitvsloss');

const {
    fetchStudentDetailsReport,
    fetchStudentPaymentDetailsReport
} = require('./handlers/reports');

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
app.post('/sendpwdresetemail', sendPasswordResetEmail);
app.post('/phonesignup', phoneSignup);

// Student Routes
app.get('/allStudents', FBAuth, fetchAllStudents);
app.get('/recentStudents', FBAuth, fetchRecentStudents);
app.post('/student', FBAuth, createNewStudent);
app.post('/student/update', FBAuth, updateStudent);
app.get('/student/:id', FBAuth, fetchStudentById);
app.post('/student/bybranchandcertType', FBAuth, fetchAllStudentsByBranchAndCertType);
app.post('/student/byquery', FBAuth, fetchStudentsByQuery);
app.get('/studentinfointotal', FBAuth, fetchStudentInfoInTotal);
app.post('/student/apply', createAppliedStudent);
app.get('/appliedstudents', FBAuth, fetchAppliedStudents);
app.get('/rejectappliedstudents/:id', FBAuth, rejectAppliedStudents);

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
app.delete('/expense/:id', FBAuth, deleteExpense);
app.post('/expense/filterexpenses', FBAuth, filterExpenses);
app.get('/getexpensetotalnumbers', FBAuth, getExpenseTotalNumbers);
app.get('/getjiitaccountfundbalance', FBAuth, getJiitFundBalance);

// Recurring Expense Routes
app.post('/salaryexpenseoption', FBAuth, createSalaryExpenseOptions);
app.post('/updaterecurringexpenseoptions', FBAuth, updateRecuringExpenseOptions);
app.post('/createrecurringexpense', FBAuth, createNewRecurringExpense);
app.post('/updaterecurringexpense', FBAuth, updateRecurringExpense);
app.post('/fetchrecurringexpense', FBAuth, fetchRecurringExpenses);
app.get('/getrecurringexpensetotalnumbers', FBAuth, getRecurringExpenseTotalNumbers);
app.get('/getrecurringexpenseoptions', FBAuth, getRecuringExpenseOptions);

// Profit vs Losses
app.post('/getmonthlystudentandpayment', FBAuth, fetchMonthlyStudentsAndPayment);
app.post('/getmonthlygeneralexpenses', FBAuth, fetchMonthlyGeneralExpenses);
app.post('/getmonthlyrecurringexpenses', FBAuth, fetchMonthlyRecurringExpenses);
app.post('/getmonthlygainforyear', FBAuth, fetchMonthlyGainForYear);
app.post('/getmonthlyexpenseforyear', FBAuth, fetchMonthlyExpenseForYear);
app.post('/fetchquartergainforyear', FBAuth, fetchQuarterGainForYear);
app.post('/fetchquarterrecurringexpenses', FBAuth, fetchQuarterRecurringExpenses)
app.post('/fetchquarterlygeneralexpenses', FBAuth, fetchQuarterlyGeneralExpenses);
app.post('/auditquarterlyprofitloss', FBAuth, createQuarterlyProfitLossForInvestors);
app.post('/fetchquarterlyprofitlossforinvestors', FBAuth, fetchQuarterlyProfitLossForInvestors)
app.post('/getplentries', FBAuth, getProfitEntries);
app.post('/addprofitentry', FBAuth, createProfitEntry);
app.post('/updateprofitentry', FBAuth, updateProfitEntry);
app.delete('/profitentry/:id', FBAuth, deleteProfitEntry);

// Portfolio Routes
app.post('/myportfolio', FBAuth, fetchMyPortfolio);

//Report Routes
app.post('/report/studentdetails', FBAuth, fetchStudentDetailsReport);
app.post('/report/studentpaymentdetails', FBAuth, fetchStudentPaymentDetailsReport);

// exports.api = functions.region('asia-south1').https.onRequest(app);
exports.api = functions.https.onRequest(app);
exports.scheduledFunction = functions.pubsub.schedule('30 7 10 * *').onRun((context) => {
    addRentExpenseJob();
    addElectricityExpenseJob();
    addSalaryExpenseJob();
    return null;
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
