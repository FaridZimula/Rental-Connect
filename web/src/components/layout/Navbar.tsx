import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Menu, X, Building, Home, User, LogOut, ChevronDown
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faCarSide, 
  faHardHat, 
  faMusic, 
  faSeedling, 
  faHeartPulse, 
  faShirt, 
  faLaptopCode, 
  faCampground
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const categories = [
  { id: 'apartment', label: 'Housing & Real Estate', faIcon: faBuilding },
  { id: 'vehicle', label: 'Vehicles & Transport', faIcon: faCarSide },
  { id: 'machinery', label: 'Construction Machinery', faIcon: faHardHat },
  { id: 'event_equipment', label: 'Event & Media Gear', faIcon: faMusic },
  { id: 'agro_machinery', label: 'Agro & Land Assets', faIcon: faSeedling },
  { id: 'medical_equipment', label: 'Medical & Health Tech', faIcon: faHeartPulse },
  { id: 'fashion_attire', label: 'Fashion & Formal Wear', faIcon: faShirt },
  { id: 'it_hardware', label: 'IT & Computing Tech', faIcon: faLaptopCode },
  { id: 'camping_sports', label: 'Camping & Sports Gear', faIcon: faCampground },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isOwnerOrAdminPage =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/dashboard/landlord') ||
    location.pathname.startsWith('/dashboard/admin') ||
    ((user?.role === 'landlord' || user?.role === 'admin') && location.pathname.startsWith('/dashboard'));

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
          {/* Brand Logo Image */}
          <NavLink to="/" className="flex items-center flex-shrink-0 group">
            <img
              src="/images/RENTAL CONNECT DARK.png"
              alt="Rental Connect"
              className="h-[52px] w-auto object-contain transition-transform group-hover:scale-105"
            />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isOwnerOrAdminPage && (
              <>
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
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    clsx(
                      'text-sm font-medium transition-colors hover:text-[#f06023]',
                      isActive ? 'text-[#f06023] font-semibold' : 'text-zinc-700'
                    )
                  }
                >
                  Contact Us
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
              </>
            )}

            {/* Auth / Dashboard Controls */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <NavLink
                  to={getDashboardPath()}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 capitalize"
                >
                  <User className="h-4 w-4 text-[#f06023]" />
                  Dashboard ({user.role === 'landlord' ? 'property owner' : user.role})
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
            className="md:hidden bg-white shadow-xl border-t border-zinc-200 max-h-[85vh] overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              {!isOwnerOrAdminPage && (
                <>
                  <NavLink
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm font-medium"
                  >
                    <Home className="h-4 w-4 mr-2 text-[#f06023]" />
                    Home
                  </NavLink>

                  {/* Mobile Expandable Categories Menu */}
                  <div>
                    <button
                      onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                      className="w-full flex items-center justify-between py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm font-medium cursor-pointer"
                    >
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faBuilding} className="h-4 w-4 mr-2 text-[#f06023]" />
                        <span>Categories</span>
                      </div>
                      <ChevronDown className={clsx("h-4 w-4 text-zinc-500 transition-transform duration-200", isCategoriesOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isCategoriesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 pr-2 py-1 space-y-1 bg-zinc-50 rounded-xl my-1 border border-zinc-100 overflow-hidden"
                        >
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                navigate(`/properties?property_type=${cat.id}`);
                                setIsMenuOpen(false);
                              }}
                              className="w-full flex items-center py-2 px-2 hover:bg-white rounded-lg text-xs font-semibold text-zinc-700 hover:text-[#f06023] transition-colors text-left cursor-pointer"
                            >
                              <span className="mr-2.5 flex-shrink-0 w-4 text-center">
                                <FontAwesomeIcon icon={cat.faIcon} className="h-3.5 w-3.5 text-[#f06023]" />
                              </span>
                              <span>{cat.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <NavLink
                    to="/properties"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm font-medium"
                  >
                    <Building className="h-4 w-4 mr-2 text-[#f06023]" />
                    Browse Properties
                  </NavLink>
                </>
              )}
              {isAuthenticated && user ? (
                <>
                  <NavLink
                    to={getDashboardPath()}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center py-2 px-3 bg-zinc-100 rounded-lg text-zinc-800 text-sm font-semibold capitalize"
                  >
                    <User className="h-4 w-4 mr-2 text-[#f06023]" />
                    Dashboard ({user.role === 'landlord' ? 'property owner' : user.role})
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