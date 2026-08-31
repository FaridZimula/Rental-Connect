import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Building, UserCheck, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth, UserRole } from '../contexts/AuthContext';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, user, isAuthenticated, setDemoUser } = useAuth();
  const navigate = useNavigate();

  // Automatically redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/dashboard/admin', { replace: true });
      else if (user.role === 'landlord') navigate('/dashboard/landlord', { replace: true });
      else navigate('/dashboard/tenant', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleQuickDemo = (selectedRole: UserRole) => {
    setDemoUser(selectedRole);
    navigateByRole(selectedRole);
  };

  const pwStrength = getPasswordStrength(password);

  const navigateByRole = (selectedRole: string) => {
    if (selectedRole === 'landlord') navigate('/dashboard/landlord');
    else navigate('/dashboard/tenant');
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

    // Normalize Ugandan phone: 07X... → +2567X...
    const normalizePhone = (num: string) => {
      const cleaned = num.replace(/\s+/g, '').trim();
      if (cleaned.startsWith('0') && cleaned.length === 10) {
        return '+256' + cleaned.slice(1);
      }
      return cleaned;
    };

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() ? normalizePhone(phone) : undefined,
        password,
        role,
      });
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

            {/* Phone Number (simple input, no OTP) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Phone Number
                <span className="ml-1.5 text-zinc-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <input
                  type="tel"
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  placeholder="0700 000 000 or +256 700 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 ml-1">You can use local format (0700...) or international (+256...)</p>
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

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 mb-2.5 justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[#f06023]" />
              <span>Quick Presentation Demo Access (Instant Registration)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('landlord')}
                className="py-2 px-2 bg-orange-50 hover:bg-orange-100 text-[#f06023] rounded-xl text-[11px] font-bold transition-all border border-orange-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                <User className="h-3.5 w-3.5" /> Landlord
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('tenant')}
                className="py-2 px-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-[11px] font-bold transition-all border border-zinc-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                <User className="h-3.5 w-3.5" /> Tenant
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="py-2 px-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#f06023] font-bold hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
