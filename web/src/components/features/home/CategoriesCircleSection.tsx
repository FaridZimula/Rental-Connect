import { ArrowRight, Building2, Car, HardHat, Music, Sprout, HeartPulse, Sun, Shirt, Laptop, Anchor, Tent } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function CategoriesCircleSection() {
  const navigate = useNavigate();

  const circles = [
    { id: 'apartment', label: 'Housing & Flats', color: 'bg-blue-50 border-blue-200 text-blue-600', icon: <Building2 className="h-6 w-6" /> },
    { id: 'vehicle', label: 'Vehicles & Transport', color: 'bg-orange-50 border-orange-200 text-[#f06023]', icon: <Car className="h-6 w-6" /> },
    { id: 'machinery', label: 'Construction Machinery', color: 'bg-emerald-50 border-emerald-200 text-emerald-600', icon: <HardHat className="h-6 w-6" /> },
    { id: 'event_equipment', label: 'Event Gear & Venues', color: 'bg-purple-50 border-purple-200 text-purple-600', icon: <Music className="h-6 w-6" /> },
    { id: 'agro_machinery', label: 'Agro & Land Assets', color: 'bg-amber-50 border-amber-200 text-amber-600', icon: <Sprout className="h-6 w-6" /> },
    { id: 'medical_equipment', label: 'Medical & Healthcare', color: 'bg-rose-50 border-rose-200 text-rose-600', icon: <HeartPulse className="h-6 w-6" /> },
    { id: 'solar_power', label: 'Solar & Renewable Power', icon: <Sun className="h-6 w-6" />, color: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
    { id: 'fashion_attire', label: 'Formal & Cultural Wear', icon: <Shirt className="h-6 w-6" />, color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
  ];

  return (
    <section className="py-12 bg-zinc-50 border-t border-zinc-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Row */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 font-display">Featured Categories</h3>
            <p className="text-xs text-zinc-500 font-semibold">Browse rental properties and physical assets by industry clusters</p>
          </div>
          <Link to="/properties" className="text-[#f06023] hover:text-[#d94b12] text-xs font-bold flex items-center gap-1">
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Circular Items List */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 justify-items-center">
          {circles.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/properties?property_type=${item.id}`)}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Colored Circle Outer */}
              <div className={`h-20 w-20 rounded-full border flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-108 group-hover:shadow-md ${item.color}`}>
                {item.icon}
              </div>
              <span className="mt-3 text-xs font-bold text-zinc-700 group-hover:text-[#f06023] transition-colors max-w-[100px] leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
