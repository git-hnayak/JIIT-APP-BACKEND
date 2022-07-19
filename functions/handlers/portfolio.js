const { admin, db, firebase } = require('../utils/fbConfig');

// Get All Expenses
const fetchMyPortfolio = async (req, res) => {
    const expenseBy = req.body.expenseBy ? req.body.expenseBy : req.user._id;

    let query = db.collection('expenses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query = query.where('expenseBy', '==', expenseBy);
    query = query.where('type', '==', 'REGULAR')

    try {
        const expenseRes = await query.get();
        let totalInvestment = 0;
        let totalExpMadeFromJIITAcc = 0;
        expenseRes.forEach((doc) => {
            if (doc.data().expenseTag === 'INVESTOR') {
                totalInvestment += Number(doc.data().expenseAmount);
            } else {
                totalExpMadeFromJIITAcc += Number(doc.data().expenseAmount);
            }
        });
        return res.json({ totalInvestment, totalExpMadeFromJIITAcc, totalTransaction: (totalInvestment + totalExpMadeFromJIITAcc) });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

module.exports = {
    fetchMyPortfolio
}