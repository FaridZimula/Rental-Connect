export type UserRole = 'user' | 'owner' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type RoomStatus = 'available' | 'booked' | 'maintenance';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hotel {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  address: string | null;
  contact_number: string | null;
  images: string[] | null;
  amenities: string[] | null;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface Room {
  id: string;
  hotel_id: string;
  room_number: string;
  type: string;
  price: number;
  status: RoomStatus;
  description: string | null;
  images: string[] | null;
  amenities: string[] | null;
  created_at: string;
  updated_at: string;
  hotel?: Hotel;
}

export interface Booking {
  id: string;
  room_id: string;
  user_id: string;
  status: BookingStatus;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  room?: Room;
  user?: Profile;
}

export interface Review {
  id: string;
  booking_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  booking?: Booking;
  user?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  booking_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  receiver?: Profile;
  booking?: Booking;
}