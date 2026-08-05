import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, Menu, X, Building, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10 || true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav className={clsx(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      'bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm py-2 sm:py-3 text-zinc-900'
    )}>
      <div className="container mx-auto px-3 sm:px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo & Brand Name */}
          <NavLink to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#f06023] p-0.5 shadow-[0_0_15px_rgba(240,96,35,0.3)]">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <span className="text-[#f06023] font-black text-xl tracking-tighter">RC</span>
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-zinc-900 group-hover:text-[#f06023] transition-colors">
              Rental <span className="text-[#f06023]">Connect</span>
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-grow">
            {/* Navigation Links - Centered */}
            <div className="flex items-center space-x-4 lg:space-x-8 mx-auto">
              <NavLink 
                to="/" 
                className={({ isActive }) =>
                  clsx(
                    'text-sm lg:text-base font-medium transition-all duration-200',
                    'text-zinc-700 hover:text-[#f06023]',
                    isActive && 'text-white bg-[#f06023] rounded-full px-4 py-1.5 font-semibold shadow-md'
                  )
                }
              >
                Home
              </NavLink>
              <NavLink 
                to="/hostels" 
                className={({ isActive }) =>
                  clsx(
                    'text-sm lg:text-base font-medium transition-all duration-200',
                    'text-zinc-700 hover:text-[#f06023]',
                    isActive && 'text-white bg-[#f06023] rounded-full px-4 py-1.5 font-semibold shadow-md'
                  )
                }
              >
                All Listings
              </NavLink>
              <NavLink 
                to="/hostels?category=hostels" 
                className="text-sm lg:text-base font-medium text-zinc-700 hover:text-[#f06023] transition-colors"
              >
                Hostels
              </NavLink>
              <NavLink 
                to="/hostels?category=rentals" 
                className="text-sm lg:text-base font-medium text-zinc-700 hover:text-[#f06023] transition-colors"
              >
                Apartments
              </NavLink>
              <NavLink 
                to="/hostels?category=vehicles" 
                className="text-sm lg:text-base font-medium text-zinc-700 hover:text-[#f06023] transition-colors"
              >
                Vehicles
              </NavLink>
              <NavLink 
                to="/hostels?category=land" 
                className="text-sm lg:text-base font-medium text-zinc-700 hover:text-[#f06023] transition-colors"
              >
                Land
              </NavLink>
              <NavLink 
                to="/hostels?category=equipment" 
                className="text-sm lg:text-base font-medium text-zinc-700 hover:text-[#f06023] transition-colors"
              >
                Equipments
              </NavLink>
            </div>

            {/* Search Bar - Right Aligned */}
            <div className="relative flex items-center flex-shrink-0 bg-zinc-100 rounded-full px-3 lg:px-4 py-1.5 lg:py-2 border border-zinc-200 focus-within:border-[#f06023] focus-within:bg-white w-full max-w-xs transition-all group">
              <Search className="h-4 w-4 text-zinc-500 mr-2 flex-shrink-0 group-hover:text-[#f06023]" />
              <input
                type="text"
                placeholder="Search rentals..."
                className="bg-transparent border-none focus:ring-0 outline-none flex-grow text-xs lg:text-sm text-zinc-900 placeholder-zinc-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-zinc-400 hover:text-[#f06023] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-zinc-700 p-2 hover:bg-zinc-100 rounded-lg transition-colors ml-2 hover:text-[#f06023]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
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
            <div className="container mx-auto px-3 py-3 space-y-2">
              <NavLink 
                to="/" 
                className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm hover:text-[#f06023]"
              >
                <Home className="h-4 w-4 mr-2 text-[#f06023]" />
                Home
              </NavLink>
              <NavLink 
                to="/hostels" 
                className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm hover:text-[#f06023]"
              >
                <Building className="h-4 w-4 mr-2 text-[#f06023]" />
                All Rental Items
              </NavLink>
              <NavLink 
                to="/hostels?category=hostels" 
                className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm hover:text-[#f06023]"
              >
                Student Hostels
              </NavLink>
              <NavLink 
                to="/hostels?category=rentals" 
                className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm hover:text-[#f06023]"
              >
                Apartments & Houses
              </NavLink>
              <NavLink 
                to="/hostels?category=vehicles" 
                className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm hover:text-[#f06023]"
              >
                Vehicles & Cars
              </NavLink>
              <NavLink 
                to="/hostels?category=land" 
                className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm hover:text-[#f06023]"
              >
                Land & Plots
              </NavLink>
              <NavLink 
                to="/hostels?category=equipment" 
                className="flex items-center py-2 px-3 hover:bg-zinc-100 rounded-lg text-zinc-800 text-sm hover:text-[#f06023]"
              >
                Equipments & Tools
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;