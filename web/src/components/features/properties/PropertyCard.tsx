import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
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
  const primaryImage = property.images?.find((i) => i.is_primary) ?? property.images?.[0];

  return (
    <div
      className="w-full max-w-[280px] mx-auto bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#f06023] transition-all duration-300 flex flex-col"
      style={{ height: '400px' }}
    >
      {/* Media Section */}
      <div className="relative h-40 bg-zinc-100 flex-shrink-0">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs">
            No photo uploaded
          </div>
        )}

        {/* Property Type Badge */}
        <div className="absolute top-2.5 left-2.5 bg-[#f06023] text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
          {TYPE_LABELS[property.property_type] ?? property.property_type}
        </div>

        {/* Listing Type Badge */}
        <div className="absolute top-2.5 right-2.5 bg-white/95 text-zinc-800 font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm capitalize">
          For {property.listing_type}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-sm text-zinc-950 line-clamp-1 mb-1 hover:text-[#f06023] transition-colors">
            <Link to={`/properties/${property.id}`}>{property.title}</Link>
          </h4>
          <p className="text-[10px] text-zinc-500 font-semibold mb-2">{property.display_zone}</p>
          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-medium">
            {property.description}
          </p>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex flex-col justify-end">
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
