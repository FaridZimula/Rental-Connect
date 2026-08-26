import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type FirebaseUser,
} from '../lib/firebase';
import { api } from '../lib/api';

export type UserRole = 'tenant' | 'landlord' | 'admin';

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profile_image?: string;
  is_verified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'tenant' | 'landlord';
  }) => Promise<void>;
  signInWithGoogle: (role?: 'tenant' | 'landlord') => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Sync the Firebase-authenticated user with the Postgres backend.
 * Returns the Postgres user profile.
 */
async function syncUserWithBackend(
  firebaseUser: FirebaseUser,
  extra?: { full_name?: string; phone?: string; role?: string },
): Promise<AuthUser> {
  const idToken = await firebaseUser.getIdToken();
  const { data } = await api.post(
    '/auth/sync',
    {
      full_name: extra?.full_name || firebaseUser.displayName || 'User',
      phone: extra?.phone,
      role: extra?.role,
    },
    { headers: { Authorization: `Bearer ${idToken}` } },
  );
  return data.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase auth state changes (handles token refresh, page reload, etc.)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          // Sync with backend to get the Postgres profile
          const profile = await syncUserWithBackend(fbUser);
          setUser(profile);
          localStorage.setItem('rc_user', JSON.stringify(profile));
        } catch {
          // User exists in Firebase but not synced to backend yet — clear state
          setUser(null);
          localStorage.removeItem('rc_user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('rc_user');
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Email / Password Login ──────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await syncUserWithBackend(cred.user);
    setUser(profile);
    localStorage.setItem('rc_user', JSON.stringify(profile));
  };

  // ── Email / Password Registration ───────────────────────────────────────
  const register = async (formData: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'tenant' | 'landlord';
  }) => {
    const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

    // Set the display name in Firebase
    await updateProfile(cred.user, { displayName: formData.full_name });

    // Send email verification
    await sendEmailVerification(cred.user);

    // Sync with backend
    const profile = await syncUserWithBackend(cred.user, {
      full_name: formData.full_name,
      phone: formData.phone,
      role: formData.role,
    });

    setUser(profile);
    localStorage.setItem('rc_user', JSON.stringify(profile));
  };

  // ── Google Sign-In ──────────────────────────────────────────────────────
  const signInWithGoogleFn = async (role?: 'tenant' | 'landlord') => {
    const cred = await signInWithPopup(auth, googleProvider);
    const profile = await syncUserWithBackend(cred.user, { role });
    setUser(profile);
    localStorage.setItem('rc_user', JSON.stringify(profile));
  };

  // ── Password Reset ─────────────────────────────────────────────────────
  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = () => {
    signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('rc_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        signInWithGoogle: signInWithGoogleFn,
        sendPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};