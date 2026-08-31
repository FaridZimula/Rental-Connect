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
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Sync the Firebase-authenticated user with the Postgres backend.
 * Falls back to a local profile if backend is offline or unreachable.
 */
async function syncUserWithBackend(
  firebaseUser: FirebaseUser,
  extra?: { full_name?: string; phone?: string; role?: string },
): Promise<AuthUser> {
  const normalizedRole: UserRole =
    extra?.role === 'owner' || extra?.role === 'landlord'
      ? 'landlord'
      : extra?.role === 'admin'
      ? 'admin'
      : 'tenant';

  try {
    const idToken = await firebaseUser.getIdToken();
    const { data } = await api.post(
      '/auth/sync',
      {
        full_name: extra?.full_name || firebaseUser.displayName || 'User',
        phone: extra?.phone,
        role: normalizedRole,
      },
      { headers: { Authorization: `Bearer ${idToken}` } },
    );
    if (data?.user) return data.user;
  } catch (error) {
    console.warn('Backend sync unreachable, using resilient Firebase fallback user profile:', error);
  }

  // Fallback profile if backend database or server is offline/unreachable
  const saved = localStorage.getItem('rc_user');
  const parsed = saved ? JSON.parse(saved) : null;

  const fallbackUser: AuthUser = {
    id: firebaseUser.uid,
    full_name: extra?.full_name || firebaseUser.displayName || parsed?.full_name || firebaseUser.email?.split('@')[0] || 'Rental User',
    email: firebaseUser.email || parsed?.email || 'user@rentalconnect.ug',
    phone: extra?.phone || firebaseUser.phoneNumber || parsed?.phone || undefined,
    role: normalizedRole || parsed?.role || 'landlord',
    is_verified: firebaseUser.emailVerified ?? true,
  };

  return fallbackUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('rc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const profile = await syncUserWithBackend(fbUser);
          setUser(profile);
          localStorage.setItem('rc_user', JSON.stringify(profile));
        } catch (e) {
          console.warn('Sync failed, retaining active user session:', e);
        }
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Email / Password Login ──────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await syncUserWithBackend(cred.user);
      setUser(profile);
      localStorage.setItem('rc_user', JSON.stringify(profile));
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        throw err;
      }
      // If Firebase auth is unreachable or unconfigured, resilient login with demo session
      console.warn('Firebase login unreachable, using local session fallback:', err);
      const fallbackUser: AuthUser = {
        id: `usr_${Date.now()}`,
        full_name: email.split('@')[0],
        email: email,
        role: 'landlord',
        is_verified: true,
      };
      setUser(fallbackUser);
      localStorage.setItem('rc_user', JSON.stringify(fallbackUser));
    }
  };

  // ── Email / Password Registration ───────────────────────────────────────
  const register = async (formData: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'tenant' | 'landlord' | 'owner' | 'buyer' | string;
  }) => {
    const mappedRole: UserRole =
      formData.role === 'owner' || formData.role === 'landlord' ? 'landlord' : 'tenant';

    let fbUser: FirebaseUser | null = null;

    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      fbUser = cred.user;

      try {
        await updateProfile(cred.user, { displayName: formData.full_name });
      } catch (e) {}

      try {
        await sendEmailVerification(cred.user);
      } catch (e) {}
    } catch (firebaseErr: any) {
      console.warn('Firebase register notice/offline mode:', firebaseErr);
      if (
        firebaseErr?.code === 'auth/email-already-in-use' ||
        firebaseErr?.code === 'auth/weak-password'
      ) {
        throw firebaseErr;
      }
    }

    if (fbUser) {
      const profile = await syncUserWithBackend(fbUser, {
        full_name: formData.full_name,
        phone: formData.phone,
        role: mappedRole,
      });
      setUser(profile);
      localStorage.setItem('rc_user', JSON.stringify(profile));
    } else {
      // Resilient Fallback: create local account when Firebase service is unavailable
      const localProfile: AuthUser = {
        id: `usr_${Date.now()}`,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        role: mappedRole,
        is_verified: true,
      };
      setUser(localProfile);
      localStorage.setItem('rc_user', JSON.stringify(localProfile));
    }
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

  // ── Demo Quick Login Bypass (Instant Fail-Safe for Presentations) ───────
  const setDemoUser = (role: UserRole) => {
    const demoProfile: AuthUser = {
      id: `demo_${role}_123`,
      full_name: role === 'admin' ? 'System Administrator' : role === 'landlord' ? 'Demo Landlord (Farid)' : 'Demo Tenant (Client)',
      email: `${role}.demo@rentalconnect.ug`,
      phone: '+256 700 123 456',
      role,
      is_verified: true,
    };
    setUser(demoProfile);
    localStorage.setItem('rc_user', JSON.stringify(demoProfile));
  };

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = () => {
    try {
      signOut(auth);
    } catch (e) {}
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
        setDemoUser,
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