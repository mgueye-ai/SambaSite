import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

export function createAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function fetchTicketSharePreview(token) {
  if (!token?.trim()) return null;

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc('preview_ticket_share', {
    p_share_token: token.trim(),
  });

  if (error || !data) return null;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.eventTitle) return null;

  return {
    eventTitle: row.eventTitle,
    eventDate: row.eventDate,
    eventImage: row.eventImage || null,
    status: row.status || 'active',
    alreadyClaimed: Boolean(row.alreadyClaimed),
  };
}

export function formatShareEventDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
