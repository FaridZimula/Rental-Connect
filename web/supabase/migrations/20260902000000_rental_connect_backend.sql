-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ── 1. Profiles Table ──────────────────────────────────────────────────────────
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

-- Auto-create profile upon auth user creation
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

-- ── 2. Properties Table ───────────────────────────────────────────────────────
create table if not exists public.properties (
  id text primary key,
  owner_id uuid references public.profiles(id),
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
create index if not exists properties_owner_id_idx on public.properties(owner_id);
create index if not exists properties_property_type_idx on public.properties(property_type);
create index if not exists properties_listing_type_idx on public.properties(listing_type);

-- ── 3. Inquiries Table ────────────────────────────────────────────────────────
create table if not exists public.inquiries (
  id uuid default uuid_generate_v4() primary key,
  property_id text references public.properties(id) on delete cascade,
  tenant_id uuid references public.profiles(id),
  landlord_id uuid references public.profiles(id),
  message text not null,
  viewing_date timestamp with time zone,
  status text not null default 'pending',
  response text,
  responded_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists inquiries_property_idx on public.inquiries(property_id);
create index if not exists inquiries_tenant_idx on public.inquiries(tenant_id);
create index if not exists inquiries_landlord_idx on public.inquiries(landlord_id);

-- ── 4. Messages / Live Chat Table ─────────────────────────────────────────────
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  property_id text,
  inquiry_id uuid references public.inquiries(id) on delete set null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists messages_sender_receiver_idx on public.messages(sender_id, receiver_id);

-- ── 5. Favorites Table ────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  property_id text references public.properties(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, property_id)
);

-- ── 6. Listing Reports Table ──────────────────────────────────────────────────
create table if not exists public.listing_reports (
  id uuid default uuid_generate_v4() primary key,
  property_id text references public.properties(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) not null,
  reason text not null,
  details text,
  status text not null default 'pending',
  admin_notes text,
  resolved_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

create index if not exists reports_status_idx on public.listing_reports(status);

-- ── 7. Notifications Table ────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  content text not null,
  data jsonb,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists notifications_user_idx on public.notifications(user_id);

-- ── 8. Audit Logs Table ───────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── Triggers for updated_at ───────────────────────────────────────────────────
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

-- ── Row Level Security (RLS) ──────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;
alter table public.listing_reports enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles RLS
drop policy if exists "Profiles viewable by everyone" on public.profiles;
create policy "Profiles viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Properties RLS
drop policy if exists "Published properties viewable by everyone" on public.properties;
create policy "Published properties viewable by everyone" on public.properties for select using (status = 'published');

drop policy if exists "Authenticated users view all properties" on public.properties;
create policy "Authenticated users view all properties" on public.properties for select using (auth.role() = 'authenticated');

drop policy if exists "Users can insert properties" on public.properties;
create policy "Users can insert properties" on public.properties for insert with check (auth.role() = 'authenticated');

drop policy if exists "Owners & admins update properties" on public.properties;
create policy "Owners & admins update properties" on public.properties for update using (auth.role() = 'authenticated');

-- Inquiries RLS
drop policy if exists "Inquiries viewable by participants & admin" on public.inquiries;
create policy "Inquiries viewable by participants & admin" on public.inquiries for select using (auth.role() = 'authenticated');

drop policy if exists "Inquiries insert by authenticated" on public.inquiries;
create policy "Inquiries insert by authenticated" on public.inquiries for insert with check (auth.role() = 'authenticated');

drop policy if exists "Inquiries update by participants" on public.inquiries;
create policy "Inquiries update by participants" on public.inquiries for update using (auth.role() = 'authenticated');

-- Messages RLS
drop policy if exists "Messages viewable by participants" on public.messages;
create policy "Messages viewable by participants" on public.messages for select using (auth.role() = 'authenticated');

drop policy if exists "Messages send by authenticated" on public.messages;
create policy "Messages send by authenticated" on public.messages for insert with check (auth.role() = 'authenticated');

drop policy if exists "Messages update by participants" on public.messages;
create policy "Messages update by participants" on public.messages for update using (auth.role() = 'authenticated');

-- Favorites RLS
drop policy if exists "Favorites manageable by user" on public.favorites;
create policy "Favorites manageable by user" on public.favorites for all using (auth.role() = 'authenticated');

-- Reports RLS
drop policy if exists "Reports viewable by auth users" on public.listing_reports;
create policy "Reports viewable by auth users" on public.listing_reports for select using (auth.role() = 'authenticated');

drop policy if exists "Reports insert by auth users" on public.listing_reports;
create policy "Reports insert by auth users" on public.listing_reports for insert with check (auth.role() = 'authenticated');

drop policy if exists "Reports update by auth users" on public.listing_reports;
create policy "Reports update by auth users" on public.listing_reports for update using (auth.role() = 'authenticated');

-- Notifications RLS
drop policy if exists "Notifications manageable by owner" on public.notifications;
create policy "Notifications manageable by owner" on public.notifications for all using (auth.role() = 'authenticated');

-- Audit Logs RLS
drop policy if exists "Audit logs manageable by auth" on public.audit_logs;
create policy "Audit logs manageable by auth" on public.audit_logs for all using (auth.role() = 'authenticated');

-- ── Realtime Publication Setup ────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.properties;
alter publication supabase_realtime add table public.inquiries;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.listing_reports;
