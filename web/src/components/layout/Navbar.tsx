import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Building, Home, User, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'landlord') return '/dashboard/landlord';
    return '/dashboard/tenant';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm py-2 sm:py-3 text-zinc-900">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo & Brand Name */}
          <NavLink to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#f06023] p-0.5 shadow-[0_0_15px_rgba(240,96,35,0.3)]">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <span className="text-[#f06023] font-black text-xl tracking-tighter">DR</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-display font-extrabold tracking-tight text-zinc-900 group-hover:text-[#f06023] transition-colors leading-none">
                Digital<span className="text-[#f06023]">Rentals</span>
              </span>
              <span className="text-[10px] font-medium text-zinc-400 tracking-wider uppercase">Property Management</span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                clsx(
                  'text-sm font-medium transition-colors hover:text-[#f06023]',
                  isActive ? 'text-[#f06023] font-semibold' : 'text-zinc-700'
                )
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/properties"
              className={({ isActive }) =>
                clsx(
                  'text-sm font-medium transition-colors hover:text-[#f06023]',
                  isActive ? 'text-[#f06023] font-semibold' : 'text-zinc-700'
                )
              }
            >
              Browse Properties
            </NavLink>

            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-zinc-100 rounded-full px-3 py-1.5 border border-zinc-200 focus-within:border-[#f06023] focus-within:bg-white w-48 lg:w-60 transition-all">
              <Search className="h-4 w-4 text-zinc-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search area or title..."
                className="bg-transparent border-none focus:outline-none w-full text-xs text-zinc-900 placeholder-zinc-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>

            {/* Auth / Dashboard Controls */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <NavLink
                  to={getDashboardPath()}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <User className="h-4 w-4 text-[#f06023]" />
                  Dashboard ({user.role})
                </NavLink>
                <button
                  onClick={logout}
                  className="p-2 text-zinc-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <NavLink
                  to="/login"
                  className="text-xs font-semibold text-zinc-700 hover:text-[#f06023] px-3 py-2 transition-colors"
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-[#f06023] hover:bg-[#d94b12] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-zinc-700 p-2 hover:bg-zinc-100 rounded-lg transition-colors ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white shadow-xl border-t border-zinc-200"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <NavLink
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm font-medium"
              >
                <Home className="h-4 w-4 mr-2 text-[#f06023]" />
                Home
              </NavLink>
              <NavLink
                to="/properties"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm font-medium"
              >
                <Building className="h-4 w-4 mr-2 text-[#f06023]" />
                Browse Properties
              </NavLink>
              {isAuthenticated && user ? (
                <>
                  <NavLink
                    to={getDashboardPath()}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center py-2 px-3 bg-zinc-100 rounded-lg text-zinc-800 text-sm font-semibold"
                  >
                    <User className="h-4 w-4 mr-2 text-[#f06023]" />
                    Dashboard ({user.role})
                  </NavLink>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center py-2 px-3 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </button>
                </>
              ) : (
                <div className="pt-2 flex flex-col gap-2">
                  <NavLink
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center py-2 text-zinc-700 border border-zinc-300 rounded-xl font-medium text-sm"
                  >
                    Log In
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center py-2 bg-[#f06023] text-white rounded-xl font-semibold text-sm shadow-md"
                  >
                    Register Account
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;