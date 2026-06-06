/**
 * Seeds rich mock data for the dashboard.
 * Run: node scripts/seed-mock-data.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

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
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Find organizer ─────────────────────────────────────────────────────────
const { data: profiles } = await db.from('profiles').select('id, email, name').eq('role', 'provider');
const organizer = profiles?.[0];
if (!organizer) { console.error('No provider profile found.'); process.exit(1); }
console.log(`Seeding for: ${organizer.email} (${organizer.id})`);

// ── Helpers ────────────────────────────────────────────────────────────────
const uid = () => `${Date.now()}${Math.random().toString(36).slice(2, 9)}`;
const daysAgo = (n) => new Date(Date.now() - n * 86400_000).toISOString();
const daysAhead = (n) => new Date(Date.now() + n * 86400_000).toISOString();
const addHours = (iso, h) => new Date(new Date(iso).getTime() + h * 3_600_000).toISOString();

const GUESTS = [
  { name: 'Marcus Johnson', email: 'marcus.j@gmail.com' },
  { name: 'Ava Williams', email: 'ava.w@icloud.com' },
  { name: 'Liam Brown', email: 'liam.b@gmail.com' },
  { name: 'Sophia Davis', email: 'sophia.d@yahoo.com' },
  { name: 'Noah Wilson', email: 'noah.w@gmail.com' },
  { name: 'Isabella Moore', email: 'bella.moore@outlook.com' },
  { name: 'Elijah Taylor', email: 'elijah.t@gmail.com' },
  { name: 'Mia Anderson', email: 'mia.anderson@icloud.com' },
  { name: 'James Thomas', email: 'james.t@gmail.com' },
  { name: 'Charlotte Jackson', email: 'charlotte.j@yahoo.com' },
  { name: 'Oliver White', email: 'oliver.w@gmail.com' },
  { name: 'Amelia Harris', email: 'amelia.h@icloud.com' },
  { name: 'Benjamin Martin', email: 'ben.martin@gmail.com' },
  { name: 'Evelyn Thompson', email: 'evelyn.t@outlook.com' },
  { name: 'Lucas Garcia', email: 'lucas.g@gmail.com' },
  { name: 'Harper Martinez', email: 'harper.m@icloud.com' },
  { name: 'Mason Robinson', email: 'mason.r@gmail.com' },
  { name: 'Abigail Clark', email: 'abby.clark@yahoo.com' },
  { name: 'Ethan Lewis', email: 'ethan.l@gmail.com' },
  { name: 'Emily Lee', email: 'emily.lee@icloud.com' },
  { name: 'Alexander Walker', email: 'alex.w@gmail.com' },
  { name: 'Scarlett Hall', email: 'scarlett.h@yahoo.com' },
  { name: 'Michael Allen', email: 'mike.allen@gmail.com' },
  { name: 'Victoria Young', email: 'vicky.y@icloud.com' },
];

// ── Event definitions ──────────────────────────────────────────────────────
const EVENT_DEFS = [
  {
    title: 'Midnight Gala',
    description: 'An exclusive evening of music, art, and culture under the stars. Featuring live performances, curated art installations, and a full open bar experience.',
    daysAgo: 14,
    durationHours: 4,
    venue: 'The Grand Pavilion',
    address: { street: '200 Riverside Dr', city: 'New York', state: 'NY', zipCode: '10025', formatted: '200 Riverside Dr, New York, NY 10025' },
    tickets: [
      { name: 'General Admission', price: 45, qty: 150, sold: 122 },
      { name: 'VIP', price: 120, qty: 40, sold: 35 },
    ],
    guestCount: 22,
    checkinPct: 0.80,
  },
  {
    title: 'Sunday Brunch Sessions',
    description: 'Live jazz, bottomless brunch, good vibes only. Join us every Sunday for an unforgettable afternoon.',
    daysAgo: 7,
    durationHours: 3,
    venue: 'Rooftop at The 5th',
    address: { street: '5 West 35th St', city: 'New York', state: 'NY', zipCode: '10001', formatted: '5 West 35th St, New York, NY 10001' },
    tickets: [
      { name: 'Brunch + Jazz', price: 65, qty: 80, sold: 68 },
    ],
    guestCount: 14,
    checkinPct: 0.90,
  },
  {
    title: 'Brooklyn Art Collective',
    description: 'A night celebrating emerging Brooklyn artists. Live painting, sculpture, and spoken word in a raw industrial space.',
    daysAgo: 30,
    durationHours: 5,
    venue: 'Industry City Lofts',
    address: { street: '220 36th St', city: 'Brooklyn', state: 'NY', zipCode: '11232', formatted: '220 36th St, Brooklyn, NY 11232' },
    tickets: [
      { name: 'Art Lover', price: 30, qty: 200, sold: 188 },
      { name: 'Patron Circle', price: 85, qty: 25, sold: 24 },
    ],
    guestCount: 20,
    checkinPct: 0.95,
  },
  {
    title: 'Summer Rooftop Rave',
    description: "House music all night long with NYC's finest DJs. Open bar, rooftop views, and good energy all night.",
    daysAhead: 10,
    durationHours: 5,
    venue: 'Sky Lounge',
    address: { street: '230 5th Ave', city: 'New York', state: 'NY', zipCode: '10001', formatted: '230 5th Ave, New York, NY 10001' },
    tickets: [
      { name: 'Early Bird', price: 25, qty: 100, sold: 60 },
      { name: 'General', price: 40, qty: 200, sold: 70 },
      { name: 'VIP Table', price: 200, qty: 20, sold: 8 },
    ],
    guestCount: 0,
    checkinPct: 0,
  },
  {
    title: 'Afrobeats Night',
    description: 'The hottest Afrobeats night in the city. Two floors, three DJs, and vibes that last till sunrise.',
    daysAhead: 22,
    durationHours: 6,
    venue: 'LIV Nightclub',
    address: { street: '49 W 27th St', city: 'New York', state: 'NY', zipCode: '10001', formatted: '49 W 27th St, New York, NY 10001' },
    tickets: [
      { name: 'General', price: 35, qty: 300, sold: 145 },
      { name: 'VIP', price: 100, qty: 50, sold: 22 },
    ],
    guestCount: 0,
    checkinPct: 0,
  },
];

// ── Delete old seeded events ───────────────────────────────────────────────
const titles = EVENT_DEFS.map(e => e.title);
const { data: oldEvents } = await db.from('events').select('id').in('title', titles).eq('organizer_id', organizer.id);
if (oldEvents?.length) {
  const oldIds = oldEvents.map(e => e.id);
  await db.from('ticket_orders').delete().in('event_id', oldIds);
  await db.from('tickets').delete().in('event_id', oldIds);
  await db.from('events').delete().in('id', oldIds);
  console.log(`Cleaned up ${oldIds.length} old seeded events`);
}

// ── Insert events + tickets ────────────────────────────────────────────────
for (const def of EVENT_DEFS) {
  const startIso = def.daysAgo != null ? daysAgo(def.daysAgo) : daysAhead(def.daysAhead);
  const endIso = addHours(startIso, def.durationHours);
  const isPast = def.daysAgo != null;
  const isUpcoming = !isPast;

  const ticketDefs = def.tickets.map(t => ({
    id: uid(),
    name: t.name,
    price: t.price,
    isFree: false,
    quantity: t.qty,
    isUnlimited: false,
    availableQuantity: t.qty - t.sold,
    sold: t.sold,
    includes: [],
  }));

  const bookedSpots = def.tickets.reduce((s, t) => s + t.sold, 0);
  const totalSpots = def.tickets.reduce((s, t) => s + t.qty, 0);

  const eventRow = {
    id: uid(),
    title: def.title,
    description: def.description,
    date: startIso,
    start_time: startIso,
    end_time: endIso,
    has_end_time: true,
    venue: def.venue,
    address: def.address,
    status: isPast ? 'completed' : 'upcoming',
    tickets: ticketDefs,
    ticket_sales_open: isUpcoming,
    show_on_explore: true,
    booked_spots: bookedSpots,
    total_spots: totalSpots,
    spots_left: totalSpots - bookedSpots,
    organizer_id: organizer.id,
    organizer: { id: organizer.id, name: organizer.name },
    cover_image: null,
    flyers: [],
    category: 'Event',
    created_at: daysAgo((def.daysAgo || 0) + 20),
    updated_at: startIso,
  };

  const { error: evErr } = await db.from('events').insert(eventRow);
  if (evErr) { console.error(`Event "${def.title}" error:`, evErr.message); continue; }
  console.log(`  ✓ Event: ${def.title}`);

  // Only seed guests for past events
  if (def.guestCount === 0) continue;

  const ticketOrderRows = [];
  const ticketRows = [];
  const ticketNumber = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

  for (let i = 0; i < def.guestCount; i++) {
    const guest = GUESTS[i % GUESTS.length];
    const ticketDef = def.tickets[i % def.tickets.length];
    const checkedIn = i < Math.floor(def.guestCount * def.checkinPct);
    const orderId = uid();
    const paymentId = `demo_${uid()}`;

    ticketOrderRows.push({
      id: orderId,
      event_id: eventRow.id,
      ticket_number: ticketNumber,
      buyer_name: guest.name,
      buyer_email: guest.email,
      payment_id: paymentId,
      payment_status: 'completed',
    });

    ticketRows.push({
      id: uid(),
      event_id: eventRow.id,
      order_id: orderId,
      ticket_number: ticketNumber,
      ticket_type: ticketDef.name,
      price: ticketDef.price,
      is_free: false,
      buyer_name: guest.name,
      buyer_email: guest.email,
      qr_code: `qr_${uid()}`,
      status: checkedIn ? 'used' : 'upcoming',
      payment_id: paymentId,
    });
  }

  // Insert orders first (tickets FK references orders)
  const { error: ordErr } = await db.from('ticket_orders').insert(ticketOrderRows);
  if (ordErr) { console.error(`  Orders for "${def.title}":`, ordErr.message); continue; }

  const { error: tkErr } = await db.from('tickets').insert(ticketRows);
  if (tkErr) { console.error(`  Tickets for "${def.title}":`, tkErr.message); }
  else console.log(`    → ${ticketRows.length} guests seeded`);
}

console.log('\nDone! Refresh your dashboard to see the mock data.');
