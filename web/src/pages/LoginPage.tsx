import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email.trim(), password);
      // Redirect based on stored or fetched role
      const stored = localStorage.getItem('rc_user');
      const parsed = stored ? JSON.parse(stored) : null;
      const role = parsed?.role || user?.role;

      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'landlord') navigate('/dashboard/landlord');
      else navigate('/dashboard/tenant');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
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
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-2xl bg-[#f06023]/10 text-[#f06023] flex items-center justify-center mx-auto mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Welcome Back</h1>
            <p className="text-xs text-zinc-500 mt-1">Sign in to your Digital Rental Account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-xl text-sm focus:outline-none focus:border-[#f06023]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button variant="primary" fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Log In'}
            </Button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#f06023] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
