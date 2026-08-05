import { Building, Mail, Phone, MapPin, Facebook, Twitter, Instagram, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white border-t border-zinc-800">
      <div className="container mx-auto px-4 pt-12 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-[#f06023] p-0.5 shadow-md">
                <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                  <span className="text-[#f06023] font-black text-lg">RC</span>
                </div>
              </div>
              <span className="text-xl font-display font-extrabold text-white">Rental <span className="text-[#f06023]">Connect</span></span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              The ultimate rental marketplace connecting property, vehicle, land, and equipment owners with verified renters across Uganda.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -2 }}
                className="bg-zinc-900 border border-zinc-800 text-[#f06023] hover:bg-[#f06023] hover:text-white p-2.5 rounded-full transition-all shadow-md"
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -2 }}
                className="bg-zinc-900 border border-zinc-800 text-[#f06023] hover:bg-[#f06023] hover:text-white p-2.5 rounded-full transition-all shadow-md"
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ scale: 1.1, y: -2 }}
                className="bg-zinc-900 border border-zinc-800 text-[#f06023] hover:bg-[#f06023] hover:text-white p-2.5 rounded-full transition-all shadow-md"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
            </div>
          </div>

          {/* Categories */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-6 text-[#f06023] relative inline-block">
              Rental Categories
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#f06023]" />
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/hostels?category=hostels', label: 'Student Hostels' },
                { to: '/hostels?category=rentals', label: 'Apartments & Houses' },
                { to: '/hostels?category=vehicles', label: 'Vehicles & SUVs' },
                { to: '/hostels?category=land', label: 'Commercial & Plot Land' },
                { to: '/hostels?category=equipment', label: 'Equipments & Tools' }
              ].map((link) => (
                <motion.li 
                  key={link.to}
                  whileHover={{ x: 5 }}
                  className="group"
                >
                  <Link 
                    to={link.to} 
                    className="text-zinc-200 hover:text-[#f06023] transition-colors inline-flex items-center text-sm font-medium"
                  >
                    <span className="w-1.5 h-1.5 bg-[#f06023] rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-6 text-[#f06023]">Company</h3>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/hostels', label: 'All Rentals' },
                { to: '/universities', label: 'Campus Locations' },
                { to: '/hostel-owner/login', label: 'List Your Rental' },
                { to: '/contact', label: 'Contact Support' }
              ].map((link) => (
                <motion.li 
                  key={link.to}
                  whileHover={{ x: 5 }}
                  className="group"
                >
                  <Link 
                    to={link.to}
                    className="text-zinc-200 hover:text-[#f06023] transition-colors inline-flex items-center text-sm font-medium"
                  >
                    <span className="w-1.5 h-1.5 bg-[#f06023] rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-6 text-[#f06023]">Contact Us</h3>
            <ul className="space-y-4">
              <motion.li 
                whileHover={{ x: 5 }}
                className="flex items-center justify-center md:justify-start space-x-3 text-zinc-200 text-sm font-medium"
              >
                <MapPin className="h-5 w-5 text-[#f06023] flex-shrink-0" />
                <span>Plot 45, Kampala Road, Kampala, Uganda</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="flex items-center justify-center md:justify-start space-x-3 text-zinc-200 text-sm font-medium"
              >
                <Phone className="h-5 w-5 text-[#f06023] flex-shrink-0" />
                <span>+256 78 123 4567</span>
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }}
                className="flex items-center justify-center md:justify-start space-x-3 text-zinc-200 text-sm font-medium"
              >
                <Mail className="h-5 w-5 text-[#f06023] flex-shrink-0" />
                <span>support@rentalconnect.ug</span>
              </motion.li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-zinc-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-zinc-400 text-sm">
              &copy; {new Date().getFullYear()} Rental Connect. All rights reserved. Rent Hostels, Property, Vehicles, Land & Equipment.
            </p>
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -5 }}
              className="bg-zinc-900 border border-zinc-800 text-[#f06023] hover:bg-[#f06023] hover:text-white p-2.5 rounded-full transition-all shadow-md"
              aria-label="Scroll to top"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;