import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Building, UserCheck } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (role === 'landlord') navigate('/dashboard/landlord');
      else navigate('/dashboard/tenant');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
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
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-zinc-900">Create an Account</h1>
            <p className="text-xs text-zinc-500 mt-1">Join Digital Rental Properties Management System</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setRole('tenant')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'tenant'
                  ? 'bg-white text-[#f06023] shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <UserCheck className="h-4 w-4" /> Tenant / Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('landlord')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'landlord'
                  ? 'bg-white text-[#f06023] shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

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

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <input
                  type="tel"
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  placeholder="+256 700 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-2.5 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button variant="primary" fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : `Register as ${role === 'tenant' ? 'Tenant' : 'Landlord'}`}
            </Button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-6">
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
