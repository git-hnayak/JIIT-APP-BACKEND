const cron = require('node-cron');
const { db, admin } = require('./fbConfig');

// cron.schedule('* * * * *', () =>  {
//     console.log('Task 1 will execute every min until stopped');
// });

// const task2 = cron.schedule('* * * * *', () =>  {
//     console.log('Run Task2 every 10s');
// });

// const addRentExpenseJobCron = '30 10 30 * *'; // On 10th of every month
// const addElectricityExpenseJobCron = '30 10 30 * *'; // On 20th of every month
// const addSalaryExpenseJobCron = '30 10 30 * *'; // On 5th of every month

const month = new Date().getMonth()+1;
const year = new Date().getFullYear();

const addRentExpenseJob = async () =>  {
    const rentExpenseData = {
        type: 'RECURRING',
        category: 'RENT',
        month,
        year,
        createdDate: new Date().toISOString(),
        createdBy: 'JIIT SCHEDULER'
    }

    let query = db.collection('recurringExpensesOptions');
    query = query.where('category', '==', 'RENT');
    query = query.where('status', '==', 'ACTIVE');

    try {
        const rentExpOpt = await query.get();
        if (rentExpOpt.docs && rentExpOpt.docs.length > 0) {
            const rentExpOptData = rentExpOpt.docs[0].data();
            rentExpenseData.branchLocation = rentExpOptData.branchLocation;
            rentExpenseData.amount = rentExpOptData.amount;
            rentExpenseData.expenseBy = rentExpOptData.payerId;
            rentExpenseData.expenseByName = rentExpOptData.payerName;
            rentExpenseData.receiver = rentExpOptData.receiver;

            const recurringExpSuccessData = await db.collection('recurringExpenses').add(rentExpenseData);
            console.log(`Rent Recurring Expense added successfully with id: ${recurringExpSuccessData.id}`);
        } else {
            console.log('No Rent Recurring Expense option found to entry');
        }
        
    } catch (error) {
        console.log('addRentExpenseJob Error: ', error)
    }
};

const addElectricityExpenseJob = async () =>  {
    const eleExpenseData = {
        type: 'RECURRING',
        category: 'ELECTRICITY',
        month,
        year,
        createdDate: new Date().toISOString(),
        createdBy: 'JIIT SCHEDULER'
    }

    let query = db.collection('recurringExpensesOptions');
    query = query.where('category', '==', 'ELECTRICITY');
    query = query.where('status', '==', 'ACTIVE');

    try {
        const eleExpOpt = await query.get();
        if (eleExpOpt.docs && eleExpOpt.docs.length > 0) {
            const eleExpOptData = eleExpOpt.docs[0].data();
            eleExpenseData.branchLocation = eleExpOptData.branchLocation;
            eleExpenseData.amount = eleExpOptData.amount;
            eleExpenseData.expenseBy = eleExpOptData.payerId;
            eleExpenseData.expenseByName = eleExpOptData.payerName;
            eleExpenseData.receiver = eleExpOptData.receiver;

            let queryRecExp = db.collection('recurringExpenses');
            queryRecExp = queryRecExp.where('category', '==', 'ELECTRICITY');

            const allEleExpensesRes = await queryRecExp.get();
            const allEleExpensesData = allEleExpensesRes.docs.map((expEle) => expEle.data());
            const eleExpFilterData = allEleExpensesData.filter(expEleFilterData => (expEleFilterData.month === new Date().getMonth()+1) &&  (expEleFilterData.year === new Date().getFullYear()));

            if (eleExpFilterData.length === 0) {
                const recurringExpSuccessData = await db.collection('recurringExpenses').add(eleExpenseData);
                console.log(`Electricity Recurring Expense added successfully with id: ${recurringExpSuccessData.id}`);
            }
        } else {
            console.log('No Electricity Recurring Expense option found to entry');
        }
        
    } catch (error) {
        console.log('addElectricityExpenseJob Error: ', error);
    }
};

const addSalaryExpenseJob = async () =>  {

    let query = db.collection('recurringExpensesOptions');
    query = query.where('category', '==', 'SALARY');
    query = query.where('status', '==', 'ACTIVE');

    try {
        const salaryExpOpt = await query.get();
        salaryExpOpt.forEach(async (doc) => {
            const salaryExpOptData = doc.data();
            const salaryExpenseData = {
                type: 'RECURRING',
                category: 'SALARY',
                branchLocation: salaryExpOptData.branchLocation,
                month,
                year,
                amount: salaryExpOptData.amount,
                expenseBy: salaryExpOptData.payerId,
                expenseByName: salaryExpOptData.payerName,
                receiver: salaryExpOptData.receiver,
                createdDate: new Date().toISOString(),
                createdBy: 'JIIT SCHEDULER'
            }
            const recurringExpSuccessData = await db.collection('recurringExpenses').add(salaryExpenseData);
            console.log(`Salary Recurring Expense added successfully with id: ${recurringExpSuccessData.id}`);
        });
    } catch (error) {
        console.log('addSalaryExpenseJob Error: ', error)
    }
};

module.exports = {
    addRentExpenseJob,
    addElectricityExpenseJob,
    addSalaryExpenseJob
}
