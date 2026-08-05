import { Link } from 'react-router-dom';
import { MapPin, Star, Bed, Bath, Zap } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

export interface PropertySummary {
  id: string;
  title: string;
  description: string;
  property_type: string;
  listing_type: 'rent' | 'sale';
  price: number | string;
  display_zone: string;
  bedrooms: number;
  bathrooms: number;
  is_featured: boolean;
  images: { image_url: string; is_primary: boolean }[];
  amenities: { amenity: { name: string } }[];
}

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
  land: 'Land',
  commercial: 'Commercial',
};

export default function PropertyCard({ property }: { property: PropertySummary }) {
  const primaryImage = property.images.find((i) => i.is_primary) ?? property.images[0];
  const amenityNames = property.amenities.map((a) => a.amenity.name);

  return (
    <Card
      interactive
      className="h-full flex flex-col bg-white border border-zinc-200 shadow-md hover:shadow-xl hover:border-[#f06023] transition-all duration-300 rounded-2xl overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">
            No photo
          </div>
        )}

        {/* Featured badge */}
        {property.is_featured && (
          <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 font-bold text-xs uppercase tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Zap className="h-3 w-3 fill-amber-900" />
            Featured
          </div>
        )}

        {/* Type pill */}
        {!property.is_featured && (
          <div className="absolute top-3 left-3 bg-[#f06023] text-white font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
            {TYPE_LABELS[property.property_type] ?? property.property_type}
          </div>
        )}

        {/* Listing type */}
        <div className="absolute top-3 right-3 bg-white/90 text-zinc-800 font-semibold text-xs px-2 py-1 rounded-full shadow-sm capitalize">
          For {property.listing_type}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="font-bold text-white leading-snug line-clamp-1">{property.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center text-sm text-zinc-500 mb-2">
            <MapPin className="h-4 w-4 mr-1 text-[#f06023] flex-shrink-0" />
            <span className="truncate">{property.display_zone}</span>
          </div>

          <p className="text-zinc-600 text-sm line-clamp-2 mb-3">{property.description}</p>

          {/* Bed / Bath */}
          {(property.bedrooms > 0 || property.bathrooms > 0) && (
            <div className="flex gap-3 mb-3 text-xs text-zinc-500">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5 text-[#f06023]" />
                  {property.bedrooms} bed
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5 text-[#f06023]" />
                  {property.bathrooms} bath
                </span>
              )}
            </div>
          )}

          {/* Amenities */}
          {amenityNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {amenityNames.slice(0, 3).map((a) => (
                <span key={a} className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs px-2 py-0.5 rounded-full">
                  {a}
                </span>
              ))}
              {amenityNames.length > 3 && (
                <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 text-xs px-2 py-0.5 rounded-full">
                  +{amenityNames.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-zinc-100 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Price</p>
              <p className="text-lg font-extrabold text-[#f06023]">
                {formatPrice(property.price)}
                {property.listing_type === 'rent' && (
                  <span className="text-xs font-normal text-zinc-500">/month</span>
                )}
              </p>
            </div>
          </div>

          <Link to={`/properties/${property.id}`}>
            <Button variant="primary" fullWidth>
              View & Connect
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
