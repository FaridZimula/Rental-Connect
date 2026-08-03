import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const BrokerLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginBroker } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Fixed credentials check
      if (username === 'broker' && password === 'broker123') {
        await loginBroker(password);
        navigate('/hostel-broker');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-xl max-w-md w-full my-auto text-zinc-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-[#f06023]/10 border border-[#f06023]/30 text-[#f06023] rounded-full mb-4 shadow-sm">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-zinc-900">Broker Login</h2>
          <p className="text-zinc-600 mt-2 text-sm">Enter your credentials to access the Rental Connect broker portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-zinc-700 text-sm font-semibold mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#f06023]" />
              </div>
              <input
                id="username"
                type="text"
                className="pl-10 w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl focus:outline-none focus:border-[#f06023] focus:bg-white transition-colors"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-zinc-700 text-sm font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#f06023]" />
              </div>
              <input
                id="password"
                type="password"
                className="pl-10 w-full p-3 bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 rounded-xl focus:outline-none focus:border-[#f06023] focus:bg-white transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            size="lg"
            icon={<ArrowRight className="h-5 w-5 text-white" />}
            iconPosition="right"
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? 'Signing in...' : 'Sign in to Broker Portal'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default BrokerLoginPage;
