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
// Fallback values ensure production builds on platforms like Vercel initialize cleanly even if env vars are missing
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyClQXX9GPqZDkkD-G0A4hOkCrUOKrX9SQs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'rental-connect-ca69a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'rental-connect-ca69a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'rental-connect-ca69a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '376976284563',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:376976284563:web:6ab3a44b0f21db5af7a666',
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
