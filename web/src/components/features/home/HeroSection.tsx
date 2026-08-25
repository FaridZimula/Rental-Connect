import { Search, ArrowRight, ShieldCheck, Building2, Car, HardHat, Music, Sprout, HeartPulse, Sun, Shirt, Laptop, Anchor, Tent, ChevronRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const navigate = useNavigate();

  const assetClusters = [
    { id: 'apartment', label: 'Housing & Real Estate', icon: <Building2 className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'vehicle', label: 'Vehicles & Transport', icon: <Car className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'machinery', label: 'Construction Machinery', icon: <HardHat className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'event_equipment', label: 'Event & Media Gear', icon: <Music className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'agro_machinery', label: 'Agro & Land Assets', icon: <Sprout className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'medical_equipment', label: 'Medical & Health Tech', icon: <HeartPulse className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'solar_power', label: 'Renewable Solar Power', icon: <Sun className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'fashion_attire', label: 'Fashion & Formal Wear', icon: <Shirt className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'it_hardware', label: 'IT & Computing Tech', icon: <Laptop className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'watercraft', label: 'Marine & Watercraft', icon: <Anchor className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'camping_sports', label: 'Camping & Sports Gear', icon: <Tent className="h-4.5 w-4.5 text-[#f06023]" /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedZone) params.append('zone', selectedZone);
    navigate(`/properties?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/properties?property_type=${categoryId}`);
  };

  return (
    <div className="relative bg-zinc-50 pt-28 pb-16 overflow-hidden">
      {/* Top Search Bar Header (6Valley Style) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo / Subtext */}
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <CheckCircle className="h-5 w-5 text-[#f06023]" />
            <span>Uganda's Leading Verified Physical Asset Marketplace</span>
          </div>
          {/* Fast Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto max-w-xl flex-grow justify-end">
            <input
              type="text"
              placeholder="Search assets (e.g. Prado V8, Generator)..."
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-[#f06023] w-full md:w-64 bg-zinc-50 text-zinc-900 placeholder-zinc-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location..."
              className="px-4 py-2 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-[#f06023] w-24 md:w-32 bg-zinc-50 text-zinc-900 placeholder-zinc-400 font-medium"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            />
            <button
              type="submit"
              className="bg-[#f06023] hover:bg-[#d94b12] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Categories Sidebar (6Valley Style) */}
          <div className="col-span-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden h-fit hidden lg:block">
            <div className="bg-[#f06023] text-white font-bold text-sm px-5 py-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span>Asset Categories</span>
            </div>
            <div className="divide-y divide-zinc-100">
              {assetClusters.map((cluster) => (
                <button
                  key={cluster.id}
                  onClick={() => handleCategoryClick(cluster.id)}
                  className="w-full px-5 py-3 flex items-center justify-between text-left text-xs font-semibold text-zinc-700 hover:bg-[#f06023]/5 hover:text-[#f06023] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {cluster.icon}
                    <span>{cluster.label}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#f06023] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Banner Carousel area (6Valley Style) */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
            <div className="relative bg-gradient-to-r from-orange-500 via-[#f06023] to-[#e04f12] rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-lg overflow-hidden flex items-center aspect-[16/10] min-h-[260px]">
              
              {/* Dynamic Abstract Shapes / Background Elements */}
              <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20" />
              <div className="absolute top-10 left-1/3 w-40 h-40 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="grid grid-cols-2 items-center gap-4 sm:gap-8 relative z-10 w-full h-full">
                
                {/* Banner Text Side */}
                <div className="text-left space-y-2 sm:space-y-4 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      Verified Rental Assets
                    </span>
                  </motion.div>

                  <motion.h2
                    className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white leading-tight"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    Smart Rentals <br />
                    <span className="text-orange-100">Smart Savings!</span>
                  </motion.h2>

                  <motion.p
                    className="hidden sm:block text-xs md:text-sm lg:text-base text-orange-50 font-medium max-w-md leading-relaxed"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    Get instant access to verified heavy machinery, wedding cars, solar generators, event gear, and quality housing across Uganda. Zero broker fraud.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="pt-1 sm:pt-2"
                  >
                    <button
                      onClick={() => navigate('/properties')}
                      className="bg-white hover:bg-zinc-100 text-[#f06023] font-bold px-3 sm:px-6 py-2 sm:py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm hover:scale-105"
                    >
                      Browse Listings <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </motion.div>
                </div>

                {/* Banner Image Side — visible on all screen sizes, scaled proportionally */}
                <div className="flex justify-center items-center relative h-full py-4 overflow-hidden">
                  <motion.div
                    className="relative w-full h-full flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* Main image */}
                    <div className="w-[60%] sm:w-56 md:w-64 aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-white shadow-xl rotate-3 absolute z-20 hover:rotate-0 transition-transform duration-300">
                      <img 
                        src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400" 
                        alt="Real Estate"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Back-left image */}
                    <div className="hidden sm:block w-36 h-36 md:w-48 md:h-48 rounded-xl overflow-hidden border-4 border-white shadow-lg -rotate-12 absolute left-2 md:left-4 z-10 hover:rotate-0 transition-transform duration-300">
                      <img 
                        src="https://images.pexels.com/photos/9735300/pexels-photo-9735300.jpeg?auto=compress&cs=tinysrgb&w=300" 
                        alt="Safari Prado"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Back-right image */}
                    <div className="hidden sm:block w-40 h-40 md:w-52 md:h-52 rounded-xl overflow-hidden border-4 border-white shadow-lg rotate-12 absolute right-2 md:right-4 z-10 hover:rotate-0 transition-transform duration-300">
                      <img 
                        src="https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=300" 
                        alt="Machinery"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;