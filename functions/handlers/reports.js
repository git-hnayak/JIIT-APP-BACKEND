const { db, admin } = require('../utils/fbConfig');
const { getBranchLocation } = require('../utils/misc');

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

                if (reqYear && reqMonth) {
                    if (joinMonth === reqMonth && joinYear === reqYear) {
                        totalStudents += 1
                        students.push({
                            ...studentData
                        });
                    }
                } else if (reqYear) {
                    if (joinYear === reqYear) {
                        totalStudents += 1
                        students.push({
                            ...studentData
                        });
                    }
                } else if (reqMonth) {
                    if (joinMonth === reqMonth) {
                        totalStudents += 1
                        students.push({
                            ...studentData
                        });
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
           let totalStudents = 0;
           let totalPayment = 0;
           data.forEach((doc) => {
                const studentData = doc.data();
                const payments = studentData.payment || [];
                let isStudentPaymentMatchedCondition = false;

                payments.forEach((payment) => {
                    const payMonth = new Date(payment.date).getMonth();
                    const payYear = new Date(payment.date).getFullYear();
                    if (reqYear && reqMonth) {
                        if (payMonth === reqMonth && payYear === reqYear) {
                            isStudentPaymentMatchedCondition = true;
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
                                sarvaRollNumber: studentData.sarvaRollNumber

                            }
                            students.push(stdDetailsWithPayment);
                        } else {
                            isStudentPaymentMatchedCondition = false;
                        }
                    } else if (reqYear) {
                        if (payYear === reqYear) {
                            isStudentPaymentMatchedCondition = true;
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
                                sarvaRollNumber: studentData.sarvaRollNumber
                            }
                            students.push(stdDetailsWithPayment);
                        } else {
                            isStudentPaymentMatchedCondition = false;
                        }
                    } else  if (reqMonth) {
                        if (payMonth === reqMonth) {
                            isStudentPaymentMatchedCondition = true;
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
                                sarvaRollNumber: studentData.sarvaRollNumber
                            }
                            students.push(stdDetailsWithPayment);
                        } else {
                            isStudentPaymentMatchedCondition = false;
                        }
                    }
                });
                if (isStudentPaymentMatchedCondition) {
                    totalStudents += 1;
                }
           });
           return res.json({ students, totalStudents, totalPayment });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

module.exports = {
    fetchStudentDetailsReport,
    fetchStudentPaymentDetailsReport
}