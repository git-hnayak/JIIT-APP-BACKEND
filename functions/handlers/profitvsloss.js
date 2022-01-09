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


module.exports = {
    fetchMonthlyStudentsAndPayment,
    fetchMonthlyGeneralExpenses,
    fetchMonthlyRecurringExpenses
}
