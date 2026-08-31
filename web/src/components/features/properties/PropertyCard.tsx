import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property } from '../../../types';

export type PropertySummary = Property;

const formatPrice = (price: number | string) =>
  new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price));

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  studio: 'Studio',
  hostel: 'Hostel',
  land: 'Land / Plot',
  commercial: 'Commercial',
  vehicle: 'Vehicle',
  machinery: 'Machinery',
  event_equipment: 'Event Gear',
  event_venue: 'Event Venue',
  agro_machinery: 'Agro Gear',
  medical_equipment: 'Medical Tech',
  solar_power: 'Solar Power',
  fashion_attire: 'Formal Wear',
  it_hardware: 'IT Hardware',
  watercraft: 'Watercraft',
  camping_sports: 'Sports Gear',
};

export default function PropertyCard({ property }: { property: PropertySummary }) {
  const images = property.images && property.images.length > 0 ? property.images : [];
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIdx((prev) => (prev + 1) % images.length);
  };

  const currentImage = images[currentImgIdx]?.image_url;

  return (
    <div className="w-full max-w-[280px] mx-auto bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#f06023] transition-all duration-300 flex flex-col h-full group">
      {/* Media Section with Animated Photo Slider */}
      <div className="relative h-[200px] bg-zinc-900 flex-shrink-0 overflow-hidden">
        {currentImage ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImgIdx}
              src={currentImage}
              alt={property.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">
            No photo uploaded
          </div>
        )}

        {/* Multi-Photo Counter Badge & Nav Controls */}
        {images.length > 1 && (
          <>
            <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
              <Camera className="h-3 w-3 text-[#f06023]" />
              <span>{currentImgIdx + 1}/{images.length}</span>
            </div>

            {/* Next / Prev Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#f06023] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer z-20"
              title="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#f06023] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md cursor-pointer z-20"
              title="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Photo Indicator Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {images.slice(0, 5).map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImgIdx(dotIdx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    dotIdx === currentImgIdx ? 'w-4 bg-[#f06023]' : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Property Type Badge */}
        <div className="absolute top-2.5 left-2.5 bg-[#f06023] text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm z-10">
          {TYPE_LABELS[property.property_type] ?? property.property_type}
        </div>

        {/* Listing Type Badge */}
        <div className="absolute top-2.5 right-2.5 bg-white/95 text-zinc-800 font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm capitalize z-10">
          For {property.listing_type}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3.5 flex-grow flex flex-col justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm text-zinc-950 line-clamp-1 mb-0.5 hover:text-[#f06023] transition-colors">
            <Link to={`/properties/${property.id}`}>{property.title}</Link>
          </h4>
          <p className="text-[10px] text-zinc-500 font-semibold mb-1.5">{property.display_zone}</p>
          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-medium">
            {property.description}
          </p>
        </div>

        <div className="pt-2 border-t border-zinc-100">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[9px] uppercase font-bold text-zinc-400">Rent Price</span>
            <span className="text-sm font-extrabold text-[#f06023]">
              {formatPrice(property.price)}
              <span className="text-[10px] font-normal text-zinc-500">
                {property.price_period || (property.listing_type === 'rent' ? '/month' : '')}
              </span>
            </span>
          </div>

          <Link to={`/properties/${property.id}`}>
            <button className="w-full bg-[#f06023] hover:bg-[#d94b12] text-white font-bold py-2.5 rounded-xl transition-all duration-300 text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer">
              <Eye className="h-3.5 w-3.5 text-white" /> View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
