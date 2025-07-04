const { db, admin } = require('../utils/fbConfig');

// Student Details Report
const fetchStudentDetailsReport = (req, res) => {
    const reqMonth = req.body.month;
    const reqYear = req.body.year;

    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN' || req.user.role === 'JIIT_BDK_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN' || req.user.role === 'JIIT_KJR_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'KJR');
    }

    query
        .get()
        .then((data) => {
           let students = [];
           let totalStudents = 0;
           data.forEach((doc) => {
                const studentData = doc.data();
                delete studentData.payment;
                const joinMonth = new Date(studentData.joinDate).getMonth();
                const joinYear = new Date(studentData.joinDate).getFullYear();

                const formatedStudentData = {
                    jiitRegdNumber: studentData.jiitRegdNumber,
                    name: studentData.name,
                    phoneNumber: studentData.phoneNumber,
                    address: studentData.address,
                    gender: studentData.gender,
                    parentName: studentData.parentName,
                    eduQualification: studentData.eduQualification,
                    certificateType: studentData.certificateType,
                    course: studentData.course,
                    baseCourseFee: studentData.baseCourseFee,
                    actualCourseFee: studentData.courseFee,
                    courseDuration: studentData.courseDuration,
                    sarvaRollNumber: studentData.sarvaRollNumber,
                    castCategory: studentData.castCategory,
                    dob: studentData.dob,
                    joinDate: studentData.joinDate,
                    id: studentData.id,
                    email: studentData.email,
                }

                if (reqYear && (reqMonth || reqMonth === 0)) {
                    if (joinMonth === reqMonth && joinYear === reqYear) {
                        totalStudents += 1
                        students.push(formatedStudentData);
                    }
                } else if (reqYear) {
                    if (joinYear === reqYear) {
                        totalStudents += 1
                        students.push(formatedStudentData);
                    }
                } else if (reqMonth || reqMonth === 0) {
                    if (joinMonth === reqMonth) {
                        totalStudents += 1
                        students.push(formatedStudentData);
                    }
                }
           });
           return res.json({ students, totalStudents });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Student Payment Details Report
const fetchStudentPaymentDetailsReport = (req, res) => {
    const reqMonth = req.body.month;
    const reqYear = req.body.year;

    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN' || req.user.role === 'JIIT_BDK_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN' || req.user.role === 'JIIT_KJR_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'KJR');
    }

    query
        .get()
        .then((data) => {
           let students = [];
           let totalPayment = 0;
           data.forEach((doc) => {
                const studentData = doc.data();
                const payments = studentData.payment || [];

                payments.forEach((payment) => {
                    const payMonth = new Date(payment.date).getMonth();
                    const payYear = new Date(payment.date).getFullYear();
                    if (reqYear && (reqMonth || reqMonth === 0)) {
                        if (payMonth === reqMonth && payYear === reqYear) {
                            totalPayment += Number(payment.amount);
                            const stdDetailsWithPayment = {
                                jiitRegdNumber: studentData.jiitRegdNumber,
                                name: studentData.name,
                                phoneNumber: studentData.phoneNumber,
                                amountPaid: Number(payment.amount),
                                paymentDate: payment.date,
                                paymentNote: payment.note,
                                certificateType: studentData.certificateType,
                                parentName: studentData.parentName,
                                course: studentData.course,
                                courseFee: studentData.courseFee,
                                sarvaRollNumber: studentData.sarvaRollNumber,
                                id: studentData.id

                            }
                            students.push(stdDetailsWithPayment);
                        }
                    } else if (reqYear) {
                        if (payYear === reqYear) {
                            totalPayment += Number(payment.amount);
                            const stdDetailsWithPayment = {
                                jiitRegdNumber: studentData.jiitRegdNumber,
                                name: studentData.name,
                                phoneNumber: studentData.phoneNumber,
                                amountPaid: Number(payment.amount),
                                paymentDate: payment.date,
                                paymentNote: payment.note,
                                certificateType: studentData.certificateType,
                                parentName: studentData.parentName,
                                course: studentData.course,
                                courseFee: studentData.courseFee,
                                sarvaRollNumber: studentData.sarvaRollNumber,
                                id: studentData.id
                            }
                            students.push(stdDetailsWithPayment);
                        }
                    } else  if (reqMonth || reqMonth === 0) {
                        if (payMonth === reqMonth) {
                            totalPayment += Number(payment.amount);
                            const stdDetailsWithPayment = {
                                jiitRegdNumber: studentData.jiitRegdNumber,
                                name: studentData.name,
                                phoneNumber: studentData.phoneNumber,
                                amountPaid: Number(payment.amount),
                                paymentDate: payment.date,
                                paymentNote: payment.note,
                                certificateType: studentData.certificateType,
                                parentName: studentData.parentName,
                                course: studentData.course,
                                courseFee: studentData.courseFee,
                                sarvaRollNumber: studentData.sarvaRollNumber,
                                id: studentData.id
                            }
                            students.push(stdDetailsWithPayment);
                        }
                    }
                });
           });

           const studentSet = new Set();
           students.forEach((studentVal) => {
               studentSet.add(studentVal.jiitRegdNumber);
           })
           return res.json({ students, totalStudents: studentSet.size, totalPayment });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Expenditure Report
const fetchExpenditureReport = async (req, res) => {
    const reqMonth = req.body.month;
    const reqYear = req.body.year;

    let expenseQuery = db.collection('expenses');
    let recurringExpenseQuery = db.collection('recurringExpenses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        expenseQuery = expenseQuery.where('branchLocation', '==', 'BDK');
        recurringExpenseQuery = recurringExpenseQuery.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        expenseQuery = expenseQuery.where('branchLocation', '==', 'KJR');
        recurringExpenseQuery = recurringExpenseQuery.where('branchLocation', '==', 'KJR');
    }

    expenseQuery = expenseQuery.where('expenseTag', '==', 'JIIT_ACCOUNT');

    try {
        const expenseRes = await expenseQuery.get();
        const recurringExpRes = await recurringExpenseQuery.get();

        let totalExpFromJiitAcc = 0;
        let totalRecurringExpense = 0;
        let totalExpenses = 0;
        const expenses = [];

        expenseRes.forEach((doc) => {
            const expenseData = doc.data();
            const payMonth = new Date(expenseData.expenseDate).getMonth();
            const payYear = new Date(expenseData.expenseDate).getFullYear();
            const formatedExpenseData = {
                amount: expenseData.expenseAmount,
                category: expenseData.expenseCategory,
                subCategory: expenseData.expenseSubCategory,
                expenseBy: expenseData.expenseByName,
                expenseDate: expenseData.expenseDate,
                note: expenseData.expenseNote,
                referenceNumber: expenseData.expenseRefNo,
                vendorInfo: expenseData.expenseVendor,
                type: 'GENERAL',
                id: expenseData.id
            }
            if (reqYear && (reqMonth || reqMonth === 0)) {
                if (payMonth === reqMonth && payYear === reqYear) {
                    expenses.push(formatedExpenseData);
                    totalExpFromJiitAcc += Number(expenseData.expenseAmount);
                }
            } else if (reqYear) {
                if (payYear === reqYear) {
                    expenses.push(formatedExpenseData);
                    totalExpFromJiitAcc += Number(expenseData.expenseAmount);
                }
            } else if (reqMonth || reqMonth === 0) {
                if (payMonth === reqMonth) {
                    expenses.push(formatedExpenseData);
                    totalExpFromJiitAcc += Number(expenseData.expenseAmount);
                }
            }
        });

        recurringExpRes.forEach((doc) => {
            const recurringExpenseData = doc.data();
            const payMonth = recurringExpenseData.month - 1;
            const payYear = recurringExpenseData.year;
            const formatedRecExpenseData = {
                amount: recurringExpenseData.amount,
                category: recurringExpenseData.category,
                subCategory: 'Recurring/Monthly expenses',
                expenseBy: recurringExpenseData.expenseByName,
                expenseDate: `${recurringExpenseData.month}/${recurringExpenseData.year}`,
                note: 'Recurring/Monthly expenses',
                referenceNumber: 'NA',
                vendorInfo: recurringExpenseData.receiver,
                type: 'RECURRING',
                id: recurringExpenseData.id
            }
            if (reqYear && (reqMonth || reqMonth === 0)) {
                if (payMonth === reqMonth && payYear === reqYear) {
                    expenses.push(formatedRecExpenseData);
                    totalRecurringExpense += Number(recurringExpenseData.amount);
                }
            } else if (reqYear) {
                if (payYear === reqYear) {
                    expenses.push(formatedRecExpenseData);
                    totalRecurringExpense += Number(recurringExpenseData.amount);
                }
            } else if (reqMonth || reqMonth === 0) {
                if (payMonth === reqMonth) {
                    expenses.push(formatedRecExpenseData);
                    totalRecurringExpense += Number(recurringExpenseData.amount);
                }
            }
        });

        totalExpenses = totalExpFromJiitAcc + totalRecurringExpense;

        return res.json({ expenses, totalExpenses });
        
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Student Due Details Report
const fetchStudentDueReportMonthly = (req, res) => {
    const reqMonth = req.body.month;
    const reqYear = req.body.year;

    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN' || req.user.role === 'JIIT_BDK_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN' || req.user.role === 'JIIT_KJR_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'KJR');
    }

    query = query.where('certificateType', '==', 'REGULAR');

    query
        .get()
        .then((data) => {
           let students = [];
           let totalStudents = 0;
           data.forEach((doc) => {
                const studentData = doc.data();
                const payments = studentData.payment || [];
                let isCurrentMonthPaid = false;
                let totalPaid = 0;

                payments.forEach((payment) => {
                    totalPaid += Number(payment.amount);
                    const payMonth = new Date(payment.date).getMonth();
                    const payYear = new Date(payment.date).getFullYear();

                    if (payYear === reqYear && payMonth === reqMonth) {
                        isCurrentMonthPaid = true;
                    }
                });

                const isDue = Number(studentData.courseFee) - totalPaid > 0;

                if (isDue && !isCurrentMonthPaid) {
                    totalStudents += 1;
                    const stdDetailsWithPayment = {
                        jiitRegdNumber: studentData.jiitRegdNumber,
                        name: studentData.name,
                        amountPaid: totalPaid,
                        amountDue: Number(studentData.courseFee) - totalPaid,
                        certificateType: studentData.certificateType,
                        joinDate: studentData.joinDate,
                        parentName: studentData.parentName,
                        phoneNumber: studentData.phoneNumber,
                        courseFee: studentData.courseFee,
                        sarvaRollNumber: studentData.sarvaRollNumber,
                        id: studentData.id
                    }
                    students.push(stdDetailsWithPayment);
                }
           });
           return res.json({ students, totalStudents });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Student SARVA Elligible Details Report
const fetchStudentSARVAElligible = (req, res) => {

    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN' || req.user.role === 'JIIT_BDK_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN' || req.user.role === 'JIIT_KJR_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'KJR');
    }

    query = query.where('certificateType', '==', 'REGULAR');

    query
        .get()
        .then((data) => {
           let students = [];
           let totalStudents = 0;
           data.forEach((doc) => {
                const studentData = doc.data();
                const payments = studentData.payment || [];
                let totalPaid = 0;

                payments.forEach((payment) => {
                    totalPaid += Number(payment.amount);
                });

                const courseFeeSixtyPercent = (Number(studentData.courseFee)/100) * 60;

                if (totalPaid >= courseFeeSixtyPercent && studentData.sarvaRegistrationStatus !== 'COMPLETE' && studentData.course !== 'JUNIOR' && studentData.status !== 'inactive' && studentData.status !== 'archived' ) {
                    totalStudents += 1;
                    const stdDetailsWithPayment = {
                        jiitRegdNumber: studentData.jiitRegdNumber,
                        name: studentData.name,
                        amountPaid: totalPaid,
                        amountDue: Number(studentData.courseFee) - totalPaid,
                        certificateType: studentData.certificateType,
                        joinDate: studentData.joinDate,
                        parentName: studentData.parentName,
                        phoneNumber: studentData.phoneNumber,
                        courseFee: studentData.courseFee,
                        sarvaRollNumber: studentData.sarvaRollNumber || 'NA',
                        sarvaRegistrationStatus: studentData.sarvaRegistrationStatus,
                        id: studentData.id
                    }
                    students.push(stdDetailsWithPayment);
                }
           });
           return res.json({ students, totalStudents });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

module.exports = {
    fetchStudentDetailsReport,
    fetchStudentPaymentDetailsReport,
    fetchExpenditureReport,
    fetchStudentDueReportMonthly,
    fetchStudentSARVAElligible
}