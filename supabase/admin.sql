-- Admin role support for Samba team dashboard
-- Run in Supabase SQL Editor after schema.sql
--
-- Then create admin account:
--   1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
--   2. Run: npm run create-admin
--   Or manually set role after creating user in Supabase Auth:
--   UPDATE public.profiles SET role = 'admin', name = 'Samba Team'
--   WHERE email = 'admin@samba.team';

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admins can read all profiles
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin() OR auth.uid() = id);

-- Admins can read and manage all events
DROP POLICY IF EXISTS "Admins manage all events" ON public.events;
CREATE POLICY "Admins manage all events"
  ON public.events FOR ALL
  USING (public.is_admin() OR auth.uid() = organizer_id)
  WITH CHECK (public.is_admin() OR auth.uid() = organizer_id);

-- Admins can read all tickets
DROP POLICY IF EXISTS "Admins read all tickets" ON public.tickets;
CREATE POLICY "Admins read all tickets"
  ON public.tickets FOR SELECT
  USING (public.is_admin());

-- Organizers can read tickets for their events
DROP POLICY IF EXISTS "Organizers read own event tickets" ON public.tickets;
CREATE POLICY "Organizers read own event tickets"
  ON public.tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = tickets.event_id AND e.organizer_id = auth.uid()
    )
  );
