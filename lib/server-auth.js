import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import { createAdminClient } from './supabase-admin';

function mapProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role || 'attendee',
    currentMode: row.current_mode || 'attendee',
    profilePicture: row.profile_picture_url,
    providerInfo: row.provider_info || {},
    createdAt: row.created_at,
  };
}

export async function getUserFromRequest(request) {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;

  const token = header.slice(7);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const admin = createAdminClient();
  if (!admin) return null;

  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return mapProfile(profile);
}

export function canAccessOrganizer(user, organizerId) {
  if (!user || !organizerId) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'provider' && user.id === organizerId) return true;
  return false;
}
