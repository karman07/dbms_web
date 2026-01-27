// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1s2QuO---O0TYz9_BbqBZO-_gAbEhXMM",
  authDomain: "dbms-website-ec1e6.firebaseapp.com",
  projectId: "dbms-website-ec1e6",
  storageBucket: "dbms-website-ec1e6.firebasestorage.app",
  messagingSenderId: "256129501755",
  appId: "1:256129501755:web:38bdf6897368275dbaea1e",
  measurementId: "G-8EHKRQWFT6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);