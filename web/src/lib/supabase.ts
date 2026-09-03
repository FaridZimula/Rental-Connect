import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { Profile, Hotel, Room, Booking, Review, Message } from './types';

const realUrl = 'https://hxajngbvozjogbcxtnxj.supabase.co';
const realAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YWpuZ2J2b3pqb2diY3h0bnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjI0NzcsImV4cCI6MjEwMzkzODQ3N30.YHZp8g37gbs0oNAv_7dlsJ5A9oqTGRVmclIefS9zIyU';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
    ? import.meta.env.VITE_SUPABASE_URL
    : realUrl;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder')
    ? import.meta.env.VITE_SUPABASE_ANON_KEY
    : realAnonKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const db = {
  profiles: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async update(id: string, profile: Partial<Profile>) {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },
  
  hotels: {
    async getAll() {
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          *,
          owner:profiles!hotels_owner_id_fkey(*)
        `);
      
      if (error) throw error;
      return data;
    },
    
    async getById(id: string) {
      const { data, error } = await supabase
        .from('hotels')
        .select(`
          *,
          owner:profiles!hotels_owner_id_fkey(*),
          rooms(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async create(hotel: Partial<Hotel>) {
      const { data, error } = await supabase
        .from('hotels')
        .insert(hotel)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },
  
  rooms: {
    async getByHotel(hotelId: string) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', hotelId);
      
      if (error) throw error;
      return data;
    },
    
    async update(id: string, room: Partial<Room>) {
      const { data, error } = await supabase
        .from('rooms')
        .update(room)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },
  
  bookings: {
    async create(booking: Partial<Booking>) {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async getByUser(userId: string) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms(*),
          user:profiles(*)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    
    async getByHotel(hotelId: string) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms!inner(*),
          user:profiles(*)
        `)
        .eq('room.hotel_id', hotelId);
      
      if (error) throw error;
      return data;
    }
  },
  
  reviews: {
    async getByHotel(hotelId: string) {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          booking:bookings!inner(
            *,
            room:rooms!inner(*)
          ),
          user:profiles(*)
        `)
        .eq('booking.room.hotel_id', hotelId);
      
      if (error) throw error;
      return data;
    },
    
    async create(review: Partial<Review>) {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },
  
  messages: {
    async getConversation(userId: string, otherId: string) {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          receiver:profiles!messages_receiver_id_fkey(*)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .or(`sender_id.eq.${otherId},receiver_id.eq.${otherId}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    
    async send(message: Partial<Message>) {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async markAsRead(messageIds: string[]) {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);
      
      if (error) throw error;
    }
  }
};