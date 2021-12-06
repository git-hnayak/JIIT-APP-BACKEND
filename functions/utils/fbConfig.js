const admin = require('firebase-admin');
const firebase = require('firebase');
const { firebaseConfig } = require('./config');
// const serviceAccount = require("../../jiit-app-firebase-adminsdk-ijn8c-56890c65f1.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

firebase.initializeApp(firebaseConfig);
admin.initializeApp();

const db = admin.firestore();

module.exports = {
    admin,
    db,
    firebase
}
