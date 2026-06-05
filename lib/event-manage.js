import { computeEventStatus } from './events';

export function getEventManagePath(event) {
  if (!event?.id) return '/dashboard';
  const status = event.status || computeEventStatus(event);
  if (status === 'live') return `/dashboard/events/${event.id}/live`;
  if (status === 'completed') return `/dashboard/events/${event.id}/stats`;
  return `/dashboard/events/${event.id}/edit`;
}

const sr = (seed) => {
  let s = seed % 233280;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

export function buildCheckInTrend(checkedIn, seed = 42) {
  const rng = sr(seed);
  const buckets = 12;
  if (checkedIn <= 0) return Array(buckets).fill(0);
  return Array.from({ length: buckets }, (_, i) => {
    if (i === buckets - 1) return checkedIn;
    const progress = (i + 1) / buckets;
    return Math.max(0, Math.round(checkedIn * progress * (0.8 + rng() * 0.2)));
  });
}

export function buildSalesTrend(sold, seed = 17) {
  const rng = sr(seed);
  const buckets = 8;
  if (sold <= 0) return Array(buckets).fill(0);
  return Array.from({ length: buckets }, (_, i) => {
    if (i === buckets - 1) return sold;
    const progress = (i + 1) / buckets;
    return Math.max(0, Math.round(sold * progress * (0.75 + rng() * 0.25)));
  });
}

export function buildScanBars(rate, seed = 11) {
  const rng = sr(seed);
  return Array.from({ length: 8 }, (_, i) => {
    if (i === 7) return Math.max(1, rate);
    return Math.max(1, Math.round(rate * (0.35 + rng() * 1.1)));
  });
}

export function formatDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime || Date.now());
  if (Number.isNaN(start.getTime())) return '—';
  const diff = Math.max(0, end.getTime() - start.getTime());
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export function formatElapsed(startTime) {
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  if (Number.isNaN(start.getTime())) return '0:00';
  const diff = Math.max(0, Date.now() - start.getTime());
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins <= 0) return 'Just now';
  if (mins === 1) return '1 min ago';
  return `${mins} mins ago`;
}

export function computeEventMetrics(event, tickets = []) {
  const eventTickets = tickets.filter((t) => t.eventId === event?.id);

  const ticketsSoldFromEvent = (event?.tickets || []).reduce((s, tk) => s + (tk.sold || 0), 0);
  const ticketsSold = ticketsSoldFromEvent || eventTickets.length || event?.bookedSpots || 0;

  const checkedInFromEvent = event?.scannedTickets || 0;
  const checkedInFromTickets = eventTickets.filter(
    (tk) => tk.status === 'checked_in' || tk.status === 'used',
  ).length;
  const checkedInCount = Math.max(checkedInFromEvent, checkedInFromTickets);

  const revenueFromTickets = eventTickets.reduce((total, ticket) => total + (Number(ticket.price) || 0), 0);
  const revenueFromEvent = (event?.tickets || []).reduce((total, tk) => {
    const sold = tk.sold || 0;
    const price = parseFloat(tk.price) || 0;
    return total + sold * price;
  }, 0);
  const revenueAmount = Math.max(revenueFromTickets, revenueFromEvent, event?.revenue || 0);

  const checkInPct = ticketsSold > 0 ? Math.round((checkedInCount / ticketsSold) * 100) : 0;

  const ticketBreakdown = (event?.tickets || []).map((tk) => {
    const soldFromTickets = eventTickets.filter(
      (et) => et.ticketType === tk.name || et.ticketId === tk.id,
    ).length;
    return {
      name: tk.name || tk.type || 'Ticket',
      sold: tk.sold || soldFromTickets || 0,
      total: tk.quantity || tk.availableQuantity || tk.sold || 0,
      price: parseFloat(tk.price) || 0,
    };
  });

  const recentCheckIns = eventTickets
    .filter((tk) => tk.status === 'checked_in' || tk.status === 'used')
    .sort((a, b) => new Date(b.checkedInAt || b.purchaseDate || 0) - new Date(a.checkedInAt || a.purchaseDate || 0))
    .slice(0, 5)
    .map((tk) => ({
      name: tk.buyerName || 'Guest',
      ticketType: tk.ticketType || null,
      timestamp: tk.checkedInAt || tk.purchaseDate,
    }));

  const checkInSeries = buildCheckInTrend(checkedInCount, (event?.id || '').length + checkedInCount);
  const salesSeries = buildSalesTrend(ticketsSold, ticketsSold + 17);
  const checkInLabels = ['Start', '', '', '', '', '', '', '', '', '', '', 'End'];
  const salesLabels = ['Early', '', '', '', '', '', '', 'Final'];

  return {
    ticketsSold,
    checkedInCount,
    revenueAmount,
    checkInPct,
    ticketBreakdown,
    recentCheckIns,
    checkInSeries,
    salesSeries,
    checkInLabels,
    salesLabels,
    eventTickets,
  };
}
