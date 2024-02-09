// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore, collection} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyATuqxtZFCam_vmtTnlXxuLxq6wimUZFv0',
  authDomain: 'passwordmanager-e95df.firebaseapp.com',
  projectId: 'passwordmanager-e95df',
  storageBucket: 'passwordmanager-e95df.appspot.com',
  messagingSenderId: '1017178874683',
  appId: '1:1017178874683:web:a24dfa2de9eaef9061cd1e',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Exporter l'authentification Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export const accountsRef = collection(db, 'accounts');

export default app;
