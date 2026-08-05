import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';

export type UserRole = 'buyer' | 'owner' | 'admin';

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profile_image?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'buyer' | 'owner';
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rc_token');
    const stored = localStorage.getItem('rc_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('rc_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('rc_token', data.access_token);
    localStorage.setItem('rc_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (formData: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'buyer' | 'owner';
  }) => {
    const data = await authApi.register(formData);
    localStorage.setItem('rc_token', data.access_token);
    localStorage.setItem('rc_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('rc_token');
    localStorage.removeItem('rc_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
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