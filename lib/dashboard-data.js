import { createAdminClient } from './supabase-admin';
import { mapEventRow, computeEventStatus } from './events';
import { buildEventInsertRow, validateCreateEventPayload } from './create-event';

const PLATFORM_FEE_RATE = 0.1;

function eventRevenue(event) {
  return (event.tickets || []).reduce((sum, t) => {
    if (t.isFree) return sum;
    const sold = t.sold ?? Math.max(0, (t.quantity || 0) - (t.availableQuantity ?? t.quantity ?? 0));
    return sum + (t.price || 0) * sold;
  }, 0);
}

function buildTrends(tickets, days = 30) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  const buckets = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { date: key, revenue: 0, tickets: 0 };
  }

  tickets.forEach((t) => {
    const d = new Date(t.purchase_date);
    if (d < start) return;
    const key = d.toISOString().slice(0, 10);
    if (!buckets[key]) return;
    buckets[key].revenue += Number(t.price) || 0;
    buckets[key].tickets += 1;
  });

  return Object.values(buckets);
}

async function fetchOrganizerEvents(client, organizerId) {
  const byId = new Map();

  const { data: byOrganizerId, error: organizerError } = await client
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('date', { ascending: false });

  if (organizerError) {
    console.error('Dashboard events (organizer_id):', organizerError.message);
  }

  (byOrganizerId || []).forEach((row) => byId.set(row.id, row));

  const { data: byJson, error: jsonError } = await client
    .from('events')
    .select('*')
    .filter('organizer->>id', 'eq', organizerId)
    .order('date', { ascending: false });

  if (jsonError) {
    console.error('Dashboard events (organizer json):', jsonError.message);
  }

  (byJson || []).forEach((row) => byId.set(row.id, row));

  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function fetchOrganizerDashboardData(organizerId, db) {
  const client = db || createAdminClient();
  if (!client) throw new Error('Server misconfigured');

  const [{ data: profile }, events] = await Promise.all([
    client.from('profiles').select('*').eq('id', organizerId).single(),
    fetchOrganizerEvents(client, organizerId),
  ]);

  const mappedEvents = (events || []).map((row) => {
    const event = mapEventRow(row);
    const revenue = eventRevenue(event);
    return { ...event, revenue, status: computeEventStatus(event) };
  });

  const eventTitleMap = Object.fromEntries(mappedEvents.map((e) => [e.id, e.title]));
  const eventIds = mappedEvents.map((e) => e.id);

  let ticketRows = [];
  if (eventIds.length) {
    const { data: tickets } = await client
      .from('tickets')
      .select('*')
      .in('event_id', eventIds)
      .order('purchase_date', { ascending: false });
    ticketRows = tickets || [];
  }
  const grossRevenue = ticketRows.reduce((s, t) => s + (Number(t.price) || 0), 0);
  const platformFees = grossRevenue * PLATFORM_FEE_RATE;
  const netEarnings = grossRevenue - platformFees;
  const paidOut = Number(profile?.provider_info?.totalPaidOut) || 0;
  const balance = Math.max(0, netEarnings - paidOut);

  const ticketTypeBreakdown = {};
  ticketRows.forEach((t) => {
    ticketTypeBreakdown[t.ticket_type] = (ticketTypeBreakdown[t.ticket_type] || 0) + 1;
  });

  const buyerEmails = new Set(ticketRows.map((t) => t.buyer_email?.toLowerCase()).filter(Boolean));

  const providerInfo = profile?.provider_info || {};

  return {
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phoneNumber: profile.phone_number,
          dateOfBirth: profile.date_of_birth,
          address: profile.address || {},
          profilePicture: profile.profile_picture_url,
          role: profile.role,
          currentMode: profile.current_mode,
          providerInfo,
          avatar: providerInfo.partyLogo || profile.profile_picture_url || null,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        }
      : null,
    events: mappedEvents,
    tickets: ticketRows.map((t) => ({
      id: t.id,
      eventId: t.event_id,
      eventTitle: eventTitleMap[t.event_id] || t.event_id,
      ticketType: t.ticket_type,
      price: Number(t.price) || 0,
      buyerName: t.buyer_name,
      buyerEmail: t.buyer_email,
      status: t.status,
      purchaseDate: t.purchase_date,
      paymentId: t.payment_id,
    })),
    payouts: {
      grossRevenue,
      platformFees,
      platformFeeRate: PLATFORM_FEE_RATE,
      netEarnings,
      paidOut,
      balance,
      stripeConnected: profile?.provider_info?.stripeConnected ?? false,
      verificationStatus: profile?.provider_info?.verificationStatus || 'pending',
    },
    trends: {
      revenue30d: buildTrends(ticketRows, 30),
      revenue7d: buildTrends(ticketRows, 7),
    },
    guests: {
      totalBuyers: buyerEmails.size,
      totalTickets: ticketRows.length,
      ticketTypeBreakdown,
      repeatBuyers: 0,
    },
  };
}

export async function fetchPlatformAdminData() {
  const admin = createAdminClient();
  if (!admin) throw new Error('Server misconfigured');

  const [{ data: profiles }, { data: events }, { data: tickets }] = await Promise.all([
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin.from('events').select('*').order('date', { ascending: false }),
    admin.from('tickets').select('*').order('purchase_date', { ascending: false }),
  ]);

  const organizers = (profiles || []).filter((p) => p.role === 'provider' || p.provider_info?.organizationName);
  const mappedEvents = (events || []).map((row) => {
    const event = mapEventRow(row);
    return { ...event, revenue: eventRevenue(event), status: computeEventStatus(event) };
  });

  const grossRevenue = (tickets || []).reduce((s, t) => s + (Number(t.price) || 0), 0);

  const organizerStats = organizers.map((org) => {
    const orgEvents = mappedEvents.filter((e) => e.organizerId === org.id);
    const orgTickets = (tickets || []).filter((t) =>
      orgEvents.some((e) => e.id === t.event_id)
    );
    const revenue = orgTickets.reduce((s, t) => s + (Number(t.price) || 0), 0);
    return {
      id: org.id,
      email: org.email,
      name: org.name,
      organizationName: org.provider_info?.organizationName || org.name,
      verificationStatus: org.provider_info?.verificationStatus || 'pending',
      eventCount: orgEvents.length,
      ticketCount: orgTickets.length,
      revenue,
      createdAt: org.created_at,
    };
  });

  return {
    stats: {
      totalOrganizers: organizers.length,
      totalEvents: mappedEvents.length,
      totalTickets: (tickets || []).length,
      grossRevenue,
      platformFees: grossRevenue * PLATFORM_FEE_RATE,
      liveEvents: mappedEvents.filter((e) => e.status === 'live').length,
      upcomingEvents: mappedEvents.filter((e) => e.status === 'upcoming').length,
    },
    organizers: organizerStats.sort((a, b) => b.revenue - a.revenue),
    events: mappedEvents,
    revenueTrend: buildTrends(tickets || [], 30),
    attendees: (profiles || []).filter((p) => p.role === 'attendee').length,
    admins: (profiles || []).filter((p) => p.role === 'admin').length,
  };
}

export async function createEvent(organizerId, payload, db, profile) {
  const client = db || createAdminClient();
  if (!client) throw new Error('Server misconfigured');

  const errors = validateCreateEventPayload(payload);
  if (errors.length) throw new Error(`Missing: ${errors.join(', ')}`);

  const row = buildEventInsertRow(organizerId, payload, profile);
  const { data, error } = await client.from('events').insert(row).select('*').single();
  if (error) throw new Error(error.message);

  const event = mapEventRow(data);
  return {
    ...event,
    revenue: 0,
    status: computeEventStatus(event),
    verificationCode: row.verification_code,
  };
}

export async function updateEvent(organizerId, eventId, updates, db) {
  const client = db || createAdminClient();
  if (!client) throw new Error('Server misconfigured');

  const allowed = {};
  if (updates.status !== undefined) allowed.status = updates.status;
  if (updates.ticket_sales_open !== undefined) allowed.ticket_sales_open = updates.ticket_sales_open;
  if (updates.show_on_explore !== undefined) allowed.show_on_explore = updates.show_on_explore;
  if (updates.title !== undefined) allowed.title = updates.title;
  allowed.updated_at = new Date().toISOString();

  const { data: existing } = await client
    .from('events')
    .select('organizer_id')
    .eq('id', eventId)
    .single();

  if (!existing) throw new Error('Event not found');
  if (existing.organizer_id !== organizerId) throw new Error('Event not found');

  const { data, error } = await client
    .from('events')
    .update(allowed)
    .eq('id', eventId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapEventRow(data);
}
