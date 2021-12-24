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

module.exports = {
    createNewExpense,
    updateExpense,
    deleteExpense,
    fetchAllExpenses
}
