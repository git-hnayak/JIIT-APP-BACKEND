const { db, admin } = require('../utils/fbConfig');
const { getCourseFee, getBranchLocation } = require('../utils/misc');

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

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }
    query
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
    const branchLoc = req.body.branchLocation;
    const certType = req.body.certificateType;
    const course = req.body.course;
    const name = req.body.name;
    const jiitRegdNumber = req.body.jiitRegdNumber;
    const sarvaRollNumber = req.body.sarvaRollNumber;

    let query = db.collection('students');

    if (branchLoc) query = query.where('branchLocation', '==', branchLoc);
    if (certType) query = query.where('certificateType', '==', certType);
    if (course) query = query.where('course', '==', course);
    if (name) query = query.where('name', '==', name);
    if (jiitRegdNumber) query = query.where('jiitRegdNumber', '==', jiitRegdNumber);
    if (sarvaRollNumber) query = query.where('sarvaRollNumber', '==', sarvaRollNumber);

    query
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
            return res.json({ message: `Student created successfully with id: ${studentId}` });
        })
        .catch((err) => {
            res.status(500).json({ err: err.code });
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
           data.forEach((doc) => {
               const studentData = doc.data();
               const payments = studentData.payment;
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
               let stdPayCount = 0;
               payments.forEach((payment) => {
                totalPayment += Number(payment.amount);
                stdPayCount += Number(payment.amount);
               })
               if (stdPayCount < studentData.courseFee) {
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
                totalDCFAStudents
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
    fetchStudentInfoInTotal
}
