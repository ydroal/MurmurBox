const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
// const serviceAccount = require('./config/firebaseAdminKey.json');

// Where the Firebase Admin Key is stored (dev fallback during the 1Password migration)
const firebaseKeyPath = path.resolve(__dirname, 'config', 'firebaseAdminKey.json');

let serviceAccount;

if (process.env.FIREBASE_ADMIN_KEY_JSON) {
  // Any environment: read the key from an environment variable (1Password / Heroku config)
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY_JSON);
  } catch (error) {
    // Do not log the value or the parser message: both may contain key material
    console.error('FIREBASE_ADMIN_KEY_JSON is not valid JSON.');
    process.exit(1);
  }
} else if (process.env.NODE_ENV === 'production') {
  console.error('FIREBASE_ADMIN_KEY_JSON is not set in the environment variables.');
  process.exit(1);
} else if (fs.existsSync(firebaseKeyPath)) {
  // Dev fallback: read the key from a file
  serviceAccount = require(firebaseKeyPath);
} else {
  console.error(
    `FIREBASE_ADMIN_KEY_JSON is not set and the key file was not found at: ${firebaseKeyPath}`
  );
  process.exit(1);
}

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = {
  admin,
  db
};
