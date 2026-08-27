import { useState, useEffect } from 'react';
import { Search, ShieldCheck, Building2, Car, HardHat, Music, Sprout, HeartPulse, Shirt, Laptop, Tent, ChevronRight, CheckCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Slide {
  id: number;
  title: string;
  image: string;
  categoryLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Rent, Live And Thrive - Housing & Real Estate',
    image: '/images/flyers/FLYER ONE.png',
    categoryLink: '/properties?property_type=apartment',
  },
  {
    id: 2,
    title: 'Rent, Drive And Explore - Vehicles & Transport',
    image: '/images/flyers/FLYER 2.png',
    categoryLink: '/properties?property_type=vehicle',
  },
  {
    id: 3,
    title: 'Till, Plant And Harvest - Agro & Farm Machinery',
    image: '/images/flyers/FLYER 3.png',
    categoryLink: '/properties?property_type=agro_machinery',
  },
  {
    id: 4,
    title: 'Speak, Play And Celebrate - Sound & PA Systems',
    image: '/images/flyers/FLYER 4.png',
    categoryLink: '/properties?property_type=event_equipment',
  },
  {
    id: 5,
    title: 'Speak, Play And Celebrate - Stage & Event Gear',
    image: '/images/flyers/FLYER 5.png',
    categoryLink: '/properties?property_type=event_equipment',
  },
  {
    id: 6,
    title: 'Heal, Care And Recover - Medical & Healthcare Equipment',
    image: '/images/flyers/FLYER 6.png',
    categoryLink: '/properties?property_type=medical_equipment',
  },
];

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Auto-play timer for slideshow (changes every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const assetClusters = [
    { id: 'apartment', label: 'Housing & Real Estate', icon: <Building2 className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'vehicle', label: 'Vehicles & Transport', icon: <Car className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'machinery', label: 'Construction Machinery', icon: <HardHat className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'event_equipment', label: 'Event & Media Gear', icon: <Music className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'agro_machinery', label: 'Agro & Land Assets', icon: <Sprout className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'medical_equipment', label: 'Medical & Health Tech', icon: <HeartPulse className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'fashion_attire', label: 'Fashion & Formal Wear', icon: <Shirt className="h-4.5 w-4.5 text-[#f06023]" /> },
    { id: 'it_hardware', label: 'IT & Computing Tech', icon: <Laptop className="h-4.5 w-4.5 text-[#f06023]" /> },
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

  const slide = slides[currentSlide];

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
          
          {/* Left Column: Categories Sidebar */}
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

          {/* Right Column: Hero Graphic Flyer Slideshow (Strict 16:9 Aspect Ratio) */}
          <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-xl bg-zinc-950 border border-zinc-200 group cursor-pointer"
                 onClick={() => navigate(slide.categoryLink)}>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-full h-full"
                >
                  {/* Clean Full-Bleed Graphic Flyer Display */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Left Arrow Control */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#f06023] text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                title="Previous Flyer"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Right Arrow Control */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#f06023] text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
                title="Next Flyer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Navigation Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? 'w-6 bg-[#f06023]' : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroSection;