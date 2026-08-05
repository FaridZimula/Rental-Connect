import { motion } from 'framer-motion';
import { DoorClosed, Check, X, Users } from 'lucide-react';
import { Room } from '../../../types';
import Button from '../../ui/Button';

type RoomCardProps = {
  room: Room;
  onBookClick: (roomId: string) => void;
};

const RoomCard = ({ room, onBookClick }: RoomCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="relative h-48">
        <img
          src={room.imageUrls[0]}
          alt={`${room.type} Room`}
          className="w-full h-full object-cover rounded-t-xl"
        />
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
          room.available 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {room.available ? (
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Available
            </div>
          ) : (
            <div className="flex items-center">
              <X className="h-4 w-4 mr-1" />
              Occupied
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold">{room.type} Room</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <Users className="h-4 w-4 mr-1" />
              Capacity: {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
            </div>
          </div>
          <p className="text-xl font-bold text-primary-900">
            {formatPrice(room.price)}
            <span className="text-sm font-normal text-gray-600">/semester</span>
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
          
          <Button
            variant={room.available ? 'primary' : 'outline'}
            fullWidth
            disabled={!room.available}
            icon={<DoorClosed className="h-4 w-4" />}
            iconPosition="left"
            onClick={() => room.available && onBookClick(room.id)}
          >
            {room.available ? 'Book Now' : 'Not Available'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;