import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Phone, LockKeyhole, Check, Eye, EyeOff, Sparkles, User, ShieldCheck, X, KeyRound } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth, UserRole } from '../contexts/AuthContext';
import {
  auth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from '../lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Password Reset Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetModalError, setResetModalError] = useState('');

  const { login, sendPasswordReset, user, isAuthenticated, setDemoUser } = useAuth();
  const navigate = useNavigate();

  // Automatically redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/dashboard/admin', { replace: true });
      else if (user.role === 'landlord') navigate('/dashboard/landlord', { replace: true });
      else navigate('/dashboard/tenant', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Firebase phone auth references
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const getOrCreateRecaptchaVerifier = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }
    if (recaptchaContainerRef.current) {
      recaptchaContainerRef.current.innerHTML = '';
    }
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
      size: 'invisible',
      callback: () => {},
    });
    recaptchaVerifierRef.current = verifier;
    return verifier;
  };

  const navigateByRole = (role?: string) => {
    if (role === 'admin') navigate('/dashboard/admin');
    else if (role === 'landlord') navigate('/dashboard/landlord');
    else navigate('/dashboard/tenant');
  };

  // ── Quick Demo Login Bypass for Presentations ───────────────────────────
  const handleQuickDemoLogin = (role: UserRole) => {
    setDemoUser(role);
    navigateByRole(role);
  };

  // ── Email Login ─────────────────────────────────────────────────────────
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfoMessage('');

    try {
      await login(email.trim(), password);
      const stored = localStorage.getItem('rc_user');
      const parsed = stored ? JSON.parse(stored) : null;
      const role = parsed?.role || user?.role || 'landlord';
      navigateByRole(role);
    } catch (err: any) {
      console.error('Login error details:', err);
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please verify your credentials or click "Forgot password?".');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again in 5 minutes or use Quick Demo login below.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. If using a new account, check your email inbox for verification.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phone OTP: Send Code ───────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter a valid phone number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const recaptchaVerifier = getOrCreateRecaptchaVerifier();
      const result = await signInWithPhoneNumber(auth, phone.trim(), recaptchaVerifier);
      confirmationResultRef.current = result;
      setOtpSent(true);
      setInfoMessage(`Verification code sent via SMS to ${phone}`);
    } catch (err: any) {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
      if (recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = '';
      }
      if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Use: +256 700 000 000');
      } else if (err.code === 'auth/too-many-requests') {
        setError('SMS limit reached for this number. Use Email Login or Demo Access below.');
      } else {
        setError(err.message || 'Failed to send SMS code.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phone OTP: Verify Code ─────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setError('Please enter the verification code sent to your phone.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      if (!confirmationResultRef.current) {
        setError('Session expired. Please request a new code.');
        setOtpSent(false);
        setLoading(false);
        return;
      }
      await confirmationResultRef.current.confirm(otpCode);
      const stored = localStorage.getItem('rc_user');
      const parsed = stored ? JSON.parse(stored) : null;
      navigateByRole(parsed?.role || 'tenant');
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please check your SMS and try again.');
      } else {
        setError(err.message || 'Verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password Modal Trigger & Reset Handler ──────────────────────
  const handleForgotPassword = () => {
    setResetEmail(email.trim());
    setResetModalError('');
    setShowResetModal(true);
    // Also trigger Firebase reset email attempt silently in background if email provided
    if (email.trim()) {
      sendPasswordReset(email.trim()).catch(() => {});
    }
  };

  const handleInstantPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim();
    if (!cleanEmail) {
      setResetModalError('Please enter your email address.');
      return;
    }
    if (newPassword.length < 6) {
      setResetModalError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetModalError('Passwords do not match.');
      return;
    }

    // Persist updated credentials locally
    const saved = localStorage.getItem('rc_user');
    const parsed = saved ? JSON.parse(saved) : null;
    const userRole: UserRole = parsed?.role || 'landlord';
    const updatedUser = {
      ...(parsed || {}),
      email: cleanEmail,
      id: parsed?.id || `usr_${Date.now()}`,
      full_name: parsed?.full_name || cleanEmail.split('@')[0],
      role: userRole,
      is_verified: true,
    };
    localStorage.setItem('rc_user', JSON.stringify(updatedUser));
    localStorage.setItem(`rc_pwd_${cleanEmail.toLowerCase()}`, newPassword);

    // Auto-login session immediately
    setEmail(cleanEmail);
    setPassword(newPassword);
    setShowResetModal(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setResetModalError('');

    try {
      await login(cleanEmail, newPassword);
      navigateByRole(userRole);
    } catch (e) {
      setInfoMessage(`Password for ${cleanEmail} updated! Click "Log In to Account" below.`);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="h-14 w-14 rounded-full border-2 border-[#f06023] bg-[#f06023] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <LockKeyhole className="h-6 w-6 text-white stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Welcome Back</h1>
            <p className="text-xs text-zinc-500 mt-1">Sign in to your Rental Connect account</p>
          </div>

          {/* Auth Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setError(''); setInfoMessage(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'email' ? 'bg-white text-[#f06023] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email Address
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setError(''); setInfoMessage(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'phone' ? 'bg-white text-[#f06023] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Phone className="h-3.5 w-3.5" /> Phone SMS OTP
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 font-medium leading-relaxed">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="bg-orange-50 border border-orange-200 text-[#f06023] text-xs p-3 rounded-xl mb-4 font-medium flex items-start gap-2 leading-relaxed">
              <Check className="h-4 w-4 text-[#f06023] flex-shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Email Login Form */}
          {authMethod === 'email' ? (
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] text-zinc-900 bg-white"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-zinc-700">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-bold text-[#f06023] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] text-zinc-900 bg-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-[#f06023] focus:ring-[#f06023]"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              <Button variant="primary" fullWidth size="lg" type="submit" disabled={loading}>
                {loading ? 'Signing In...' : 'Log In to Account'}
              </Button>
            </form>
          ) : (
            /* Phone SMS OTP Login Form */
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Mobile Phone Number (MTN / Airtel)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                      <input
                        type="tel"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023] text-zinc-900 bg-white"
                        placeholder="+256 700 000 000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="primary" fullWidth size="lg" type="submit" disabled={loading}>
                    {loading ? 'Sending SMS Code...' : 'Send SMS Verification Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Enter 6-Digit SMS Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      className="w-full text-center tracking-widest text-lg font-bold py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-[#f06023] text-zinc-900 bg-white"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                  </div>
                  <Button variant="primary" fullWidth size="lg" type="submit" disabled={loading}>
                    {loading ? 'Verifying OTP...' : 'Verify Code & Sign In'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-center text-xs font-bold text-zinc-500 hover:text-zinc-800 pt-2 cursor-pointer"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Presentation Fail-Safe: Instant Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 mb-2.5 justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[#f06023]" />
              <span>Quick Presentation Demo Access (Instant Login)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('landlord')}
                className="py-2 px-2 bg-orange-50 hover:bg-orange-100 text-[#f06023] rounded-xl text-[11px] font-bold transition-all border border-orange-200 flex items-center justify-center gap-1 cursor-pointer"
                title="Instant Landlord Login"
              >
                <User className="h-3.5 w-3.5" /> Landlord
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('tenant')}
                className="py-2 px-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-[11px] font-bold transition-all border border-zinc-200 flex items-center justify-center gap-1 cursor-pointer"
                title="Instant Tenant Login"
              >
                <User className="h-3.5 w-3.5" /> Tenant
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="py-2 px-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Instant Admin Login"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#f06023] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>

        {/* Invisible reCAPTCHA container for phone auth */}
        <div ref={recaptchaContainerRef} id="recaptcha-container" />
      </div>

      {/* ── Instant Password Reset Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-200 relative"
            >
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-full border-2 border-[#f06023] bg-[#f06023] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <KeyRound className="h-6 w-6 text-white stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Reset Account Password</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Set a new password instantly for your account
                </p>
              </div>

              {resetModalError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 font-medium">
                  {resetModalError}
                </div>
              )}

              <form onSubmit={handleInstantPasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                      placeholder="user@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => setShowResetModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
