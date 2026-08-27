import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Building, UserCheck, Check, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  auth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from '../lib/firebase';
import type { ConfirmationResult } from 'firebase/auth';

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: '', color: '', width: '0%' };
  if (pw.length < 6) return { label: 'Weak', color: '#ef4444', width: '25%' };
  if (pw.length < 8) return { label: 'Fair', color: '#f59e0b', width: '50%' };
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && pw.length >= 8)
    return { label: 'Strong', color: '#22c55e', width: '100%' };
  return { label: 'Good', color: '#f06023', width: '75%' };
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const { register, signInWithGoogle } = useAuth();
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

  const pwStrength = getPasswordStrength(password);

  const navigateByRole = (selectedRole: string) => {
    if (selectedRole === 'landlord') navigate('/dashboard/landlord');
    else navigate('/dashboard/tenant');
  };

  // ── Google Sign Up ──────────────────────────────────────────────────────
  const handleGoogleSignUp = async () => {
    if (!agreeTerms) {
      setError('Please accept the Terms of Service before continuing.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle(role);
      navigateByRole(role);
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Phone OTP: Send Code ───────────────────────────────────────────────
  const handleSendPhoneOtp = async () => {
    if (!phone.trim()) {
      setError('Please enter a phone number to verify.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const recaptchaVerifier = getOrCreateRecaptchaVerifier();
      const result = await signInWithPhoneNumber(auth, phone.trim(), recaptchaVerifier);
      confirmationResultRef.current = result;
      setOtpSent(true);
      setInfoMessage(`Verification code sent to ${phone}`);
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
      } else {
        setError(err.message || 'Failed to send OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Email Registration ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
      });
      setInfoMessage('Account created! A verification email has been sent to your inbox.');
      navigateByRole(role);
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 8 characters.');
      } else {
        setError(err.message || 'Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
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
          {/* Header */}
          <div className="text-center mb-6">
            <div className="h-14 w-14 rounded-full border-2 border-[#f06023] bg-[#f06023] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Create an Account</h1>
            <p className="text-xs text-zinc-500 mt-1">Join Rental Connect — Uganda's #1 Digital Rental Platform</p>
          </div>

          {/* Google Sign-Up */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full bg-white hover:bg-zinc-50 text-zinc-700 font-bold py-3 px-4 rounded-xl border border-zinc-300 shadow-sm transition-all duration-200 flex items-center justify-center gap-3 text-xs mb-5 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-zinc-400 absolute">or register with email</span>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => setRole('tenant')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'tenant' ? 'bg-white text-[#f06023] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <UserCheck className="h-4 w-4" /> Tenant / Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('landlord')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'landlord' ? 'bg-white text-[#f06023] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Building className="h-4 w-4" /> Landlord / Broker
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  placeholder="e.g. John Mukasa"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Phone with OTP verification */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Phone Number
                <span className="ml-1.5 text-zinc-400 font-normal">(for SMS OTP verification)</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <input
                    type="tel"
                    className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                    placeholder="+256 700 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendPhoneOtp}
                  disabled={loading || otpSent}
                  className={`shrink-0 text-xs font-bold px-3 py-2.5 rounded-xl border transition-all ${
                    otpSent
                      ? 'bg-green-50 border-green-300 text-green-600'
                      : 'bg-white border-[#f06023] text-[#f06023] hover:bg-orange-50'
                  }`}
                >
                  {otpSent ? <Check className="h-4 w-4" /> : 'Verify'}
                </button>
              </div>

              {/* OTP Code Input */}
              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2"
                >
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-2.5 border border-green-300 rounded-xl text-sm focus:outline-none focus:border-green-500 tracking-widest font-bold text-center"
                      placeholder="Enter 6-digit SMS code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Password with strength meter */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  placeholder="At least 8 characters"
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
              {/* Password strength bar */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                  <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: pwStrength.width }}
                      transition={{ duration: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: pwStrength.color }}
                    />
                  </div>
                  <p className="text-[10px] font-bold mt-1" style={{ color: pwStrength.color }}>
                    {pwStrength.label} password
                  </p>
                </motion.div>
              )}
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#f06023] focus:ring-[#f06023]"
              />
              <span className="text-[11px] text-zinc-500 leading-relaxed">
                I agree to Rental Connect's{' '}
                <a href="#" className="text-[#f06023] font-bold hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#f06023] font-bold hover:underline">Privacy Policy</a>
              </span>
            </label>

            <Button variant="primary" fullWidth size="lg" type="submit" disabled={loading || !agreeTerms}>
              {loading ? 'Creating Account...' : `Register as ${role === 'tenant' ? 'Tenant' : 'Landlord'}`}
            </Button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#f06023] font-bold hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>

        {/* Invisible reCAPTCHA container for phone auth */}
        <div ref={recaptchaContainerRef} id="recaptcha-container-register" />
      </div>
    </Layout>
  );
}
