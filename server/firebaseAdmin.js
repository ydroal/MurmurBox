const admin = require('firebase-admin');
const serviceAccount = require('./config/firebaseAdminKey.json');

// Firebase Admin SDKの初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); 
// テスト: `auth`が正しく初期化されているか確認
// admin.auth().listUsers(1)
//   .then(users => console.log('Firebase Auth Initialization OK', users))
//   .catch(error => console.error('Error initializing Firebase Auth:', error));

module.exports = {
  admin,
  db
};
