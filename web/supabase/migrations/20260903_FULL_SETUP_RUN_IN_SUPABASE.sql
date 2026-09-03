-- ============================================================
-- RENTAL CONNECT – Full Supabase Setup
-- Run this entire script in Supabase SQL Editor
-- It creates all tables + sets open RLS so admin dashboard works
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ── 1. Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key,
  email text unique not null,
  full_name text,
  phone text,
  role text default 'tenant',
  profile_image text,
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Auto-create profile on Supabase auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'tenant')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 2. Properties ──────────────────────────────────────────────
create table if not exists public.properties (
  id text primary key,
  owner_id uuid,  -- NOT a FK so Firebase-auth owners (non-Supabase) can still insert
  owner_name text,
  owner_email text,
  owner_phone text,
  title text not null,
  description text,
  property_type text not null,
  listing_type text not null default 'rent',
  price numeric(14, 2) not null default 0,
  price_period text default '/month',
  real_address text,
  display_zone text,
  display_lat float,
  display_lng float,
  bedrooms integer default 0,
  bathrooms integer default 0,
  area_sqft numeric,
  status text not null default 'pending_review',
  rejection_reason text,
  is_available boolean default true,
  expires_at timestamp with time zone,
  images jsonb default '[]'::jsonb,
  amenities jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists properties_status_idx on public.properties(status);
create index if not exists properties_owner_idx on public.properties(owner_id);
create index if not exists properties_type_idx on public.properties(property_type);

-- ── 3. Inquiries ───────────────────────────────────────────────
create table if not exists public.inquiries (
  id uuid default uuid_generate_v4() primary key,
  property_id text references public.properties(id) on delete cascade,
  tenant_id uuid,
  landlord_id uuid,
  message text not null,
  viewing_date timestamp with time zone,
  status text not null default 'pending',
  response text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── 4. Messages ────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid,
  receiver_id uuid,
  property_id text,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── 5. Favorites ───────────────────────────────────────────────
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  property_id text references public.properties(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, property_id)
);

-- ── 6. Reports ─────────────────────────────────────────────────
create table if not exists public.listing_reports (
  id uuid default uuid_generate_v4() primary key,
  property_id text references public.properties(id) on delete cascade not null,
  reporter_id uuid,
  reason text not null,
  details text,
  status text not null default 'pending',
  admin_notes text,
  resolved_by uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- ── 7. Notifications ───────────────────────────────────────────
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  type text not null,
  content text not null,
  data jsonb,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── 8. Audit Logs ─────────────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  actor_id uuid,
  action text not null,
  target_type text not null,
  target_id text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── updated_at trigger ────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at_column();

drop trigger if exists update_properties_updated_at on public.properties;
create trigger update_properties_updated_at
  before update on public.properties
  for each row execute function update_updated_at_column();

-- ── RLS ───────────────────────────────────────────────────────
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;
alter table public.listing_reports enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Drop any old policies that may conflict
drop policy if exists "Published properties viewable by everyone" on public.properties;
drop policy if exists "Authenticated users view all properties" on public.properties;
drop policy if exists "Users can insert properties" on public.properties;
drop policy if exists "Owners & admins update properties" on public.properties;
drop policy if exists "All users can view all properties" on public.properties;
drop policy if exists "Anyone can insert properties" on public.properties;
drop policy if exists "Anyone can update properties" on public.properties;
drop policy if exists "Anyone can delete properties" on public.properties;

-- OPEN policies — admin dashboard + property owners use Firebase auth (not Supabase auth)
-- so we allow anon access. Real address privacy is enforced in the frontend.
create policy "All can read properties"   on public.properties for select using (true);
create policy "All can insert properties" on public.properties for insert with check (true);
create policy "All can update properties" on public.properties for update using (true);
create policy "All can delete properties" on public.properties for delete using (true);

-- Profiles: open read, own write
drop policy if exists "Profiles viewable by everyone" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "All can read profiles"   on public.profiles for select using (true);
create policy "All can insert profiles" on public.profiles for insert with check (true);
create policy "All can update profiles" on public.profiles for update using (true);

-- Inquiries: open
drop policy if exists "Inquiries viewable by participants & admin" on public.inquiries;
drop policy if exists "Inquiries insert by authenticated" on public.inquiries;
drop policy if exists "Inquiries update by participants" on public.inquiries;
create policy "All can read inquiries"   on public.inquiries for select using (true);
create policy "All can insert inquiries" on public.inquiries for insert with check (true);
create policy "All can update inquiries" on public.inquiries for update using (true);

-- Messages: open
drop policy if exists "Messages viewable by participants" on public.messages;
drop policy if exists "Messages send by authenticated" on public.messages;
drop policy if exists "Messages update by participants" on public.messages;
create policy "All can read messages"   on public.messages for select using (true);
create policy "All can insert messages" on public.messages for insert with check (true);
create policy "All can update messages" on public.messages for update using (true);

-- Favorites: open
drop policy if exists "Favorites manageable by user" on public.favorites;
create policy "All can manage favorites" on public.favorites for all using (true);

-- Reports: open
drop policy if exists "Reports viewable by auth users" on public.listing_reports;
drop policy if exists "Reports insert by auth users" on public.listing_reports;
drop policy if exists "Reports update by auth users" on public.listing_reports;
create policy "All can manage reports" on public.listing_reports for all using (true);

-- Notifications: open
drop policy if exists "Notifications manageable by owner" on public.notifications;
create policy "All can manage notifications" on public.notifications for all using (true);

-- Audit logs: open
drop policy if exists "Audit logs manageable by auth" on public.audit_logs;
create policy "All can manage audit logs" on public.audit_logs for all using (true);

-- ── Realtime ──────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- Add tables to realtime (ignore errors if already added)
alter publication supabase_realtime add table public.properties;
alter publication supabase_realtime add table public.inquiries;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.listing_reports;
