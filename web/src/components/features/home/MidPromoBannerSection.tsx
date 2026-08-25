import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MidPromoBannerSection() {
  const navigate = useNavigate();

  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/*
          aspect-[16/5] ensures the banner maintains the same
          visual proportion across all screen sizes.
          On mobile it becomes taller via min-h, but the ratio
          keeps it consistent with desktop.
        */}
        <div
          className="
            relative w-full rounded-3xl overflow-hidden shadow-xl
            bg-gradient-to-r from-[#f06023] via-[#e55520] to-[#c94210]
            flex items-center
            aspect-[16/5] min-h-[180px]
          "
        >
          {/* ── Decorative Background Glows ── */}
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-52 h-52 bg-orange-300/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />

          {/* ── Inner Content Grid ── */}
          <div className="relative z-10 w-full h-full flex items-center px-6 sm:px-10 md:px-14">
            <div className="grid grid-cols-2 md:grid-cols-2 items-center gap-4 w-full h-full">

              {/* LEFT ── Text + CTA */}
              <div className="flex flex-col justify-center gap-2 sm:gap-3">
                <span className="inline-flex self-start items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  🔥 Verified Rentals
                </span>

                <h3 className="text-base sm:text-xl md:text-3xl font-extrabold font-display text-white leading-tight tracking-tight">
                  Rent Smarter.<br />
                  <span className="text-orange-100">Zero Broker Fraud.</span>
                </h3>

                <p className="hidden sm:block text-[11px] sm:text-xs md:text-sm text-orange-50 font-medium max-w-xs leading-relaxed">
                  Instantly access verified transport fleets, luxury housing, construction machines & event gear across Uganda.
                </p>

                <button
                  onClick={() => navigate('/properties')}
                  className="
                    self-start mt-1
                    bg-white hover:bg-zinc-100 text-[#f06023] font-extrabold
                    px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl
                    text-[10px] sm:text-xs
                    flex items-center gap-1.5
                    shadow-md transition-all duration-200 hover:scale-105
                  "
                >
                  BROWSE LISTINGS <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>

              {/* RIGHT ── Collage of property images, visible on all screen sizes */}
              <div className="flex items-center justify-end h-full py-4 gap-2 sm:gap-3 overflow-hidden">
                {/* Back image — tilted left */}
                <div className="
                  w-[38%] sm:w-[32%]
                  aspect-[4/3]
                  rounded-xl sm:rounded-2xl
                  overflow-hidden border-2 sm:border-4 border-white/60 shadow-lg
                  -rotate-6 hover:rotate-0 transition-transform duration-300 flex-shrink-0
                ">
                  <img
                    src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Housing"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Front/center image — no tilt, on top */}
                <div className="
                  w-[42%] sm:w-[36%]
                  aspect-[4/3]
                  rounded-xl sm:rounded-2xl
                  overflow-hidden border-2 sm:border-4 border-white shadow-2xl
                  rotate-3 hover:rotate-0 transition-transform duration-300 flex-shrink-0 z-10
                ">
                  <img
                    src="https://images.pexels.com/photos/9735300/pexels-photo-9735300.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Vehicle Fleet"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
