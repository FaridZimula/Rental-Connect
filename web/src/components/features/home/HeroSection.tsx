import { Search, ArrowRight, ShieldCheck, Building2, Car, HardHat, Music, Sprout, HeartPulse, Sun, Shirt, Laptop, Anchor, Tent } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [selectedZone, setSelectedZone] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCluster && selectedCluster !== 'all') params.append('property_type', selectedCluster);
    if (selectedZone) params.append('zone', selectedZone);
    
    navigate(`/properties?${params.toString()}`);
  };

  const assetClusters = [
    { id: 'all', label: 'All Listings', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'apartment', label: 'Housing & Real Estate', icon: <Building2 className="h-4 w-4" /> },
    { id: 'vehicle', label: 'Vehicles & Transport', icon: <Car className="h-4 w-4" /> },
    { id: 'machinery', label: 'Construction Machinery', icon: <HardHat className="h-4 w-4" /> },
    { id: 'event_equipment', label: 'Event & Media Gear', icon: <Music className="h-4 w-4" /> },
    { id: 'agro_machinery', label: 'Agro & Land Assets', icon: <Sprout className="h-4 w-4" /> },
    { id: 'medical_equipment', label: 'Medical & Health Tech', icon: <HeartPulse className="h-4 w-4" /> },
    { id: 'solar_power', label: 'Renewable Solar Power', icon: <Sun className="h-4 w-4" /> },
    { id: 'fashion_attire', label: 'Fashion & Formal Wear', icon: <Shirt className="h-4 w-4" /> },
    { id: 'it_hardware', label: 'IT & Computing Tech', icon: <Laptop className="h-4 w-4" /> },
    { id: 'watercraft', label: 'Marine & Watercraft', icon: <Anchor className="h-4 w-4" /> },
    { id: 'camping_sports', label: 'Camping & Sports Gear', icon: <Tent className="h-4 w-4" /> },
  ];

  return (
    <div className="relative bg-gradient-to-b from-orange-50/50 via-white to-zinc-50 text-zinc-900 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#f06023]/10 blur-[180px] rounded-full pointer-events-none" />
      
      {/* Main Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center relative z-10 pt-28 sm:pt-32 pb-16 sm:pb-24">
        <motion.div
          className="max-w-5xl mr-auto text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#f06023]/10 text-[#f06023] px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-[#f06023]/20">
            <ShieldCheck className="h-4 w-4" />
            Digital Physical Rental Properties & Assets Management System
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-zinc-900 mb-4 leading-tight tracking-tight">
            Rent Verified <span className="text-[#f06023]">Housing, Vehicles, Tech & Machinery</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-600 mb-8 max-w-3xl text-left font-medium">
            Connect directly with verified owners of real estate, 4x4 SUVs, construction machinery, event gear, solar arrays, and medical equipment across Uganda.
          </p>

          {/* Physical Asset Cluster Tabs */}
          <div className="flex flex-wrap justify-start gap-2 mb-6 max-w-4xl">
            {assetClusters.map((cluster) => (
              <button
                key={cluster.id}
                type="button"
                onClick={() => setSelectedCluster(cluster.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedCluster === cluster.id
                    ? 'bg-[#f06023] text-white font-bold shadow-md scale-105'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:text-[#f06023] hover:border-[#f06023]/50'
                }`}
              >
                {cluster.icon}
                {cluster.label}
              </button>
            ))}
          </div>
          
          <motion.div 
            className="bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-xl max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f06023] h-5 w-5" />
                  <input
                    type="text"
                    className="pl-12 pr-4 py-3.5 w-full rounded-xl text-sm bg-zinc-50 text-zinc-900 placeholder-zinc-400 border border-zinc-200 focus:outline-none focus:border-[#f06023] focus:bg-white transition-all font-medium"
                    placeholder="Search asset title (e.g. Prado V8, EcoFlow Solar, Sony FX3)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <input
                type="text"
                placeholder="City / Area (e.g. Kampala)"
                className="p-3.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:border-[#f06023] bg-zinc-50 text-zinc-900 focus:bg-white sm:w-44 font-medium"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
              />
              
              <button
                type="submit"
                className="bg-[#f06023] hover:bg-[#d94b12] text-white font-bold py-3.5 px-7 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center text-sm whitespace-nowrap"
              >
                Find Asset <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-4xl">
            {[
              { label: 'Asset Clusters', value: '11 Categories' },
              { label: 'Coverage Area', value: 'Nationwide UG' },
              { label: 'Owner Protection', value: 'Double Verified' },
              { label: 'Listing Expiry Control', value: '90-Day Auto' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-left bg-white/80 backdrop-blur-sm border border-zinc-200/80 shadow-sm rounded-xl p-4 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <div className="text-xl sm:text-2xl font-extrabold text-[#f06023] mb-0.5">{stat.value}</div>
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