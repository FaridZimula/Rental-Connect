-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type user_role as enum ('user', 'owner', 'admin');
create type booking_status as enum ('pending', 'confirmed', 'cancelled');
create type room_status as enum ('available', 'booked', 'maintenance');

-- Create users table with auth integration
create table public.profiles (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  role user_role default 'user',
  phone_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create hotels table
create table public.hotels (
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

-- Create rooms table
create table public.rooms (
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

-- Create bookings table
create table public.bookings (
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

-- Create reviews table
create table public.reviews (
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

-- Create messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  booking_id uuid references public.bookings(id),
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index hotels_owner_id_idx on public.hotels(owner_id);
create index rooms_hotel_id_idx on public.rooms(hotel_id);
create index bookings_user_id_idx on public.bookings(user_id);
create index bookings_room_id_idx on public.bookings(room_id);
create index reviews_booking_id_idx on public.reviews(booking_id);
create index messages_sender_receiver_idx on public.messages(sender_id, receiver_id);

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.hotels enable row level security;
alter table public.rooms enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

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