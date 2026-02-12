// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC1s2QuO---O0TYz9_BbqBZO-_gAbEhXMM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dbms-website-ec1e6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dbms-website-ec1e6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dbms-website-ec1e6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "256129501755",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:256129501755:web:38bdf6897368275dbaea1e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8EHKRQWFT6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Export analytics for use in other files if needed
export const analytics = getAnalytics(app);

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;

// Only initialize messaging if supported (not in all environments)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging not supported in this environment:', error);
  }
}

export { messaging, getToken, onMessage };