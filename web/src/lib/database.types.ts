export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: string;
          profile_image: string | null;
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          profile_image?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: string;
          profile_image?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string | null;
          owner_name: string | null;
          owner_email: string | null;
          owner_phone: string | null;
          title: string;
          description: string | null;
          property_type: string;
          listing_type: string;
          price: number;
          price_period: string | null;
          real_address: string | null;
          display_zone: string | null;
          display_lat: number | null;
          display_lng: number | null;
          bedrooms: number;
          bathrooms: number;
          area_sqft: number | null;
          status: string;
          rejection_reason: string | null;
          is_available: boolean;
          expires_at: string | null;
          images: Json;
          amenities: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          owner_id?: string | null;
          owner_name?: string | null;
          owner_email?: string | null;
          owner_phone?: string | null;
          title: string;
          description?: string | null;
          property_type: string;
          listing_type?: string;
          price?: number;
          price_period?: string | null;
          real_address?: string | null;
          display_zone?: string | null;
          display_lat?: number | null;
          display_lng?: number | null;
          bedrooms?: number;
          bathrooms?: number;
          area_sqft?: number | null;
          status?: string;
          rejection_reason?: string | null;
          is_available?: boolean;
          expires_at?: string | null;
          images?: Json;
          amenities?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          property_type?: string;
          listing_type?: string;
          price?: number;
          price_period?: string | null;
          real_address?: string | null;
          display_zone?: string | null;
          bedrooms?: number;
          bathrooms?: number;
          area_sqft?: number | null;
          status?: string;
          rejection_reason?: string | null;
          is_available?: boolean;
          images?: Json;
          amenities?: Json;
          updated_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          property_id: string;
          tenant_id: string;
          landlord_id: string;
          message: string;
          viewing_date: string | null;
          status: string;
          response: string | null;
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          tenant_id: string;
          landlord_id: string;
          message: string;
          viewing_date?: string | null;
          status?: string;
          response?: string | null;
          responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: string;
          response?: string | null;
          responded_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          property_id: string | null;
          inquiry_id: string | null;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          property_id?: string | null;
          inquiry_id?: string | null;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {};
      };
      listing_reports: {
        Row: {
          id: string;
          property_id: string;
          reporter_id: string;
          reason: string;
          details: string | null;
          status: string;
          admin_notes: string | null;
          resolved_by: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          reporter_id: string;
          reason: string;
          details?: string | null;
          status?: string;
          admin_notes?: string | null;
          resolved_by?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          status?: string;
          admin_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          content: string;
          data: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          content: string;
          data?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          target_type: string;
          target_id: string;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          target_type: string;
          target_id: string;
          details?: Json;
          created_at?: string;
        };
        Update: {};
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, any>;
        Returns: any;
      };
    };
    Enums: {
      [key: string]: string[];
    };
  };
}
