import { getBrowserClient } from './supabase';

export async function getAccessToken() {
  const { data } = await getBrowserClient().auth.getSession();
  return data.session?.access_token || null;
}

export async function apiFetch(path, options = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
