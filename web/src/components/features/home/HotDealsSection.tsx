import { ArrowRight, Eye, Flame, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockProperties } from '../../../data/mockData';

export default function HotDealsSection() {
  // Take next 4 properties for Hot Deals
  const hotProperties = mockProperties.slice(2, 6);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 }).format(v);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Row */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 text-[#f06023] rounded-xl">
              <Flame className="h-5 w-5 fill-[#f06023]" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 font-display">Hot Deal Auctions</h3>
              <p className="text-xs text-zinc-500 font-semibold">Active high-value property and transport assets open for bidding & lease inquiries</p>
            </div>
          </div>
          <Link to="/properties" className="text-[#f06023] hover:text-[#d94b12] text-xs font-bold flex items-center gap-1">
            Explore Auction <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Bidding Grid (Auction Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {hotProperties.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#f06023] transition-all duration-300 flex flex-col justify-between"
              style={{ width: '280px', height: '400px' }}
            >
              {/* Media Section */}
              <div className="relative h-44 bg-zinc-100 flex-shrink-0">
                <img
                  src={p.images?.[0]?.image_url}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-red-600 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                  LIVE
                </div>
                {/* Closing Timer Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold py-1.5 px-3 flex items-center justify-between">
                  <span className="text-zinc-300">Closes In:</span>
                  <span className="flex items-center gap-1 font-bold text-orange-400">
                    <Clock className="h-3 w-3" /> 71h 43m 53s
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-950 line-clamp-1 mb-1 hover:text-[#f06023] transition-colors">
                    <Link to={`/properties/${p.id}`}>{p.title}</Link>
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-semibold mb-2">{p.display_zone}</p>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
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
                    <button className="w-full bg-[#f06023] hover:bg-[#d94b12] text-white font-bold py-2 rounded-xl transition-all duration-300 text-xs flex items-center justify-center gap-1.5 shadow-sm">
                      <Eye className="h-3.5 w-3.5" /> Bid / Inquire
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
