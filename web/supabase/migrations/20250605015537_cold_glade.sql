/*
  # Enhance rooms and booking system

  1. Changes
    - Add floor number to rooms for better organization
    - Add room category for grouping similar rooms
    - Add notification preferences for brokers
    - Add booking notification table

  2. Security
    - Enable RLS on new tables
    - Add policies for notifications
*/

-- Add new columns to rooms table
alter table public.rooms add column if not exists floor_number integer;
alter table public.rooms add column if not exists room_category text;

-- Create notifications table for bookings
create table if not exists public.booking_notifications (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) not null,
  broker_id uuid references public.profiles(id) not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for notifications
create index if not exists booking_notifications_broker_idx on public.booking_notifications(broker_id);

-- Create trigger for notifications
create trigger update_booking_notifications_updated_at
  before update on public.booking_notifications
  for each row execute function update_updated_at_column();

-- Enable RLS
alter table public.booking_notifications enable row level security;

-- Create policies for notifications
create policy "Brokers can view their notifications"
  on public.booking_notifications for select
  using (auth.uid() = broker_id);

create policy "System can create notifications"
  on public.booking_notifications for insert
  with check (true);

create policy "Brokers can update their notifications"
  on public.booking_notifications for update
  using (auth.uid() = broker_id);

-- Function to automatically create broker notification on booking
create or replace function notify_broker_on_booking()
returns trigger as $$
declare
  broker_id uuid;
begin
  -- Get the broker ID (assuming broker is the hotel owner for now)
  select owner_id into broker_id
  from hotels
  where id = (
    select hotel_id 
    from rooms 
    where id = new.room_id
  );

  -- Create notification
  insert into booking_notifications (booking_id, broker_id)
  values (new.id, broker_id);

  return new;
end;
$$ language plpgsql;

-- Create trigger for broker notifications
create trigger booking_notification_trigger
  after insert on public.bookings
  for each row execute function notify_broker_on_booking();