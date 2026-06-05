import { createAdminClient } from './supabase-admin';
import { createBrowserClient } from './supabase';

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export function mapEventRow(row) {
  if (!row) return null;

  const tickets = Array.isArray(row.tickets) ? row.tickets : [];
  const flyers = Array.isArray(row.flyers) ? row.flyers : [];
  const organizer = row.organizer || {};

  const date = parseDate(row.date);
  const startTime = parseDate(row.start_time);
  const endTime = parseDate(row.end_time);

  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    date,
    startTime,
    endTime,
    hasEndTime: row.has_end_time ?? false,
    venue: row.venue || '',
    address: row.address || {},
    coverImage: row.cover_image || flyers[0] || null,
    flyers,
    tickets,
    organizer,
    organizerId: row.organizer_id || organizer.id,
    status: row.status || 'upcoming',
    ticketSalesOpen: row.ticket_sales_open !== false,
    showOnExplore: row.show_on_explore !== false,
    totalSpots: row.total_spots ?? 0,
    spotsLeft: row.spots_left ?? 0,
    bookedSpots: row.booked_spots ?? 0,
    scannedTickets: row.scanned_tickets ?? 0,
    verificationCode: row.verification_code || null,
    liveStartedAt: row.live_started_at || null,
    category: row.category || 'Event',
    dateLabel: date
      ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      : 'TBD',
    timeLabel: startTime
      ? startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      : '',
    formattedAddress: row.address?.formatted || row.venue || 'Venue TBD',
    isSalesClosed: row.ticket_sales_open === false || row.status === 'completed',
    isLive: row.status === 'live',
  };
}

function getEventStartDateTime(event) {
  if (!event?.date || !event?.startTime) return null;
  const d = new Date(event.date);
  const t = new Date(event.startTime);
  if (Number.isNaN(d.getTime()) || Number.isNaN(t.getTime())) return null;
  d.setHours(t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds());
  return d;
}

function getEventEndDateTime(event, startDateTime) {
  if (!startDateTime) return null;
  if (event.endTime && event.hasEndTime !== false) {
    const d = new Date(event.date);
    const t = new Date(event.endTime);
    if (Number.isNaN(d.getTime()) || Number.isNaN(t.getTime())) {
      return new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000);
    }
    d.setHours(t.getHours(), t.getMinutes(), 0, 0);
    return d;
  }
  return new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000);
}

export function computeEventStatus(event, now = new Date()) {
  if (event.status === 'completed') return 'completed';

  if (event.status === 'live' || event.startedEarly || event.liveStartedAt) {
    const start = getEventStartDateTime(event);
    if (!start) return 'live';
    const end = getEventEndDateTime(event, start);
    return now > end ? 'completed' : 'live';
  }

  const start = getEventStartDateTime(event);
  if (!start) return event.status || 'upcoming';
  const end = getEventEndDateTime(event, start);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'completed';
}

export async function getExploreEvents() {
  const admin = createAdminClient();
  const client = admin || createBrowserClient();

  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('show_on_explore', true)
    .order('date', { ascending: true });

  if (error || !data) return [];

  const now = new Date();
  return data
    .map(mapEventRow)
    .filter((event) => event?.date && event?.startTime)
    .filter((event) => {
      const status = computeEventStatus(event, now);
      return status === 'upcoming' || status === 'live';
    });
}

export async function getEventById(eventId) {
  const admin = createAdminClient();
  const client = admin || createBrowserClient();

  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error || !data) return null;
  return mapEventRow(data);
}

export function getTicketAvailability(ticket) {
  if (ticket.isUnlimited) return Infinity;
  return ticket.availableQuantity ?? ticket.quantity ?? 0;
}

export function computeOrderTotals(ticketTypes, quantities) {
  const lines = [];
  let subtotal = 0;
  let count = 0;

  ticketTypes.forEach((t) => {
    const qty = quantities[t.name] || 0;
    if (qty <= 0) return;
    const lineTotal = (t.price || 0) * qty;
    subtotal += lineTotal;
    count += qty;
    lines.push({ name: t.name, qty, unitPrice: t.price || 0, lineTotal, isFree: t.isFree });
  });

  const serviceFee = subtotal * 0.1;
  return { lines, subtotal, serviceFee, total: subtotal + serviceFee, count };
}

export function computeDashboardStats(events, period = 'month') {
  const now = new Date();
  let periodStart = null;

  if (period === 'day') periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'week') {
    periodStart = new Date(now);
    periodStart.setDate(now.getDate() - now.getDay());
    periodStart.setHours(0, 0, 0, 0);
  }
  if (period === 'month') periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'year') periodStart = new Date(now.getFullYear(), 0, 1);

  const live = events.filter((e) => e.status === 'live');
  const upcoming = events.filter((e) => e.status === 'upcoming');
  const past = events.filter((e) => e.status === 'completed');

  const totalTickets = events.reduce((s, e) => s + (e.bookedSpots || 0), 0);
  const totalCapacity = events.reduce((s, e) => {
    const cap = (e.tickets || []).reduce((sum, t) => {
      if (t.isUnlimited) return sum;
      return sum + (t.quantity || 0);
    }, 0);
    return s + cap;
  }, 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalTickets / totalCapacity) * 100) : 0;

  const revenueAll = events.reduce((s, e) => s + (e.revenue || 0), 0);
  const revenuePeriod = events.reduce((s, e) => {
    if (!periodStart || period === 'all') return s + (e.revenue || 0);
    return e.date && e.date >= periodStart ? s + (e.revenue || 0) : s;
  }, 0);

  return { live, upcoming, past, totalTickets, fillRate, revenueAll, revenuePeriod };
}

export async function fetchOrganizerEvents(organizerId, client) {
  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('date', { ascending: false });

  if (error) return [];

  return (data || []).map((row) => {
    const event = mapEventRow(row);
    const revenue = (event.tickets || []).reduce((sum, t) => {
      if (t.isFree) return sum;
      const sold = Math.max(0, (t.quantity || 0) - getTicketAvailability(t));
      return sum + (t.price || 0) * sold;
    }, 0);
    return { ...event, revenue, bookedSpots: row.booked_spots ?? 0 };
  });
}
