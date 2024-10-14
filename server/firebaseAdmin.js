const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
// const serviceAccount = require('./config/firebaseAdminKey.json');

// Firebase Admin Keyの保存先ディレクトリ（開発環境）
const firebaseKeyPath = path.resolve(__dirname, 'config', 'firebaseAdminKey.json');

let serviceAccount;

if (process.env.NODE_ENV === 'production') {
  // 本番環境の場合、環境変数からFirebase Admin Keyを読み込む
  if (process.env.FIREBASE_ADMIN_KEY_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY_JSON);
  } else {
    console.error('FIREBASE_ADMIN_KEY_JSON is not set in the environment variables.');
    process.exit(1);
  }
} else {
  // 開発環境の場合、ファイルからFirebase Admin Keyを読み込む
  if (fs.existsSync(firebaseKeyPath)) {
    serviceAccount = require(firebaseKeyPath);
  } else {
    console.error(`Firebase Admin Key file not found at: ${firebaseKeyPath}`);
    process.exit(1);
  }
}

// Firebase Admin SDKの初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); 

module.exports = {
  admin,
  db
};
