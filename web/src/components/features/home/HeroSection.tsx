import { Search, ArrowRight, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedZone, setSelectedZone] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedType && selectedType !== 'all') params.append('property_type', selectedType);
    if (selectedZone) params.append('zone', selectedZone);
    
    navigate(`/properties?${params.toString()}`);
  };

  const propertyTypes = [
    { id: 'all', label: 'All Properties' },
    { id: 'apartment', label: 'Apartments' },
    { id: 'house', label: 'Houses' },
    { id: 'studio', label: 'Studios' },
    { id: 'hostel', label: 'Hostel Rooms' },
    { id: 'commercial', label: 'Commercial' },
  ];

  return (
    <div className="relative bg-gradient-to-b from-orange-50/40 to-white text-zinc-900 overflow-hidden">
      {/* Soft Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f06023]/10 blur-[160px] rounded-full pointer-events-none" />
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center relative z-10 pt-28 sm:pt-32 pb-16 sm:pb-24">
        <motion.div
          className="max-w-4xl mr-auto text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#f06023]/10 text-[#f06023] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
            <ShieldCheck className="h-4 w-4" />
            Verified & Fraud-Protected Rental Platform
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-zinc-900 mb-4 leading-tight tracking-tight">
            Discover Verified <span className="text-[#f06023]">Rental Properties</span> with Confidence
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-600 mb-8 max-w-2xl text-left">
            Eliminate misleading adverts and rental fraud. Search verified apartments, houses, and studios direct from verified landlords across Uganda.
          </p>

          {/* Property Type Selector */}
          <div className="flex flex-wrap justify-start gap-2 mb-6 max-w-3xl">
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  selectedType === type.id
                    ? 'bg-[#f06023] text-white font-bold shadow-md'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:text-[#f06023] hover:border-[#f06023]/50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          <motion.div 
            className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-xl max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f06023] h-5 w-5" />
                  <input
                    type="text"
                    className="pl-12 pr-4 py-3.5 w-full rounded-xl text-sm bg-zinc-50 text-zinc-900 placeholder-zinc-400 border border-zinc-200 focus:outline-none focus:border-[#f06023] focus:bg-white transition-all"
                    placeholder="Search location, area, or property title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Zone / Area (e.g. Kololo)"
                className="p-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#f06023] bg-zinc-50 text-zinc-900 focus:bg-white sm:w-44"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
              />
              
              <button
                type="submit"
                className="bg-[#f06023] hover:bg-[#d94b12] text-white font-bold py-3.5 px-7 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center text-sm whitespace-nowrap"
              >
                Search <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          </motion.div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-4xl">
            {[
              { label: 'Admin Verified Listings', value: '100%' },
              { label: 'Direct Landlord Contact', value: 'Instant' },
              { label: 'Active Fraud Control', value: 'Protected' },
              { label: 'Up-to-Date Availability', value: 'Realtime' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-left bg-white/80 backdrop-blur-sm border border-zinc-200/80 shadow-sm rounded-xl p-4 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              >
                <div className="text-xl sm:text-2xl font-bold text-[#f06023] mb-0.5">{stat.value}</div>
                <div className="text-xs text-zinc-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;