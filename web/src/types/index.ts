export type UserRole = 'tenant' | 'landlord' | 'admin';

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'studio'
  | 'hostel'
  | 'commercial'
  | 'land'
  | 'vehicle'
  | 'machinery'
  | 'event_equipment'
  | 'event_venue'
  | 'agro_machinery';

export type ListingType = 'rent' | 'lease' | 'sale';

export type PropertyStatus = 'pending_review' | 'published' | 'rejected' | 'suspended' | 'expired';

export type InquiryStatus = 'pending' | 'responded' | 'closed';

export type ReportReason = 'fraudulent' | 'duplicate' | 'outdated' | 'misleading' | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'action_taken' | 'dismissed';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profile_image?: string;
  is_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Amenity {
  id: string;
  name: string;
}

export interface PropertyAmenity {
  property_id: string;
  amenity_id: string;
  amenity: Amenity;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number | string;
  price_period?: string; // e.g. '/month', '/day', '/event'
  real_address?: string;
  display_zone: string;
  display_lat?: number;
  display_lng?: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  status: PropertyStatus;
  rejection_reason?: string;
  is_available: boolean;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
  images?: PropertyImage[];
  amenities?: PropertyAmenity[];
  owner?: Partial<User>;
  _count?: {
    inquiries?: number;
    reviews?: number;
  };
}

export interface Inquiry {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  message: string;
  viewing_date?: string;
  status: InquiryStatus;
  response?: string;
  responded_at?: string;
  created_at: string;
  property?: Partial<Property>;
  tenant?: Partial<User>;
  landlord?: Partial<User>;
}

export interface ListingReport {
  id: string;
  property_id: string;
  reporter_id: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  admin_notes?: string;
  resolved_by?: string;
  created_at: string;
  resolved_at?: string;
  property?: Partial<Property>;
  reporter?: Partial<User>;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action: string;
  target_type: string;
  target_id: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user?: {
    full_name: string;
  };
}

export interface FilterState {
  search: string;
  listing_type: string;
  property_type: string;
  price_min?: string;
  price_max: string;
  bedrooms: string;
  zone: string;
}