import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signInWithGoogle, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Check if email is in authorized admin list
    const authorizedAdminsStr = localStorage.getItem('rc_authorized_admins');
    const defaultAdmins = [
      'faridzimula602@gmail.com',
      'mukiibirhines2001@gmail.com',
      'robtxpro002@gmail.com',
      'mukiibirobert002@gmail.com',
      'admin.demo@rentalconnect.ug',
    ];
    const customAdmins = authorizedAdminsStr ? JSON.parse(authorizedAdminsStr) : [];
    const allAuthorizedAdmins = [...defaultAdmins, ...customAdmins].map((a) => a.toLowerCase());

    if (!allAuthorizedAdmins.includes(cleanEmail)) {
      setError(`Access Denied: "${cleanEmail}" is not authorized for system administrator access.`);
      setLoading(false);
      return;
    }

    try {
      await login(cleanEmail, password);
      navigate('/dashboard/admin', { replace: true });
    } catch (err: any) {
      console.error('Admin Login error:', err);
      setError(err.message || 'Invalid admin credentials or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle('admin', true);
      navigate('/dashboard/admin', { replace: true });
    } catch (err: any) {
      console.error('Google Admin Login error:', err);
      setError(err.message || 'Google authentication failed or unauthorized admin email.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-zinc-950 min-h-screen pt-28 pb-16 text-white flex items-center justify-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#f06023]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-md relative z-10">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-[#f06023]/10 border border-[#f06023]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#f06023] shadow-inner">
                <Shield className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Portal Access</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Restricted to authorized Rental Connect system administrators.
              </p>
            </div>

            {error && (
              <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3.5 rounded-xl mb-5 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Admin Login */}
            <button
              type="button"
              onClick={handleAdminGoogleLogin}
              disabled={googleLoading}
              className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-3 shadow-sm active:scale-98 cursor-pointer mb-5"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29B9.77 8.99 12 5.28 12 12s2.23 7.01 6.71 10.42l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{googleLoading ? 'Authenticating Admin...' : 'Sign In with Google Account'}</span>
            </button>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-zinc-900 px-3 text-[10px] uppercase font-bold text-zinc-500 shrink-0">
                Or Admin Email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleAdminEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Authorized Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="faridzimula602@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#f06023]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#f06023]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Verifying Admin Permissions...' : 'Access Admin Panel'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
              <Link to="/login" className="text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1 font-semibold">
                Go to Standard User Login <ArrowRight className="h-3.5 w-3.5 text-[#f06023]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
