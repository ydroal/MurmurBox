// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const firebase = initializeApp(firebaseConfig);

const auth = getAuth(firebase);

// const signInToFirebase = async () => {
//   const googleIdToken = localStorage.getItem('googleIdToken');
//   console.log('Google ID Token:', googleIdToken);
//   if (googleIdToken) {
//     try {
//       const credential = GoogleAuthProvider.credential(googleIdToken);
//       console.log(credential);
//       await signInWithCredential(auth, credential);
//       console.log('Firebaseサインイン成功');
//     } catch (error) {
//       console.error('Firebaseサインインエラー:', error);
//     }
//   } else {
//     console.log('Google IDトークンが見つかりません');
//   }
// };

// export { auth, signOut, signInToFirebase };
export { auth, signOut };
