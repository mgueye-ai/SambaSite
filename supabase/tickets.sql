-- Tickets table + policies for web purchases
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.tickets (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_number text NOT NULL,
  ticket_type text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  qr_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'upcoming',
  payment_id text,
  purchase_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tickets_event_id_idx ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS tickets_qr_code_idx ON public.tickets(qr_code);
CREATE INDEX IF NOT EXISTS tickets_buyer_email_idx ON public.tickets(buyer_email);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Allow reading tickets by QR (for scanner) and service role handles inserts
DROP POLICY IF EXISTS "Service role manages tickets" ON public.tickets;
-- Purchases use service role key — no anon insert policy needed

-- Shared event links: allow reading events open for purchase
DROP POLICY IF EXISTS "Shared events readable for purchase" ON public.events;
CREATE POLICY "Shared events readable for purchase"
  ON public.events FOR SELECT
  USING (ticket_sales_open = true);
