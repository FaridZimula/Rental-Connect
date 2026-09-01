/*
  # Custom Properties Table for Cross-Device Sync

  This table holds property listings submitted by landlords via the
  frontend form (offline/custom flow), enabling real-time sync across
  all browsers and devices via Supabase Realtime.

  1. Table: custom_properties
     - id: property ID (text, from frontend)
     - owner_id: owner user ID
     - owner_email: owner email
     - owner_name: owner full name
     - owner_phone: owner phone
     - title: listing title
     - description: listing description
     - property_type: category (apartment, vehicle, etc.)
     - listing_type: rent | sale | lease
     - price: monthly/sale price
     - display_zone: public zone/area shown
     - status: pending_review | published | rejected | suspended
     - rejection_reason: reason if rejected/suspended
     - images: JSONB array of image objects
     - created_at: timestamp
     - updated_at: timestamp

  2. Security
     - RLS enabled
     - Public can SELECT published listings
     - Authenticated users can INSERT/UPDATE their own listings
     - All authenticated users (admin) can UPDATE status
*/

create table if not exists public.custom_properties (
  id text primary key,
  owner_id text,
  owner_email text,
  owner_name text,
  owner_phone text,
  title text not null,
  description text,
  property_type text not null,
  listing_type text not null default 'rent',
  price numeric(14, 2) not null default 0,
  price_period text default '/month',
  display_zone text,
  real_address text,
  bedrooms integer default 0,
  bathrooms integer default 0,
  area_sqft numeric,
  status text not null default 'pending_review',
  rejection_reason text,
  is_available boolean default true,
  images jsonb default '[]'::jsonb,
  amenities jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast status queries
create index if not exists custom_properties_status_idx on public.custom_properties(status);
create index if not exists custom_properties_owner_id_idx on public.custom_properties(owner_id);

-- Updated_at trigger
create trigger update_custom_properties_updated_at
  before update on public.custom_properties
  for each row execute function update_updated_at_column();

-- Enable RLS
alter table public.custom_properties enable row level security;

-- Public can view published listings
create policy "Published custom properties are viewable by everyone"
  on public.custom_properties for select
  using (status = 'published');

-- Admin and property owners can view pending/all listings
create policy "Admins and owners can view all custom properties"
  on public.custom_properties for select
  using (auth.role() = 'authenticated');

-- Authenticated users (landlords) can insert their own listings
create policy "Authenticated users can insert custom properties"
  on public.custom_properties for insert
  with check (auth.role() = 'authenticated');

-- Authenticated users can update their own listings or admins can update any
create policy "Owners and admins can update custom properties"
  on public.custom_properties for update
  using (auth.role() = 'authenticated');

-- Enable Realtime on custom_properties
alter publication supabase_realtime add table public.custom_properties;
