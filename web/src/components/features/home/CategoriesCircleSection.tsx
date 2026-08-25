import { ArrowRight, Building2, Car, HardHat, Music, Sprout, HeartPulse, Sun, Shirt } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function CategoriesCircleSection() {
  const navigate = useNavigate();

  const circles = [
    { id: 'apartment', label: 'Housing & Flats', icon: <Building2 className="h-7 w-7 text-white" /> },
    { id: 'vehicle', label: 'Vehicles & Transport', icon: <Car className="h-7 w-7 text-white" /> },
    { id: 'machinery', label: 'Construction Machinery', icon: <HardHat className="h-7 w-7 text-white" /> },
    { id: 'event_equipment', label: 'Event Gear & Venues', icon: <Music className="h-7 w-7 text-white" /> },
    { id: 'agro_machinery', label: 'Agro & Land Assets', icon: <Sprout className="h-7 w-7 text-white" /> },
    { id: 'medical_equipment', label: 'Medical & Healthcare', icon: <HeartPulse className="h-7 w-7 text-white" /> },
    { id: 'solar_power', label: 'Solar & Renewable Power', icon: <Sun className="h-7 w-7 text-white" /> },
    { id: 'fashion_attire', label: 'Formal & Cultural Wear', icon: <Shirt className="h-7 w-7 text-white" /> },
  ];

  return (
    <section className="py-12 bg-zinc-50 border-t border-zinc-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Row — Centered Alignment */}
        <div className="text-center mb-8 max-w-2xl mx-auto flex flex-col items-center">
          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 font-display mb-1">Featured Categories</h3>
          <p className="text-xs sm:text-sm text-zinc-500 font-semibold mb-3">Browse rental properties and physical assets by industry clusters</p>
          <Link to="/properties" className="bg-[#f06023] hover:bg-[#d94b12] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-98">
            View All Categories <ArrowRight className="h-4 w-4 text-white" />
          </Link>
        </div>

        {/* Circular Items List — One horizontal line on mobile view with scrolling */}
        <div className="flex flex-nowrap overflow-x-auto lg:grid lg:grid-cols-8 gap-4 sm:gap-6 pb-4 pt-1 justify-start lg:justify-items-center hide-scrollbar scroll-smooth snap-x snap-mandatory">
          {circles.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/properties?property_type=${item.id}`)}
              className="flex flex-col items-center text-center group cursor-pointer shrink-0 w-24 sm:w-28 lg:w-auto snap-start"
            >
              {/* Theme Orange Boundary Circle with White Icon */}
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-[#f06023] bg-[#f06023] text-white flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d94b12] group-hover:border-[#d94b12] group-hover:shadow-lg">
                {item.icon}
              </div>
              <span className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs font-bold text-zinc-700 group-hover:text-[#f06023] transition-colors max-w-[100px] leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}

