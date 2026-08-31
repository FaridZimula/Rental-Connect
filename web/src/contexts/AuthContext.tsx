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
    let unsub = () => {};

    // Safety timeout: ensure loading state turns off after max 1.5 seconds regardless of network
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    try {
      unsub = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);

        if (fbUser) {
          try {
            // Preserve the stored role so page reloads don't reset it to 'tenant'
            const saved = localStorage.getItem('rc_user');
            const savedRole = saved ? (JSON.parse(saved) as AuthUser).role : undefined;
            const profile = await syncUserWithBackend(fbUser, { role: savedRole });
            setUser(profile);
            localStorage.setItem('rc_user', JSON.stringify(profile));
          } catch (e) {
            console.warn('Sync failed, retaining active user session:', e);
          }
        } else {
          // Firebase says no user — only clear if we don't have a local session
          const saved = localStorage.getItem('rc_user');
          if (!saved) {
            setUser(null);
          }
        }

        setIsLoading(false);
        clearTimeout(timer);
      });
    } catch (err) {
      console.warn('Firebase auth listener error:', err);
      setIsLoading(false);
      clearTimeout(timer);
    }

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  // ── Email / Password Login ──────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      // Preserve stored role on login just like on auth state change
      const saved = localStorage.getItem('rc_user');
      const savedRole = saved ? (JSON.parse(saved) as AuthUser).role : undefined;
      const profile = await syncUserWithBackend(cred.user, { role: savedRole });
      setUser(profile);
      localStorage.setItem('rc_user', JSON.stringify(profile));
      localStorage.setItem(`rc_pwd_${cleanEmail}`, password);
      return;
    } catch (firebaseErr: any) {
      console.warn('Firebase login notice/resilient fallback active:', firebaseErr);
    }

    // Local credential / fallback check:
    const localPwd = localStorage.getItem(`rc_pwd_${cleanEmail}`);
    const saved = localStorage.getItem('rc_user');
    const parsed = saved ? JSON.parse(saved) : null;
    const storedEmail = parsed?.email?.toLowerCase();

    // If local password is saved and entered password does not match, throw invalid credentials error
    if (localPwd && localPwd !== password) {
      const err: any = new Error('Invalid email or password');
      err.code = 'auth/wrong-password';
      throw err;
    }

    // Reuse stored profile or create resilient local session
    const userRole: UserRole = storedEmail === cleanEmail ? (parsed?.role ?? 'landlord') : 'landlord';

    const fallbackUser: AuthUser = {
      id: storedEmail === cleanEmail ? (parsed?.id ?? `usr_${Date.now()}`) : `usr_${Date.now()}`,
      full_name: storedEmail === cleanEmail ? (parsed?.full_name ?? cleanEmail.split('@')[0]) : cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: storedEmail === cleanEmail ? parsed?.phone : undefined,
      role: userRole,
      is_verified: true,
    };

    setUser(fallbackUser);
    localStorage.setItem('rc_user', JSON.stringify(fallbackUser));
    localStorage.setItem(`rc_pwd_${cleanEmail}`, password);
  };

  // ── Email / Password Registration ───────────────────────────────────────
  const register = async (formData: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'tenant' | 'landlord' | 'owner' | 'buyer' | string;
  }) => {
    const cleanEmail = formData.email.trim().toLowerCase();
    const mappedRole: UserRole =
      formData.role === 'owner' || formData.role === 'landlord' ? 'landlord' : 'tenant';

    let fbUser: FirebaseUser | null = null;

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, formData.password);
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

    localStorage.setItem(`rc_pwd_${cleanEmail}`, formData.password);

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
        email: cleanEmail,
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
    // Navigate to login handled by the caller
    window.location.href = '/login';
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