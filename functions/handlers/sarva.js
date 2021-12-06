const { db, admin } = require('../utils/fbConfig');
const { getSarvaFee, getSarvaSession } = require('../utils/misc');
const { certificateTypeEnt } = require('../utils/entities');

// Sarva  Registration Progress
const sarvaRegistrationProgress = (req, res) => {
    const studentId = req.body.studentId;
    const studentCertificateType = req.body.studentCertificateType;
    const studentJoinDate = req.body.studentJoinDate;
    const studentCourse = req.body.studentCourse;
    const studentCourseDuration = req.body.studentCourseDuration;

    const sarvaFee = getSarvaFee(studentCourse, studentCourseDuration, studentCertificateType, studentJoinDate);
    const { sarvaSession, validTillDate } = getSarvaSession(studentCourseDuration, studentJoinDate);
    const studentUpdateData = {
        sarvaFee,
        sarvaSession,
        validTillDate,
        sarvaRegistrationStatus: 'INPROGRESS'
    };
    let counterRecord;

    db.collection('counters').get()
    .then((data) => {
        counterRecord = data.docs[0].data();
        if (studentCertificateType === certificateTypeEnt.regular) {
            studentUpdateData.sarvaRollNumber = `4333${counterRecord.sarvaRegularRollCnt < 10 ? '0' : ''}${counterRecord.sarvaRegularRollCnt + 1}`;
            counterRecord.sarvaRegularRollCnt+=1;
        } else if (studentCertificateType === certificateTypeEnt.urgent) {
            studentUpdateData.sarvaRollNumber = `${counterRecord.sarvaUrgentRollCnt < 10 ? '0' : ''}${counterRecord.sarvaUrgentRollCnt+1}4333`;
            counterRecord.sarvaUrgentRollCnt+=1;
        }
        return db.collection('students').doc(studentId).update(studentUpdateData);
    })
    .then(() => {
        return db.collection('counters').doc(counterRecord.id).update(counterRecord);
    })
    .then(() => {
        return res.json({ message: 'Sarva registration started successfully' });
    })
    .catch((err) => {
        res.status(500).json({ err: err.code });
        console.log('Error: ', err);
    });
}

// Sarva  Registration Complete
const sarvaRegistrationComplete = (req, res) => {
    const studentId = req.body.studentId;
    const sarvaRegistrationStatus = 'COMPLETE';
    const sarvaRegdCompletionDate = new Date().toISOString();
    const studentUpdateData = {
        sarvaRegistrationStatus,
        sarvaRegdCompletionDate
    };

    db.collection('students').doc(studentId).update(studentUpdateData)
        .then(() => {
            return res.json({ message: 'Sarva registration completed successfully' });
        })
        .catch((err) => {
            res.status(500).json({ err: err.code });
            console.log('Error: ', err);
        });
}

module.exports = {
    sarvaRegistrationProgress,
    sarvaRegistrationComplete
}