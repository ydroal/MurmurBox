// const { admin } = require('./firebaseAdmin');
const { getAuth } = require('firebase-admin/auth');

async function verifyGoogleToken(idToken) {
  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Google token:', error);
    throw new Error('Invalid or expired Google token');
  }
}

module.exports = verifyGoogleToken;
