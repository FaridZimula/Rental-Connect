import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

// ─── Firebase Config ─────────────────────────────────────────────────────────
// These values come from your Firebase Console → Project Settings → Your Apps → Web App
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// ─── Initialize ──────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  auth,
  googleProvider,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
};

export type { FirebaseUser };
