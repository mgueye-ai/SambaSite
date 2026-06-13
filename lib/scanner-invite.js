import { createAnonClient } from './ticket-share';

export async function fetchScannerInvitePreview(token) {
  if (!token?.trim()) return null;

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc('preview_scanner_invite', {
    p_invite_token: token.trim(),
  });

  if (error || !data) return null;

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.eventTitle) return null;

  return {
    eventTitle: row.eventTitle,
    eventDate: row.eventDate,
    eventImage: row.eventImage || null,
    eventVenue: row.eventVenue || null,
    organizerName: row.organizerName || null,
    eventStatus: row.eventStatus || null,
  };
}
