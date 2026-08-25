import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MidPromoBannerSection() {
  const navigate = useNavigate();

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Card */}
        <div className="relative bg-gradient-to-r from-blue-600 via-[#1e40af] to-[#1e3a8a] text-white rounded-3xl overflow-hidden shadow-lg min-h-[220px] flex items-center p-8 md:p-12">
          {/* Abstract Circle Overlays */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute left-1/3 bottom-0 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 w-full relative z-10">
            
            {/* Banner Text */}
            <div className="text-left space-y-4">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display leading-tight tracking-tight">
                Dive Into A World Of <br />
                <span className="text-blue-100">Crystal Clear Logistics</span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-md font-medium">
                Rent high-performance transport vehicles & cargo assets from verified owners. Safe, insured, and verified.
              </p>
              <button
                onClick={() => navigate('/properties?property_type=vehicle')}
                className="bg-white hover:bg-zinc-100 text-blue-600 font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 hover:scale-103"
              >
                RENT NOW <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right Graphic Section (Clean Logistics/Car Render) */}
            <div className="hidden md:flex justify-end items-center h-40">
              <div className="w-64 h-40 relative">
                <img
                  src="https://images.pexels.com/photos/9735300/pexels-photo-9735300.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Logistics Fleet"
                  className="w-full h-full object-cover rounded-2xl border-4 border-white/20 shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
