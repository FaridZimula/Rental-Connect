import { Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { universities } from '../../../data/mockData';

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (selectedUniversity) params.append('university', selectedUniversity);
    
    navigate(`/hostels?${params.toString()}`);
  };

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'hostels', label: 'Hostels' },
    { id: 'rentals', label: 'Apartments' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'land', label: 'Land & Plots' },
    { id: 'equipment', label: 'Equipments' },
  ];

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 overflow-hidden">
      {/* Soft Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f06023]/5 blur-[160px] rounded-full pointer-events-none" />
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center relative z-10 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <motion.div
          className="max-w-4xl mr-auto text-left mt-6 sm:mt-10 md:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-zinc-900 mb-4 sm:mb-6 leading-tight tracking-tight">
            Rent <span className="text-[#f06023]">Hostels, Property, Vehicles, Land & Equipments</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-600 mb-8 max-w-2xl mr-auto text-left">
            Connecting verified property & item owners with people ready to rent. Safe, fast, and transparent rentals in one seamless platform.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-start gap-2 mb-6 max-w-3xl mr-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#f06023] text-white font-bold shadow-md'
                    : 'bg-white border border-zinc-200 text-zinc-700 hover:text-[#f06023] hover:border-[#f06023]/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <motion.div 
            className="bg-white p-4 sm:p-5 md:p-6 rounded-2xl border border-zinc-200 shadow-xl max-w-3xl mr-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-grow min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#f06023] h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-3.5 w-full rounded-xl text-sm sm:text-base bg-zinc-50 text-zinc-900 placeholder-zinc-400 border border-zinc-200 focus:outline-none focus:border-[#f06023] focus:bg-white transition-all"
                    placeholder="Search rentals (e.g. Prado V8, Olympia Hostel, 2-Bed Flat)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <select
                className="p-2.5 sm:p-3 md:p-3.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-[#f06023] bg-zinc-50 text-zinc-900 focus:bg-white min-w-[140px]"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
              >
                <option value="" className="bg-white text-zinc-900">All Locations</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.name} className="bg-white text-zinc-900">
                    {uni.name}
                  </option>
                ))}
              </select>
              
              <button
                type="submit"
                className="bg-[#f06023] hover:bg-[#d94b12] text-white font-bold py-2.5 sm:py-3 md:py-3.5 px-5 sm:px-7 md:px-8 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center text-sm sm:text-base whitespace-nowrap"
              >
                Find Rental <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </form>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-12 md:mt-16 max-w-4xl mr-auto">
            {[
              { label: 'Hostels & Houses', value: '1,200+' },
              { label: 'Vehicles', value: '350+' },
              { label: 'Land & Plots', value: '150+' },
              { label: 'Equipments', value: '500+' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-left bg-white border border-zinc-200 hover:border-[#f06023]/40 shadow-sm rounded-xl p-3 sm:p-4 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#f06023] mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-zinc-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;