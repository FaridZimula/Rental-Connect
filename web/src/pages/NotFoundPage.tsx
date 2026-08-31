import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Compass, MapPinOff, ArrowRight, Building2, Car, HardHat, Music } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="min-h-[85vh] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-center pt-24 pb-16 px-4 relative overflow-hidden">
        {/* Ambient Glow Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#f06023]/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          {/* Animated 404 Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-3 bg-zinc-900/90 border border-orange-500/30 text-[#f06023] px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_0_25px_rgba(240,96,35,0.25)] mb-6 backdrop-blur-md"
          >
            <MapPinOff className="h-5 w-5 animate-pulse" />
            <span>ERROR 404 • PAGE NOT FOUND</span>
          </motion.div>

          {/* Big 404 Display */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-7xl sm:text-9xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-[#f06023] bg-clip-text text-transparent mb-4 drop-shadow-sm"
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3"
          >
            Lost in Location? Page Doesn't Exist.
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto mb-8 leading-relaxed"
          >
            The page or property listing you are looking for might have been moved, renamed, or is temporarily unavailable on Rental Connect.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12"
          >
            <Link to="/">
              <Button variant="primary" size="lg" icon={<Home className="h-5 w-5" />} iconPosition="left">
                Return to Home
              </Button>
            </Link>
            <Link to="/properties">
              <Button variant="outline" size="lg" icon={<Search className="h-5 w-5" />} iconPosition="left">
                Browse Properties
              </Button>
            </Link>
          </motion.div>

          {/* Quick Destination Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-zinc-800/80 pt-8"
          >
            <Link
              to="/properties?property_type=apartment"
              className="bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-orange-500/40 p-4 rounded-2xl transition-all group text-left backdrop-blur-sm"
            >
              <Building2 className="h-6 w-6 text-[#f06023] mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-zinc-200 group-hover:text-white">Real Estate</div>
              <div className="text-[11px] text-zinc-500">Apartments & Houses</div>
            </Link>

            <Link
              to="/properties?property_type=vehicle"
              className="bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-orange-500/40 p-4 rounded-2xl transition-all group text-left backdrop-blur-sm"
            >
              <Car className="h-6 w-6 text-[#f06023] mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-zinc-200 group-hover:text-white">Vehicles</div>
              <div className="text-[11px] text-zinc-500">Cars, SUVs & Trucks</div>
            </Link>

            <Link
              to="/properties?property_type=machinery"
              className="bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-orange-500/40 p-4 rounded-2xl transition-all group text-left backdrop-blur-sm"
            >
              <HardHat className="h-6 w-6 text-[#f06023] mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-zinc-200 group-hover:text-white">Machinery</div>
              <div className="text-[11px] text-zinc-500">Construction Assets</div>
            </Link>

            <Link
              to="/properties?property_type=event_equipment"
              className="bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-orange-500/40 p-4 rounded-2xl transition-all group text-left backdrop-blur-sm"
            >
              <Music className="h-6 w-6 text-[#f06023] mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-zinc-200 group-hover:text-white">Event Gear</div>
              <div className="text-[11px] text-zinc-500">Sound & Lights</div>
            </Link>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
