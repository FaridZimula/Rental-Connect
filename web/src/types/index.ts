export type RentalCategory = 'all' | 'hostels' | 'rentals' | 'vehicles' | 'land' | 'equipment';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'owner' | 'broker';
  avatar?: string;
  university?: string;
  phone?: string;
};

export type University = {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
};

export type Room = {
  id: string;
  type: string;
  price: number;
  available: boolean;
  capacity: number;
  amenities: string[];
  imageUrls: string[];
};

export type Hostel = {
  id: string;
  name: string;
  category?: RentalCategory;
  pricePeriod?: string; // e.g. '/semester', '/month', '/day'
  description: string;
  ownerId: string;
  location: {
    address: string;
    distance: number; // distance in km
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  university: string;
  rating: number;
  reviewCount: number;
  amenities: string[];
  rooms: Room[];
  imageUrls: string[];
};

export type Review = {
  id: string;
  hostelId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

export type Booking = {
  id: string;
  userId: string;
  hostelId: string;
  roomId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  createdAt: string;
};

export type FilterOptions = {
  category?: RentalCategory;
  university?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  roomTypes?: string[];
  amenities?: string[];
  distance?: number;
};