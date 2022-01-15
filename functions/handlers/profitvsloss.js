const { db, admin } = require('../utils/fbConfig');

// Get Monthly Students
const fetchMonthlyStudentsAndPayment = (req, res) => {
    const month = req.body.month;
    const year = req.body.year;

    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
        .get()
        .then((data) => {
           let students = [];
           let totalMonthlyGain = 0;
           data.forEach((doc) => {
               const studentData = doc.data();
               let monthPayment = [];
               studentData.payment && studentData.payment.length > 0 && studentData.payment.forEach((payData) => {
                    const payMonth = new Date(payData.date).getMonth();
                    const payYear = new Date(payData.date).getFullYear();
                    if (payMonth === month && payYear === year) {
                        totalMonthlyGain += Number(payData.amount);
                        monthPayment.push(payData);
                    }
               });
               if (monthPayment.length > 0) {
                students.push({
                    id: doc.id,
                    monthPayment,
                    ...doc.data()
                });
               }
           });
           return res.json({ students, totalMonthlyGain });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get Monthly Gain For Year
const fetchMonthlyGainForYear = (req, res) => {
    const year = req.body.year;

    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
        .get()
        .then((data) => {
           let totalYearGain = 0;
           const monthlyGain = {
               0: 0,
               1: 0,
               2: 0,
               3: 0,
               4: 0,
               5: 0,
               6: 0,
               7: 0,
               8: 0,
               9: 0,
               10: 0,
               11: 0
           };
           data.forEach((doc) => {
               const studentData = doc.data();
               studentData.payment && studentData.payment.length > 0 && studentData.payment.forEach((payData) => {
                    const payMonth = new Date(payData.date).getMonth();
                    const payYear = new Date(payData.date).getFullYear();
                    if (payYear === year) {
                        totalYearGain += Number(payData.amount);
                        monthlyGain[payMonth] += Number(payData.amount);
                    }
               });
           });
           return res.json({monthlyGain, totalYearGain});
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get Quarter Gain For Year
const fetchQuarterGainForYear = (req, res) => {
    const quarter = req.body.quarter;
    const year = req.body.year;

    let quarterArray = [];

    if (quarter === 'q1') {
        quarterArray = [0, 1, 2];
    } else if (quarter === 'q2') {
        quarterArray = [3, 4, 5];
    } else if (quarter === 'q3') {
        quarterArray = [6, 7, 8];
    } else if (quarter === 'q4') {
        quarterArray = [9, 10, 11];
    }

    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
        .get()
        .then((data) => {
           let quarterGain = 0;
           data.forEach((doc) => {
               const studentData = doc.data();
               studentData.payment && studentData.payment.length > 0 && studentData.payment.forEach((payData) => {
                    const payMonth = new Date(payData.date).getMonth();
                    const payYear = new Date(payData.date).getFullYear();
                    if (payYear === year) {
                        if (quarterArray.indexOf(payMonth) > -1) {
                            quarterGain +=  Number(payData.amount);
                        }
                    }
               });
           });
           return res.json(quarterGain);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get Monthly Expenses
const fetchMonthlyGeneralExpenses = (req, res) => {
    const month = req.body.month;
    const year = req.body.year;

    let query = db.collection('expenses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
        .get()
        .then((data) => {
           let generalExpenses = [];
           let totalGeneralExpenses = 0;
           data.forEach((doc) => {
                const expenseData = doc.data();
                const payMonth = new Date(expenseData.expenseDate).getMonth();
                const payYear = new Date(expenseData.expenseDate).getFullYear();
                if (payMonth === month && payYear === year) {
                    totalGeneralExpenses += Number(expenseData.expenseAmount);
                    generalExpenses.push({
                        id: doc.id,
                        ...doc.data()
                    });
                }
           });
           return res.json({ generalExpenses, totalGeneralExpenses });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get Monthly Recurring Expenses
const fetchMonthlyRecurringExpenses = (req, res) => {
    const month = req.body.month;
    const year = req.body.year;

    let query = db.collection('recurringExpenses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
        .get()
        .then((data) => {
           let recurringExpenses = [];
           let totalRecurringExpenses = 0;
           data.forEach((doc) => {
                const expenseData = doc.data();
                const payMonth = expenseData.month - 1;
                const payYear = expenseData.year;
                if (payMonth === month && payYear === year) {
                    totalRecurringExpenses += Number(expenseData.amount);
                    recurringExpenses.push({
                        id: doc.id,
                        ...doc.data()
                    });
                }
           });
           return res.json({ recurringExpenses, totalRecurringExpenses });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get Quarter Recurring Expenses For Year
const fetchQuarterRecurringExpenses = (req, res) => {
    const quarter = req.body.quarter;
    const year = req.body.year;

    let quarterArray = [];

    if (quarter === 'q1') {
        quarterArray = [0, 1, 2];
    } else if (quarter === 'q2') {
        quarterArray = [3, 4, 5];
    } else if (quarter === 'q3') {
        quarterArray = [6, 7, 8];
    } else if (quarter === 'q4') {
        quarterArray = [9, 10, 11];
    }

    let query = db.collection('recurringExpenses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
        .get()
        .then((data) => {
            let quarterRecurringExpense = 0;
            data.forEach((doc) => {
                const expenseData = doc.data();
                const payMonth = expenseData.month - 1;
                const payYear = expenseData.year;
                if (payYear === year) {
                    if (quarterArray.indexOf(payMonth) > -1) {
                        quarterRecurringExpense += Number(expenseData.amount);
                    }
                }
            });
           return res.json(quarterRecurringExpense);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get Monthly Expense For Year
const fetchMonthlyExpenseForYear = (req, res) => {
    const year = req.body.year;

    let generalExpQuery = db.collection('expenses');
    let recurringExpQuery = db.collection('recurringExpenses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        generalExpQuery = generalExpQuery.where('branchLocation', '==', 'BDK');
        recurringExpQuery = recurringExpQuery.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        generalExpQuery = generalExpQuery.where('branchLocation', '==', 'KJR');
        recurringExpQuery = recurringExpQuery.where('branchLocation', '==', 'KJR');
    }

    const monthlyExpenses = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0
    };

    let totalYearExpenses = 0;

    generalExpQuery
        .get()
        .then((genExpData) => {
            genExpData.forEach((doc) => {
                const generalExpData = doc.data();
                const payMonth = new Date(generalExpData.expenseDate).getMonth();
                const payYear = new Date(generalExpData.expenseDate).getFullYear();
                if (payYear === year) {
                    totalYearExpenses += Number(generalExpData.expenseAmount);
                    monthlyExpenses[payMonth] += Number(generalExpData.expenseAmount);
                }
           });
           return recurringExpQuery.get();
        })
        .then((recExpData) => {
            recExpData.forEach((doc) => {
                const recurringExpData = doc.data();
                const payMonth = recurringExpData.month - 1;
                const payYear = recurringExpData.year;
                if (payYear === year) {
                    totalYearExpenses += Number(recurringExpData.amount);
                    monthlyExpenses[payMonth] += Number(recurringExpData.amount);
                }
           });
           return res.json({monthlyExpenses, totalYearExpenses});
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};


module.exports = {
    fetchMonthlyStudentsAndPayment,
    fetchMonthlyGeneralExpenses,
    fetchMonthlyRecurringExpenses,
    fetchMonthlyGainForYear,
    fetchMonthlyExpenseForYear,
    fetchQuarterGainForYear,
    fetchQuarterRecurringExpenses
}
