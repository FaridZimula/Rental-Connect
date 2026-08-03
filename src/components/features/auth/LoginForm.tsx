import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'owner') {
        navigate('/hostel-owner', { replace: true });
      } else if (user.role === 'broker') {
        navigate('/hostel-broker', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      let userRole: 'owner' | 'broker' | 'student' = 'student';
      if (location.pathname.includes('/hostel-owner')) {
        userRole = 'owner';
      } else if (location.pathname.includes('/hostel-broker')) {
        userRole = 'broker';
      }

      await login(email, password, userRole);
      // Navigation is now handled by the useEffect hook
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full mb-4 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">
          {location.pathname === '/hostel-owner/login' ? 'Owner Login' : 'Login'}
        </h2>
        <p className="text-zinc-400 mt-2 text-sm">
          {location.pathname === '/hostel-owner/login'
            ? 'Sign in to your hostel owner account'
            : 'Sign in to your account'}
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-zinc-300 text-sm font-medium mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-orange-500" />
            </div>
            <input
              id="email"
              type="email"
              className="pl-10 w-full p-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-zinc-300 text-sm font-medium">
              Password
            </label>
            {location.pathname !== '/hostel-owner/login' && (
              <a href="#" className="text-sm text-orange-500 hover:text-orange-400 transition-colors">
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-orange-500" />
            </div>
            <input
              id="password"
              type="password"
              className="pl-10 w-full p-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
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
          icon={<ArrowRight className="h-5 w-5 text-black" />}
          iconPosition="right"
          disabled={isLoading}
          className="mb-4"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
        
        {location.pathname !== '/hostel-owner/login' && (
          <p className="text-center text-zinc-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        )}
        {location.pathname === '/hostel-owner/login' && (
          <p className="text-center text-zinc-400 text-sm mt-6">
            Don't have an owner account?{' '}
            <Link to="/hostel-owner/signup" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
              Sign up as owner
            </Link>
          </p>
        )}
      </form>
    </motion.div>
  );
};

export default LoginForm;