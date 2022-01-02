const { db, admin } = require('../utils/fbConfig');
const { getBranchLocation } = require('../utils/misc');

// Create Salary Expense options
const createSalaryExpenseOptions = (req, res) => {
    const salaryExpenseOption = req.body;
    salaryExpenseOption.category = 'SALARY';
    salaryExpenseOption.createdDate = new Date().toISOString();
    salaryExpenseOption.createdBy = req.user.firstName + ' ' + req.user.lastName;
    salaryExpenseOption.branchLocation = getBranchLocation(req.user.role);

    db.collection('recurringExpensesOptions').add(expenseData)
        .then((doc) => {
            return res.json({ message: `Recurring Expense Option added successfully with id: ${doc.id}` });
        })
        .catch((err) => {
            res.status(500).json({ err: err.code });
            console.log('Error: ', err);
        });
}

// Update Salary Expense options
const updateRecuringExpenseOptions = (req, res) => {
    const recurringExpenseOption = req.body;
    recurringExpenseOption.modifiedDate = new Date().toISOString();
    recurringExpenseOption.modifiedBy = req.user.firstName + ' ' + req.user.lastName;

    db.doc(`/recurringExpensesOptions/${recurringExpenseOption.id}`).update(recurringExpenseOption)
        .then(() => {
            return res.json({ message: 'Expense option updated successfully' });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
}

// Get Recurring Expense options
const getRecuringExpenseOptions = (req, res) => {
    let query = db.collection('recurringExpensesOptions');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }

    query
        .get()
        .then((data) => {
           let recurringExpenseOptions = [];
           data.forEach((doc) => {
            recurringExpenseOptions.push({
                   id: doc.id,
                   ...doc.data()
               });
           });
           return res.json(recurringExpenseOptions);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
}

// Get Recurring Expenses
const fetchRecurringExpenses = (req, res) => {
    let query = db.collection('recurringExpenses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }

    if (req.body.category) query = query.where('category', '==', req.body.category);
    if (req.body.expenseBy) query = query.where('expenseBy', '==', req.body.expenseBy);

    query
        .get()
        .then((data) => {
           let expenses = [];
           let totalExpense = 0;
           data.forEach((doc) => {
            totalExpense += Number(doc.data().expenseAmount);
            expenses.push({
                   id: doc.id,
                   ...doc.data()
               });
           });
           return res.json({expenses, totalExpense});
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Create New Recurring Expense
const createNewRecurringExpense = (req, res) => {
    const expenseData = req.body;
    expenseData.type = 'RECURRING';
    expenseData.createdDate = new Date().toISOString();
    expenseData.createdBy = req.user.firstName + ' ' + req.user.lastName;
    expenseData.branchLocation = getBranchLocation(req.user.role);

    db.collection('recurringExpenses').add(expenseData)
        .then((doc) => {
            return res.json({ message: `Expense added successfully with id: ${doc.id}` });
        })
        .catch((err) => {
            res.status(500).json({ err: err.code });
            console.log('Error: ', err);
        });
};

// Update Expense
const updateRecurringExpense = (req, res) => {
    const expenseDetails = req.body;
    expenseDetails.modifiedDate = new Date().toISOString();
    expenseDetails.modifiedBy = req.user.firstName + ' ' + req.user.lastName;
    db.doc(`/recurringExpenses/${expenseDetails.id}`).update(expenseDetails)
        .then(() => {
            return res.json({ message: 'Expense updated successfully' });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
};

// Delete Expense
const deleteRecurringExpense = (req, res) => {
    const expenseId = req.params.id;
    db.doc(`/recurringExpenses/${expenseId}`).delete()
        .then(() => {
            return res.json({ message: 'Expense deleted successfully' });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
};

module.exports = {
    createNewRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    fetchRecurringExpenses,
    createSalaryExpenseOptions,
    updateRecuringExpenseOptions,
    getRecuringExpenseOptions
}
