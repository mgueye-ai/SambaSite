/**
 * Creates the Samba team admin account in Supabase.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Run: node scripts/create-admin.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'admin@samba.team';
const ADMIN_PASSWORD = 'SambaAdmin2026!';
const ADMIN_NAME = 'Samba Team';

function loadEnv() {
  const path = '.env.local';
  if (!existsSync(path)) return {};
  const env = {};
  readFileSync(path, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
  return env;
}

const env = { ...process.env, ...loadEnv() };
const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://lbpeyscfoutkpapfbdtg.supabase.co';
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('Get it from Supabase → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing } = await supabase
  .from('profiles')
  .select('id, email, role')
  .eq('email', ADMIN_EMAIL)
  .maybeSingle();

if (existing) {
  await supabase.from('profiles').update({ role: 'admin', name: ADMIN_NAME }).eq('id', existing.id);
  console.log('Updated existing account to admin role.');
  console.log(`Email:    ${ADMIN_EMAIL}`);
  console.log('Password: (unchanged — use existing password or reset in Supabase Auth)');
  process.exit(0);
}

const { data: created, error } = await supabase.auth.admin.createUser({
  email: ADMIN_EMAIL,
  password: ADMIN_PASSWORD,
  email_confirm: true,
  user_metadata: { name: ADMIN_NAME },
});

if (error) {
  console.error('Failed to create admin:', error.message);
  process.exit(1);
}

await supabase.from('profiles').update({
  role: 'admin',
  name: ADMIN_NAME,
  current_mode: 'provider',
}).eq('id', created.user.id);

console.log('Samba admin account created!');
console.log('');
console.log(`Email:    ${ADMIN_EMAIL}`);
console.log(`Password: ${ADMIN_PASSWORD}`);
console.log('');
console.log('Login at: /admin/login');
