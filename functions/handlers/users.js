const { admin, db, firebase } = require('../utils/fbConfig');

// Signup
const userSignup = (req, res) => {
    const reqData = req.body;
    const newUser = {
        email: reqData.email,
        password: reqData.password,
        phoneNumber: reqData.phoneNumber
    }
    let userid = '';

    admin.auth().createUser(newUser)
    .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully created new user:', userRecord);
        // return res.status(201).json({ message: `Successfully created new user with uid: ${userRecord.uid}` })
        userid = userRecord.uid;
        return userRecord.uid;
      })
      .then(uid => {
          const userData = {
              userID: uid,
              email: newUser.email,
              phone: newUser.phoneNumber,
              firstName: reqData.firstName,
              lastName: reqData.lastName,
              userType: 'PROD',
              createdDate: new Date().toISOString()
          }

        return db.collection('users').add(userData);
      })
      .then(() => {
          return admin.auth().generateEmailVerificationLink(newUser.email)
            .then(emailVerificationLink => {
                // console.log('Email Value: ', authValue);
                return res.status(201).json({ message: `Successfully created new user with uid: ${userid}`, emailVerificationLink })
            })
            .catch(errVal => {
                return res.status(500).json({ error: errVal.code })
            })
        })
      .catch((error) => {
        console.log('Error creating new user:', error);
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({ message: 'Email is already in use' })
        } else if (error.code === 'auth/invalid-phone-number') {
            return res.status(400).json({ message: 'Invalid phone number' })
        } else if (error.code === 'auth/phone-number-already-exists') {
            return res.status(400).json({ message: 'Phone number is already in use' })
        } else if (error.code === 'auth/invalid-password') {
            return res.status(400).json({ message: 'Invalid Password' })
        }
        return res.status(500).json({ error: error.code })
      });
};

// Signup
const phoneSignup = async (req, res) => {
    const reqData = req.body;
    // console.log('Phone signup req data: ', reqData);
    const userData = {
        userID: reqData.user.uid,
        phoneNumber: reqData.user.phoneNumber,
        userType: 'PROD',
        signinMethod: 'phone',
        createdDate: new Date().toISOString()
    }

    try {
        if (reqData._tokenResponse.isNewUser) {
            await db.collection('users').add(userData);
            return res.json({ message: 'User added successfully' });
        } else {
            return res.json({ message: 'Phone already exist' });
        }
    } catch (error) {
        return res.status(500).json({ error })
    }
};

const userSignin = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    // const uid = 'hello-jiit';

    // admin
    // .auth()
    // .createCustomToken(uid)
    // .then((customToken) => {
    //     // Send token back to client
    //     return res.json({ userToken: customToken })
    // })
    // .catch((error) => {
    //     console.log('Error creating custom token:', error);
    //     return res.status(500).json({ error: err.code })
    // });

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            // console.log('Loggedin User: ', data.user);
            return data.user.getIdToken(true);
        })
        .then((token) => {
            return res.json({ token })
        })
        .catch(err => {
            if (err.code === 'auth/wrong-password') {
                return res.status(400).json({ message: 'Wrong credential, please try again' });
            } else if (err.code === 'auth/user-not-found') {
                return res.status(400).json({ message: 'User not found' });
            } else if (err.code === 'auth/invalid-email') {
                return res.status(400).json({ message: 'Invalid email' });
            }
            return res.status(500).json({ message: err.code })
        })
};

const getAllUsers = (req, res) => {
    db
        .collection('users')
        .where('userType', '==', 'PROD')
        .get()
        .then((data) => {
            // console.log('User Data: ', data);
           let users = [];
           data.forEach((doc) => {
               users.push({
                   id: doc.id,
                   ...doc.data()
               });
           });
           return res.json(users);
        })
        .catch((err) => {
            res.status(500).json({ message: 'Something went wrong' });
            console.log('Error: ', err);
        });
};

const getAuthenticatedUser = (req, res) => {
    db.doc(`/users/${req.user._id}`).update({ lastSigninDate: new Date().toISOString() })
        .then(() => {
            return db.collection('users').doc(req.user._id).get()
        })
        .then(doc => {
            return res.json({
                id: doc.id,
                ...doc.data()
            });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
}

const updateUserDetails = (req, res) => {
    const userDetails = req.body;
    db.doc(`/users/${req.user._id}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'User updated successfully' });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
};

// Counter
const fetchCounters = (req, res) => {
    const role = req.user.role;
    let counterData;
    db.collection('counters').get()
        .then((data) => {
            const {
                totalRegularStudentBDK,
                totalRegularStudentKJR,
                totalUrgentCertStudentBDK,
                totalUrgentCertStudentKJR
            } = data.docs[0].data();

            if (role === 'JIIT_BDK_ADMIN') {
                counterData = {
                    totalRegularStudentBDK,
                    totalUrgentCertStudentBDK,
                    totalStudent: totalRegularStudentBDK + totalUrgentCertStudentBDK
                }
            } else if (role === 'JIIT_KJR_ADMIN') {
                counterData = {
                    totalRegularStudentKJR,
                    totalUrgentCertStudentKJR,
                    totalStudent: totalRegularStudentKJR + totalUrgentCertStudentKJR
                }
            } else {
                counterData = {
                    ...data.docs[0].data(),
                    totalStudent: totalRegularStudentBDK + totalUrgentCertStudentBDK + totalRegularStudentKJR + totalUrgentCertStudentKJR
                }
            }
            return res.json({ counter: counterData });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
}

// Send Password Reset Email
const sendPasswordResetEmail = (req, res) => {
    const email = req.body.email;
    
    firebase.auth().sendPasswordResetEmail(email)
        .then((data) => {
            return res.json({ message: 'Password reset email has been sent successfully' });
        })
        .catch(err => {
            if (err.code === 'auth/wrong-password') {
                return res.status(400).json({ message: 'Wrong credential, please try again' });
            } else if (err.code === 'auth/user-not-found') {
                return res.status(400).json({ message: 'Email not found' });
            } else if (err.code === 'auth/invalid-email') {
                return res.status(400).json({ message: 'Invalid email' });
            }
            return res.status(500).json({ message: err.code })
        })
}

module.exports = {
    userSignin,
    userSignup,
    phoneSignup,
    getAllUsers,
    getAuthenticatedUser,
    fetchCounters,
    updateUserDetails,
    sendPasswordResetEmail
}
