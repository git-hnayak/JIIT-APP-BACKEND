const { admin, db } = require('./fbConfig');

const FBAuth = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        return res.status(403).json({ error: 'Unautherized' })
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            return db.collection('users')
                .where('userID', '=', req.user.uid)
                .limit(1)
                .get()
        })
        .then(data => {
            req.user._id = data.docs[0].id;
            req.user.firstName = data.docs[0].data().firstName;
            req.user.lastName = data.docs[0].data().lastName;
            req.user.role = data.docs[0].data().role;
            req.user.email = data.docs[0].data().email;
            return next();
        })
        .catch(err => {
            return res.status(403).json({ err })
        })
}

module.exports = {
    FBAuth
}
