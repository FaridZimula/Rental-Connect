import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Phone, LockKeyhole, Check, Eye, EyeOff } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
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

  const { login, signInWithGoogle, sendPasswordReset, user } = useAuth();
  const navigate = useNavigate();

  // Firebase phone auth references
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const getOrCreateRecaptchaVerifier = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (e) {
        // ignore if already cleared
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

  // ── Google Login ────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      const stored = localStorage.getItem('rc_user');
      const parsed = stored ? JSON.parse(stored) : null;
      navigateByRole(parsed?.role);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Email Login ─────────────────────────────────────────────────────────
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email.trim(), password);
      const stored = localStorage.getItem('rc_user');
      const parsed = stored ? JSON.parse(stored) : null;
      const role = parsed?.role || user?.role;
      navigateByRole(role);
    } catch (err: any) {
      // Firebase error codes → friendly messages
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
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
        setError('Invalid phone number. Use format: +256 700 000 000');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait before trying again.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phone OTP: Verify Code ─────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setError('Please enter the 6-digit code sent to your phone.');
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
      // onAuthStateChanged in AuthContext will sync the user
      const stored = localStorage.getItem('rc_user');
      const parsed = stored ? JSON.parse(stored) : null;
      navigateByRole(parsed?.role);
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please check and try again.');
      } else {
        setError(err.message || 'Verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address above to receive a password reset link.');
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      setInfoMessage(`Password reset link sent to ${email}`);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
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

          {/* Social Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-zinc-50 text-zinc-700 font-bold py-3 px-4 rounded-xl border border-zinc-300 shadow-sm transition-all duration-200 flex items-center justify-center gap-3 text-xs mb-5 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-zinc-400 absolute">or sign in with</span>
          </div>

          {/* Auth Method Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setError(''); setInfoMessage(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'email' ? 'bg-white text-[#f06023] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Mail className="h-3.5 w-3.5" /> Email Address
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('phone'); setError(''); setInfoMessage(''); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'phone' ? 'bg-white text-[#f06023] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Phone className="h-3.5 w-3.5" /> Phone SMS OTP
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 font-medium">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="bg-orange-50 border border-orange-200 text-[#f06023] text-xs p-3 rounded-xl mb-4 font-medium flex items-center gap-2">
              <Check className="h-4 w-4 text-[#f06023] flex-shrink-0" />
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
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
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
                    className="text-[11px] font-bold text-[#f06023] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
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
                        className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
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
                      className="w-full text-center tracking-widest text-lg font-bold py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:border-[#f06023]"
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
                    className="w-full text-center text-xs font-bold text-zinc-500 hover:text-zinc-800 pt-2"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-xs text-zinc-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#f06023] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>

        {/* Invisible reCAPTCHA container for phone auth */}
        <div ref={recaptchaContainerRef} id="recaptcha-container" />
      </div>
    </Layout>
  );
}
