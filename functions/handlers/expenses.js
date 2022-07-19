const { db, admin } = require('../utils/fbConfig');
const { getBranchLocation } = require('../utils/misc');

// Get All Expenses
const fetchAllExpenses = (req, res) => {
    let query = db.collection('expenses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
        .orderBy('expenseDate', 'desc')
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

// Filter Expenses
const filterExpenses = (req, res) => {
    const expenseCategory = req.body.expenseCategory;
    const expenseSubCategory = req.body.expenseSubCategory;
    const expenseBy = req.body.expenseBy;
    const expenseTag = req.body.expenseTag;

    let query = db.collection('expenses');

    if (expenseCategory) query = query.where('expenseCategory', '==', expenseCategory);
    if (expenseSubCategory) query = query.where('expenseSubCategory', '==', expenseSubCategory);
    if (expenseBy) query = query.where('expenseBy', '==', expenseBy);
    if (expenseTag) query = query.where('expenseTag', '==', expenseTag);

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }

    query
        .orderBy('expenseDate', 'desc')
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

// Get Expenses Numbers
const getExpenseTotalNumbers = (req, res) => {
    let query = db.collection('expenses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }

    query
        .get()
        .then((data) => {
           let totalGeneralExpense = 0;
           let totalInvestment = 0;
           let totalExpFromJiitAcc = 0;
           const totalCategoryExpenseInfo = {};

           data.forEach((doc) => {
                const expData = doc.data();
                totalGeneralExpense += Number(expData.expenseAmount);
                if (expData.expenseTag === 'INVESTOR') {
                    totalInvestment += Number(expData.expenseAmount);
                }
                if (expData.expenseTag === 'JIIT_ACCOUNT') {
                    totalExpFromJiitAcc += Number(expData.expenseAmount);
                }
                if (totalCategoryExpenseInfo[expData.expenseCategory]) {
                    totalCategoryExpenseInfo[expData.expenseCategory] += Number(expData.expenseAmount);
                } else {
                    totalCategoryExpenseInfo[expData.expenseCategory] = Number(expData.expenseAmount);
                }
           });
           return res.json({totalGeneralExpense, totalCategoryExpenseInfo, totalInvestment, totalExpFromJiitAcc});
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Create New Expense
const createNewExpense = (req, res) => {
    const expenseData = req.body;
    expenseData.type = 'REGULAR';
    expenseData.createdDate = new Date().toISOString();
    expenseData.createdBy = req.user.firstName + ' ' + req.user.lastName;
    expenseData.branchLocation = getBranchLocation(req.user.role);

    db.collection('expenses').add(expenseData)
        .then((doc) => {
            return res.json({ message: `Expense added successfully with id: ${doc.id}` });
        })
        .catch((err) => {
            res.status(500).json({ err: err.code });
            console.log('Error: ', err);
        });
};

// Update Expense
const updateExpense = (req, res) => {
    const expenseDetails = req.body;
    expenseDetails.modifiedDate = new Date().toISOString();
    expenseDetails.modifiedBy = req.user.firstName + ' ' + req.user.lastName;
    db.doc(`/expenses/${expenseDetails.id}`).update(expenseDetails)
        .then(() => {
            return res.json({ message: 'Expense updated successfully' });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
};

// Delete Expense
const deleteExpense = (req, res) => {
    const expenseId = req.params.id;
    db.doc(`/expenses/${expenseId}`).delete()
        .then(() => {
            return res.json({ message: 'Expense deleted successfully' });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
};

// Get JIIT Fund Balance
const getJiitFundBalance = async (req, res) => {
    let expenseQuery = db.collection('expenses');
    let recurringExpenseQuery = db.collection('recurringExpenses');
    let studentQuery = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        expenseQuery = expenseQuery.where('branchLocation', '==', 'BDK');
        recurringExpenseQuery = recurringExpenseQuery.where('branchLocation', '==', 'BDK');
        studentQuery = studentQuery.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        expenseQuery = expenseQuery.where('branchLocation', '==', 'KJR');
        recurringExpenseQuery = recurringExpenseQuery.where('branchLocation', '==', 'KJR');
        studentQuery = studentQuery.where('branchLocation', '==', 'KJR');
    }

    expenseQuery = expenseQuery.where('expenseTag', '==', 'JIIT_ACCOUNT');

    try {
        const expenseRes = await expenseQuery.get();
        const recurringExpRes = await recurringExpenseQuery.get();
        const studentRes = await studentQuery.get();

        let totalExpFromJiitAcc = 0;
        let totalRecurringExpense = 0;
        let totalPayment = 0;

        expenseRes.forEach((doc) => {
            totalExpFromJiitAcc += Number(doc.data().expenseAmount);
        });

        recurringExpRes.forEach((doc) => {
            totalRecurringExpense += Number(doc.data().amount);
        });

        studentRes.forEach((doc) => {
            const studentData = doc.data();
            const payments = studentData.payment || [];
            payments.forEach((payment) => {
                totalPayment += Number(payment.amount);
            })
        });

        const jiitAccountFundBalance = totalPayment - (totalExpFromJiitAcc + totalRecurringExpense);

        return res.json({ jiitAccountFundBalance });
        
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

module.exports = {
    createNewExpense,
    updateExpense,
    deleteExpense,
    fetchAllExpenses,
    filterExpenses,
    getExpenseTotalNumbers,
    getJiitFundBalance
}
