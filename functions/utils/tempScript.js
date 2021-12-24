const { db, admin } = require('./fbConfig');

// Recurring Expense Options
const setRentExpenseOptions = () => {
    const rentExpenseData = {
        category: 'RENT',
        amount: '2000',
        frequent: 'MONTHLY',
        processDay: '10',
        payerId: '',
        payerName: '',
        receiver: '',
        createdDate: new Date().toISOString(),
        createdBy: 'JIIT System',
        branchLocation: 'BDK'
    }

    db.collection('recurringExpensesOptions').add(rentExpenseData)
        .then((doc) => {
            console.log(`Rent Expense option added successfully with id: ${doc.id}`);
        })
        .catch((err) => {
            console.log('Error: ', err);
        });
}

const setElectricityExpenseOptions = () => {
    const rentExpenseData = {
        category: 'ELECTRICITY',
        amount: '300',
        frequent: 'MONTHLY',
        processDay: '20',
        payerId: '',
        payerName: '',
        receiver: '',
        createdDate: new Date().toISOString(),
        createdBy: 'JIIT System',
        branchLocation: 'BDK'
    }

    db.collection('recurringExpensesOptions').add(rentExpenseData)
        .then((doc) => {
            console.log(`Electricity Expense option added successfully with id: ${doc.id}`);
        })
        .catch((err) => {
            console.log('Error: ', err);
        });
}

// setElectricityExpenseOptions()

module.exports = {
    setElectricityExpenseOptions,
    setRentExpenseOptions
}
