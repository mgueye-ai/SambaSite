// Synced from Samba/.env — public keys safe to embed as fallbacks for Vercel builds
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://lbpeyscfoutkpapfbdtg.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxicGV5c2Nmb3V0a3BhcGZiZHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5OTQ4NDMsImV4cCI6MjA5NTU3MDg0M30._k5yt5dj-6wciMPLk0H9m5v6q6Yc6IMhSkqxGwuSrDc';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://samba-site-woad.vercel.app';

export const SERVICE_FEE_RATE = 0.1;
