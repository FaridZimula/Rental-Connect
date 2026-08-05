-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types if they don't exist
do $$ begin
  create type user_role as enum ('user', 'owner', 'admin');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'cancelled');
  exception when duplicate_object then null;
end $$;

do $$ begin
  create type room_status as enum ('available', 'booked', 'maintenance');
  exception when duplicate_object then null;
end $$;

-- Create tables if they don't exist
create table if not exists public.profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  role user_role default 'user',
  phone_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.hotels (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) not null,
  name text not null,
  description text,
  address text,
  contact_number text,
  images text[],
  amenities text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.rooms (
  id uuid default uuid_generate_v4() primary key,
  hotel_id uuid references public.hotels(id) not null,
  room_number text not null,
  type text not null,
  price decimal(10,2) not null,
  status room_status default 'available',
  description text,
  images text[],
  amenities text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(hotel_id, room_number)
);

create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms(id) not null,
  user_id uuid references public.profiles(id) not null,
  status booking_status default 'pending',
  check_in_date date not null,
  check_out_date date not null,
  total_price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) not null,
  user_id uuid references public.profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(booking_id, user_id)
);

create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  booking_id uuid references public.bookings(id),
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes if they don't exist
create index if not exists hotels_owner_id_idx on public.hotels(owner_id);
create index if not exists rooms_hotel_id_idx on public.rooms(hotel_id);
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_room_id_idx on public.bookings(room_id);
create index if not exists reviews_booking_id_idx on public.reviews(booking_id);
create index if not exists messages_sender_receiver_idx on public.messages(sender_id, receiver_id);

-- Create updated_at trigger function if it doesn't exist
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Drop existing triggers if they exist
drop trigger if exists update_profiles_updated_at on public.profiles;
drop trigger if exists update_hotels_updated_at on public.hotels;
drop trigger if exists update_rooms_updated_at on public.rooms;
drop trigger if exists update_bookings_updated_at on public.bookings;
drop trigger if exists update_reviews_updated_at on public.reviews;
drop trigger if exists update_messages_updated_at on public.messages;

-- Create triggers
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function update_updated_at_column();

create trigger update_hotels_updated_at
  before update on public.hotels
  for each row execute function update_updated_at_column();

create trigger update_rooms_updated_at
  before update on public.rooms
  for each row execute function update_updated_at_column();

create trigger update_bookings_updated_at
  before update on public.bookings
  for each row execute function update_updated_at_column();

create trigger update_reviews_updated_at
  before update on public.reviews
  for each row execute function update_updated_at_column();

create trigger update_messages_updated_at
  before update on public.messages
  for each row execute function update_updated_at_column();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.hotels enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Hotels are viewable by everyone" on public.hotels;
drop policy if exists "Hotel owners can insert/update their hotels" on public.hotels;
drop policy if exists "Rooms are viewable by everyone" on public.rooms;
drop policy if exists "Hotel owners can manage their rooms" on public.rooms;
drop policy if exists "Users can view their bookings" on public.bookings;
drop policy if exists "Users can create bookings" on public.bookings;
drop policy if exists "Users can update their bookings" on public.bookings;
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
drop policy if exists "Users can create reviews for their bookings" on public.reviews;
drop policy if exists "Users can update their reviews" on public.reviews;
drop policy if exists "Messages are viewable by participants" on public.messages;
drop policy if exists "Users can send messages" on public.messages;
drop policy if exists "Users can update their sent messages" on public.messages;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Hotels are viewable by everyone"
  on public.hotels for select
  using (true);

create policy "Hotel owners can insert/update their hotels"
  on public.hotels for all
  using (auth.uid() = owner_id);

create policy "Rooms are viewable by everyone"
  on public.rooms for select
  using (true);

create policy "Hotel owners can manage their rooms"
  on public.rooms for all
  using (
    auth.uid() in (
      select owner_id from public.hotels
      where id = hotel_id
    )
  );

create policy "Users can view their bookings"
  on public.bookings for select
  using (
    auth.uid() = user_id or
    auth.uid() in (
      select owner_id from public.hotels
      where id = (
        select hotel_id from public.rooms
        where id = room_id
      )
    )
  );

create policy "Users can create bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their bookings"
  on public.bookings for update
  using (
    auth.uid() = user_id or
    auth.uid() in (
      select owner_id from public.hotels
      where id = (
        select hotel_id from public.rooms
        where id = room_id
      )
    )
  );

create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "Users can create reviews for their bookings"
  on public.reviews for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.bookings
      where id = booking_id
      and user_id = auth.uid()
      and status = 'confirmed'
    )
  );

create policy "Users can update their reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Messages are viewable by participants"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can update their sent messages"
  on public.messages for update
  using (auth.uid() = sender_id);