import { useState, useEffect } from 'react';
import { Timer, ArrowRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockProperties } from '../../../data/mockData';

export default function FeaturedPropertiesSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 493,
    hours: 13,
    minutes: 47,
    seconds: 17,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const flashProperties = mockProperties.slice(0, 3);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(v);

  return (
    <section className="py-12 bg-zinc-50 border-t border-zinc-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Flash Deal Countdown Block */}
          <div className="w-full lg:w-80 lg:flex-shrink-0 bg-gradient-to-br from-[#f06023] to-[#e04f12] text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Timer className="h-3.5 w-3.5" /> Limited Offers
              </div>
              <h3 className="text-2xl font-extrabold font-display leading-tight">
                FLASH DEALS <br />
                <span className="text-orange-100">Grab While it Lasts!</span>
              </h3>
              <p className="text-xs text-orange-50 font-medium">
                Verified high-demand properties and logistics assets with immediate booking options.
              </p>
            </div>

            {/* Countdown Display */}
            <div className="grid grid-cols-4 gap-2 text-center my-6">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes },
                { label: 'Secs', value: timeLeft.seconds },
              ].map((t) => (
                <div key={t.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
                  <div className="text-lg font-black">{String(t.value).padStart(2, '0')}</div>
                  <div className="text-[9px] uppercase font-bold tracking-wider text-orange-200">{t.label}</div>
                </div>
              ))}
            </div>

            <Link
              to="/properties"
              className="w-full bg-white hover:bg-zinc-100 text-[#f06023] font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
            >
              View All Limited Offers <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right Flash Deal Cards — One horizontal line on mobile view with left/right scroll */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-nowrap overflow-x-auto sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-4 pt-1 hide-scrollbar scroll-smooth snap-x snap-mandatory">
              {flashProperties.map((p) => (
                <div
                  key={p.id}
                  className="w-[280px] sm:w-full sm:max-w-[280px] shrink-0 snap-start mx-auto bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#f06023] transition-all duration-300 flex flex-col h-full"
                >
                  {/* Card Media */}
                  <div className="relative h-[200px] bg-zinc-100 flex-shrink-0">
                    <img
                      src={p.images?.[0]?.image_url}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#f06023] text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                      {p.property_type}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-white/95 text-zinc-800 font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm">
                      For {p.listing_type}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3.5 flex-grow flex flex-col justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-950 line-clamp-1 mb-1 hover:text-[#f06023] transition-colors">
                        <Link to={`/properties/${p.id}`}>{p.title}</Link>
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-semibold mb-2">{p.display_zone}</p>
                      <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-medium">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 flex flex-col justify-end">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-[9px] uppercase font-bold text-zinc-400">Rent Price</span>
                        <span className="text-sm font-extrabold text-[#f06023]">
                          {formatPrice(Number(p.price))}
                          <span className="text-[10px] font-normal text-zinc-500">{p.price_period}</span>
                        </span>
                      </div>
                      
                      <Link to={`/properties/${p.id}`}>
                        <button className="w-full bg-[#f06023] hover:bg-[#d94b12] text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98">
                          <Eye className="h-3.5 w-3.5 text-white" /> View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
