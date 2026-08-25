import { ArrowRight, Eye, Flame, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockProperties } from '../../../data/mockData';

export default function HotDealsSection() {
  const hotProperties = mockProperties.slice(2, 6);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(v);

  // Generate pseudo-random countdown per card for realism
  const countdowns = ['95h 43m 53s', '71h 43m 53s', '191h 43m 53s', '167h 43m 53s'];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Row — Centered Alignment with Icon on Top */}
        <div className="text-center mb-8 border-b border-zinc-100 pb-6 max-w-2xl mx-auto flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-2 border-[#f06023] bg-[#f06023] text-white flex items-center justify-center shadow-md mb-3">
            <Flame className="h-6 w-6 text-white fill-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 font-display mb-1">Hot Deal Auctions</h3>
          <p className="text-xs sm:text-sm text-zinc-500 font-semibold mb-4">Active high-value property and transport assets open for bidding & lease inquiries</p>
          <Link to="/properties" className="bg-[#f06023] hover:bg-[#d94b12] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-98">
            Explore Auction <ArrowRight className="h-4 w-4 text-white" />
          </Link>
        </div>

        {/* Responsive Auction Row/Grid — One horizontal line on mobile view */}
        <div className="flex flex-nowrap overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-4 pt-1 justify-start sm:justify-items-center hide-scrollbar scroll-smooth snap-x snap-mandatory">
          {hotProperties.map((p, idx) => (
            <div
              key={p.id}
              className="w-[280px] sm:w-full sm:max-w-[280px] shrink-0 snap-start bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#f06023] transition-all duration-300 flex flex-col h-full"
            >
              {/* Media Section */}
              <div className="relative h-40 bg-zinc-100 flex-shrink-0">
                <img
                  src={p.images?.[0]?.image_url}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm animate-pulse z-10">
                  LIVE
                </div>
                {/* Closing Timer Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold py-1.5 px-3 flex items-center justify-between z-10">
                  <span className="text-zinc-300">Closes In:</span>
                  <span className="flex items-center gap-1 font-bold text-orange-400">
                    <Clock className="h-3 w-3" /> {countdowns[idx] ?? '71h 43m 53s'}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-3.5 flex-grow flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-zinc-950 line-clamp-1 mb-0.5 hover:text-[#f06023] transition-colors">
                    <Link to={`/properties/${p.id}`}>{p.title}</Link>
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-semibold mb-1.5">{p.display_zone}</p>
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-medium">
                    {p.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-[9px] uppercase font-bold text-zinc-400">Start Price</span>
                    <span className="text-sm font-extrabold text-[#f06023]">
                      {formatPrice(Number(p.price))}
                      <span className="text-[10px] font-normal text-zinc-500">{p.price_period}</span>
                    </span>
                  </div>

                  <Link to={`/properties/${p.id}`}>
                    <button className="w-full bg-[#f06023] hover:bg-[#d94b12] text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer">
                      <Eye className="h-3.5 w-3.5 text-white" /> Bid / Inquire
                    </button>
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
