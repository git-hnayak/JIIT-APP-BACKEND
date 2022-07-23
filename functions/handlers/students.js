const { db, admin } = require('../utils/fbConfig');
const { getBranchLocation } = require('../utils/misc');

// Get All Students
const fetchAllStudents = (req, res) => {
    db
        .collection('students')
        .orderBy('createdDate', 'desc')
        .get()
        .then((data) => {
           let students = [];
           data.forEach((doc) => {
               students.push({
                   id: doc.id,
                   ...doc.data()
               });
           });
           return res.json(students);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get Recent Students
const fetchRecentStudents = (req, res) => {
    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN' || req.user.role === 'JIIT_BDK_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN' || req.user.role === 'JIIT_KJR_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
        .orderBy('firstName', 'asc')
        .get()
        .then((data) => {
           let students = [];
           data.forEach((doc) => {
               students.push({
                   id: doc.id,
                   ...doc.data()
               });
           });
           return res.json(students);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get All Students by branch location
const fetchAllStudentsByBranchAndCertType = (req, res) => {
    const branchLoc = req.body.branchLocation;
    const certType = req.body.certificateType;

    db
        .collection('students')
        .where('branchLocation', '==', branchLoc)
        .where('certificateType', '==', certType)
        .get()
        .then((data) => {
           let students = [];
           data.forEach((doc) => {
               students.push({
                   id: doc.id,
                   ...doc.data()
               });
           });
           return res.json(students);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get Students by query
const fetchStudentsByQuery = (req, res) => {

    const {
        certificateType,
        course,
        firstName,
        jiitRegdNumber,
        sarvaRollNumber,
        advancePayQuery
    } = req.body;

    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN' || req.user.role === 'JIIT_BDK_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN' || req.user.role === 'JIIT_KJR_SUPERVISOR') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    
    if (certificateType) query = query.where('certificateType', '==', certificateType);
    if (course) query = query.where('course', '==', course);
    if (firstName) query = query.where('firstName', '==', firstName);
    if (jiitRegdNumber) query = query.where('jiitRegdNumber', '==', jiitRegdNumber);
    if (sarvaRollNumber) query = query.where('sarvaRollNumber', '==', sarvaRollNumber);

    query
        .get()
        .then((data) => {
           let students = [];
           data.forEach((doc) => {
                const studentData = doc.data();
                const payments = studentData.payment || [];
                const courseFee = Number(studentData.courseFee);
                if (advancePayQuery) {
                    let totalStdPayment = 0;
                    payments.forEach((payment) => {
                        totalStdPayment += Number(payment.amount);
                    });
                    if (advancePayQuery === 'SARVA_ELIGIBLE') {
                        const courseFeeFiftyPercent = (courseFee/100) * 60;
                        if (totalStdPayment >= courseFeeFiftyPercent && studentData.sarvaRegistrationStatus !== 'COMPLETE' && studentData.course !== 'JUNIOR' && studentData.status !== 'inactive' && studentData.status !== 'archived' && studentData.certificateType === 'REGULAR') {
                            students.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        }
                    } else if (advancePayQuery === 'COURSE_FEE_PENDING') {
                        if (totalStdPayment < courseFee) {
                            students.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        }
                    }
                } else {
                    students.push({
                        id: doc.id,
                        ...doc.data()
                    });
                }
           });
           return res.json(students);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Get Student details by id
const fetchStudentById = (req, res) => {
    const studentId = req.params.id;

    db
        .collection('students').doc(studentId)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                res.status(404).json({ error: 'Student not found' })
            }
           return res.json(doc.data());
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
}

// Admit applied students after successful creation
const admitAppliedStudents = (appliedStudentId, res) => {
        const appliedStudentData = {
            status: 'ADMITED',
            admissionDate: new Date().toISOString(),
            admitedBy: req.user.firstName + ' ' + req.user.lastName
        }

        db.doc(`/appliedStudents/${appliedStudentId}`).update(appliedStudentData)
        .then(() => {
            return res.json({ message: 'Student admission processed successfully!' });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
}

// Create New Student
const createNewStudent = (req, res) => {
    const newStudent = req.body;
    newStudent.branchLocation = getBranchLocation(req.user.role);
    newStudent.sarvaRegistrationStatus = 'NA';
    newStudent.sarvaMarkDetailsRegistrationStatus = 'NA';
    newStudent.isCertificateIssued = false;
    newStudent.createdDate = new Date().toISOString();
    
    let studentId;
    let counterRecord;

    db.collection('counters').get()
        .then((data) => {
            counterRecord = data.docs[0].data();
            if (newStudent.certificateType === 'REGULAR') {
                if (newStudent.branchLocation === 'BDK') {
                    counterRecord.totalRegularStudentBDK+=1;
                    newStudent.jiitRegdNumber = '433301CR' + counterRecord.totalRegularStudentBDK;
                } else if (newStudent.branchLocation === 'KJR') {
                    counterRecord.totalRegularStudentKJR+=1;
                    newStudent.jiitRegdNumber = '433302CR' + counterRecord.totalRegularStudentKJR;
                }
            } else if (newStudent.certificateType === 'URGENT') {
                if (newStudent.branchLocation === 'BDK') {
                    counterRecord.totalUrgentCertStudentBDK+=1;
                    newStudent.jiitRegdNumber = '433301CR' + counterRecord.totalUrgentCertStudentBDK + 'X';
                } else if (newStudent.branchLocation === 'KJR') {
                    counterRecord.totalUrgentCertStudentKJR+=1;
                    newStudent.jiitRegdNumber = '433302CR' + counterRecord.totalUrgentCertStudentKJR + 'X';
                }
            }
            return db.collection('students').add(newStudent)
        })
        .then((doc) => {
            studentId = doc.id;
            return db.collection('counters').doc(counterRecord.id).update(counterRecord);
        })
        .then(() => {
            if (newStudent.appliedStudentsId) {
                return admitAppliedStudents(newStudent.appliedStudentsId, res);
            }
            return res.json({ message: `Student created successfully with id: ${studentId}` });
        })
        .catch((err) => {
            res.status(500).json({ err: err.code });
            console.log('Error: ', err);
        });
};

// Create Applied Student
const createAppliedStudent = (req, res) => {
    const appliedStudent = req.body;
    appliedStudent.createdDate = new Date().toISOString();
    appliedStudent.status = 'NEW';

    db.collection('appliedStudents').add(appliedStudent)
        .then((doc) => {
            studentId = doc.id;
            return res.json({ message: `Student created successfully with id: ${studentId}` });
        })
        .catch((err) => {
            res.status(500).json({ err: err.code });
        });
};

// Reject applied students
const rejectAppliedStudents = (req, res) => {
    const appliedStudentsId = req.params.id;
    const appliedStudentData = {
        status: 'REJECTED',
        rejectedDate: new Date().toISOString(),
        rejectedBy: req.user.firstName + ' ' + req.user.lastName
    }

    db.doc(`/appliedStudents/${appliedStudentsId}`).update(appliedStudentData)
    .then(() => {
        return res.json({ message: 'Student admission rejected successfully!' });
    })
    .catch(error => {
        res.status(500).json({ error });
    })
}

// Delete Applied Student
const deleteAppliedStudents = (req, res) => {
    const appliedStudentsId = req.params.id;
    db.doc(`/appliedStudents/${appliedStudentsId}`).delete()
        .then(() => {
            return res.json({ message: 'Applied student deleted successfully' });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
}

// Get Applied Students
const fetchAppliedStudents = (req, res) => {
    let query = db.collection('appliedStudents');
    query = query.where('status', '==', 'NEW');

    query
        .get()
        .then((data) => {
           let appliedStudents = [];
           data.forEach((doc) => {
                appliedStudents.push({
                   id: doc.id,
                   ...doc.data()
               });
           });
           return res.json(appliedStudents);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Update Student
const updateStudent = (req, res) => {
    const studentData = req.body;
    studentData.modifiedDate = new Date().toISOString();
    studentData.modifiedBy = req.user.firstName + ' ' + req.user.lastName;
    db.doc(`/students/${studentData.id}`).update(studentData)
        .then(() => {
            return res.json({ message: 'Student updated successfully!' });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
};

// Get Total Student Payments
const fetchStudentInfoInTotal = (req, res) => {
    let query = db.collection('students');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
        .get()
        .then((data) => {
           let totalPayment = 0;
           let totalRegularStudents = 0;
           let totalUrgentStudents = 0;
           let totalSarvaNotRegistered = 0;
           let totalSarvaMarkNotSent = 0;
           let totalCourseFeeNotCompleted = 0;
           let totalCertificateNotIssued = 0;
           let totalPGDCAStudents = 0;
           let totalADCAStudents = 0;
           let totalADCFAStudents = 0;
           let totalDCAStudents = 0;
           let totalDCFAStudents = 0;
           let totalStudentsCourseFees = 0;
           let totalCourseFeesToBePaid = 0;
           data.forEach((doc) => {
               const studentData = doc.data();
               const payments = studentData.payment || [];
               if (studentData.certificateType === 'REGULAR') {
                totalRegularStudents += 1;
               }
               if (studentData.certificateType === 'URGENT') {
                totalUrgentStudents += 1;
               }
               if (studentData.sarvaRegistrationStatus !== 'COMPLETE') {
                totalSarvaNotRegistered += 1;
               }
               if (studentData.sarvaMarkDetailsRegistrationStatus !== 'COMPLETE') {
                totalSarvaMarkNotSent += 1;
               }
               if (!studentData.isCertificateIssued) {
                totalCertificateNotIssued += 1;
               }
               if (studentData.course === 'PGDCA') {
                totalPGDCAStudents += 1;
               }
               if (studentData.course === 'ADCA') {
                totalADCAStudents += 1;
               }
               if (studentData.course === 'ADCFA') {
                totalADCFAStudents += 1;
               }
               if (studentData.course === 'DCFA') {
                totalDCFAStudents += 1;
               }
               if (studentData.course === 'DCA') {
                totalDCAStudents += 1;
               }
               if (studentData.courseFee && Number(studentData.courseFee) > 0) {
                totalStudentsCourseFees += Number(studentData.courseFee);
               }
               let stdPayCount = 0;
               payments.forEach((payment) => {
                totalPayment += Number(payment.amount);
                stdPayCount += Number(payment.amount);
               })
               if (stdPayCount < Number(studentData.courseFee)) {
                totalCourseFeeNotCompleted += 1;
               }
           });
           return res.json({
                totalPayment,
                totalRegularStudents,
                totalUrgentStudents,
                totalSarvaNotRegistered,
                totalSarvaMarkNotSent,
                totalCourseFeeNotCompleted,
                totalCertificateNotIssued,
                totalPGDCAStudents,
                totalADCAStudents,
                totalADCFAStudents,
                totalDCAStudents,
                totalDCFAStudents,
                totalCourseFeesToBePaid: totalStudentsCourseFees - totalPayment
           });
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};


module.exports = {
    fetchAllStudents,
    fetchRecentStudents,
    createNewStudent,
    updateStudent,
    fetchStudentById,
    fetchAllStudentsByBranchAndCertType,
    fetchStudentsByQuery,
    fetchStudentInfoInTotal,
    createAppliedStudent,
    fetchAppliedStudents,
    rejectAppliedStudents,
    deleteAppliedStudents
}
