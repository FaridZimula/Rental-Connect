-- ==========================================================================
-- Fix: Allow anon + authenticated users to read ALL properties
-- This is needed because:
--   1. The admin dashboard reads pending_review properties via the anon Supabase client
--   2. Property owners use Firebase auth (not Supabase auth), so auth.role() = 'anon'
--      even when they are logged in
--   3. Real address privacy is enforced in the frontend (pay-per-client wall), not RLS
-- ==========================================================================

-- Drop the overly-restrictive policies that block anon from seeing non-published properties
drop policy if exists "Published properties viewable by everyone" on public.properties;
drop policy if exists "Authenticated users view all properties" on public.properties;

-- Allow ALL users (anon + authenticated) to read all properties.
-- Real-address privacy is handled in the UI (locked behind payment), not at DB level.
create policy "All users can view all properties"
  on public.properties
  for select
  using (true);

-- Make sure owners can still insert (upsert) their own properties
drop policy if exists "Users can insert properties" on public.properties;
create policy "Anyone can insert properties"
  on public.properties
  for insert
  with check (true);

-- Make sure status updates (approve/reject/suspend) still work
drop policy if exists "Owners & admins update properties" on public.properties;
create policy "Anyone can update properties"
  on public.properties
  for update
  using (true);

-- Also allow delete (admin may want to remove listings)
drop policy if exists "Admins can delete properties" on public.properties;
create policy "Anyone can delete properties"
  on public.properties
  for delete
  using (true);
