import { Link } from 'react-router-dom';
import { Star, MapPin, DoorOpen } from 'lucide-react';
import { Hostel } from '../../../types';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

type HostelCardProps = {
  hostel: Hostel;
};

const HostelCard = ({ hostel }: HostelCardProps) => {
  // Get room availability stats
  const availableRooms = hostel.rooms.filter(room => room.available).length;
  const totalRooms = hostel.rooms.length;
  
  // Get the cheapest room price
  const cheapestRoom = hostel.rooms.reduce(
    (min, room) => (room.price < min ? room.price : min),
    hostel.rooms[0]?.price || 0
  );

  // Format price in UGX
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card interactive className="h-full flex flex-col bg-white border border-zinc-200 shadow-md hover:shadow-xl hover:border-[#f06023] transition-all duration-300 rounded-2xl overflow-hidden">
      <div className="relative h-48">
        <img
          src={hostel.imageUrls[0]}
          alt={hostel.name}
          className="w-full h-full object-cover"
        />
        {/* Category Pill */}
        <div className="absolute top-3 left-3 bg-[#f06023] text-white font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
          {hostel.category || 'hostels'}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white p-3">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-lg text-white leading-snug">{hostel.name}</h3>
            <div className="flex items-center bg-[#f06023] text-white font-bold px-2 py-0.5 rounded-full text-xs shadow-md">
              <Star className="h-3 w-3 mr-1 fill-white text-white" />
              {hostel.rating}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col justify-between text-zinc-900 bg-white">
        <div>
          <div className="flex items-center text-sm text-zinc-500 mb-2">
            <MapPin className="h-4 w-4 mr-1 text-[#f06023]" />
            <span>{hostel.location.address}</span>
          </div>
          
          <p className="text-zinc-600 mb-3 text-sm line-clamp-2">{hostel.description}</p>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {hostel.amenities.slice(0, 3).map((amenity, index) => (
              <span key={index} className="bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {amenity}
              </span>
            ))}
            {hostel.amenities.length > 3 && (
              <span className="bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                +{hostel.amenities.length - 3}
              </span>
            )}
          </div>
          
          {/* Room / Unit Availability */}
          <div className="flex items-center mb-4 text-sm">
            <DoorOpen className="h-4 w-4 mr-1 text-[#f06023]" />
            <span className="text-zinc-600 font-medium">
              {availableRooms} of {totalRooms} units available
            </span>
          </div>
        </div>
        
        <div className="space-y-3 pt-2 border-t border-zinc-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Rate</p>
              <p className="text-lg font-extrabold text-[#f06023]">
                {formatPrice(cheapestRoom)}
                <span className="text-xs font-normal text-zinc-500">{hostel.pricePeriod || '/month'}</span>
              </p>
            </div>
            <div className="bg-[#f06023]/10 text-[#f06023] border border-[#f06023]/30 text-xs font-semibold rounded-full px-3 py-1">
              {hostel.university.split(' ')[0]}
            </div>
          </div>
          
          <Link to={`/hostels/${hostel.id}`}>
            <Button
              variant="primary"
              fullWidth
              icon={<DoorOpen className="h-4 w-4 text-white" />}
              iconPosition="left"
            >
              View Details & Rent
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default HostelCard;