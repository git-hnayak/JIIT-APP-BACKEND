const { db, admin } = require('../utils/fbConfig');
const { getBranchLocation } = require('../utils/misc');

// Get All Courses
const fetchAllCourses = async (req, res) => {
    let query = db.collection('courses');

    if (req.user.role === 'JIIT_BDK_ADMIN') {
        query = query.where('branchLocation', '==', 'BDK');
    } else if (req.user.role === 'JIIT_KJR_ADMIN') {
        query = query.where('branchLocation', '==', 'KJR');
    }

    try {
        const data = await query.get();
        let courses = [];
           data.forEach((doc) => {
            courses.push({
                   id: doc.id,
                   ...doc.data()
               });
           });
        return res.json(courses);
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Get Courses by branch location
const fetchCoursesByBranch = (req, res) => {
    const branchLoc = req.params.branch;

    db
        .collection('courses')
        .where('branchLocation', '==', branchLoc)
        .get()
        .then((data) => {
           let courses = [];
           data.forEach((doc) => {
            courses.push({
                   id: doc.id,
                   ...doc.data()
               });
           });
           return res.json(courses);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

// Create New Course
const createNewCourse = (req, res) => {
    const courseData = req.body;
    courseData.createdDate = new Date().toISOString();
    courseData.createdBy = req.user.firstName + ' ' + req.user.lastName;
    courseData.branchLocation = getBranchLocation(req.user.role);

    db.collection('courses').add(courseData)
        .then((doc) => {
            return res.json({ message: `Course created successfully with id: ${doc.id}` });
        })
        .catch((err) => {
            res.status(500).json({ err: err.code });
            console.log('Error: ', err);
        });
};

// Update Courses
const updateCourse = async (req, res) => {
    const courseDetails = req.body;
    courseDetails.modifiedDate = new Date().toISOString();
    courseDetails.modifiedBy = req.user.firstName + ' ' + req.user.lastName;
    try {
        await db.doc(`/courses/${courseDetails.id}`).update(courseDetails);
        return res.json({ message: 'Course updated successfully' });
    } catch (error) {
        res.status(500).json({ error });
    }
};

module.exports = {
    createNewCourse,
    updateCourse,
    fetchAllCourses,
    fetchCoursesByBranch
}
