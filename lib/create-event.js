export function generateEventId() {
  return `${Date.now()}${Math.random().toString(36).slice(2, 11)}`;
}

export function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isTicketFree(ticket) {
  return ticket.isFree || ticket.price === 'Free' || ticket.price === 0;
}

export function formatTicketsForSave(ticketTypes) {
  return ticketTypes
    .filter((ticket) => {
      const name = (ticket.type || ticket.name || '').trim();
      if (!name) return false;
      return isTicketFree(ticket) || String(ticket.price ?? '').trim() !== '';
    })
    .map((ticket) => {
      const free = isTicketFree(ticket);
      const unlimited = !!ticket.isUnlimited;
      const qty = unlimited ? 0 : (parseInt(ticket.quantity, 10) || 0);
      const name = (ticket.type || ticket.name || '').trim();

      return {
        id: ticket.id || `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name,
        price: free ? 0 : (parseFloat(ticket.price) || 0),
        isFree: free,
        quantity: qty,
        isUnlimited: unlimited,
        availableQuantity: unlimited ? null : qty,
        sold: 0,
        instructions: (ticket.instructions || '').trim(),
        includes: (ticket.includes || []).filter((item) => String(item).trim()),
      };
    });
}

export function validateCreateEventPayload(payload) {
  const errors = [];
  if (!payload.title?.trim()) errors.push('Event title');
  if (!payload.venue?.trim()) errors.push('Venue');
  if (!payload.address?.street?.trim()) errors.push('Street address');
  if (!payload.coverImage && !(payload.flyers?.length)) errors.push('Cover image');

  const tickets = payload.tickets || [];
  const hasValidTicket = tickets.some((ticket) => {
    const name = (ticket.type || ticket.name || '').trim();
    if (!name) return false;
    const priced = isTicketFree(ticket) || String(ticket.price ?? '').trim() !== '';
    const qty = ticket.isUnlimited || String(ticket.quantity ?? '').trim() !== '';
    return priced && qty;
  });

  if (!hasValidTicket) errors.push('At least one valid ticket type');
  return errors;
}

export function buildAddress(payload) {
  const street = payload.address?.street?.trim() || '';
  const city = payload.address?.city?.trim() || '';
  const state = payload.address?.state?.trim() || '';
  const zipCode = payload.address?.zipCode?.trim() || '';
  const formatted = [street, city, state, zipCode].filter(Boolean).join(', ');

  return {
    street,
    city,
    state,
    zipCode,
    formatted,
    coordinates: payload.address?.coordinates || null,
  };
}

export function mergeTicketsForUpdate(existingTickets, newTicketPayload) {
  const soldByName = Object.fromEntries(
    (existingTickets || []).map((t) => [t.name || t.type, t.sold || 0]),
  );
  const idByName = Object.fromEntries(
    (existingTickets || []).map((t) => [t.name || t.type, t.id]),
  );

  return formatTicketsForSave(newTicketPayload).map((ticket) => {
    const sold = soldByName[ticket.name] ?? 0;
    return {
      ...ticket,
      id: idByName[ticket.name] || ticket.id,
      sold,
      availableQuantity: ticket.isUnlimited ? null : Math.max(0, ticket.quantity - sold),
    };
  });
}

export function buildEventUpdateRow(payload, existingRow) {
  const tickets = mergeTicketsForUpdate(existingRow?.tickets, payload.tickets || []);
  const totalSpots = tickets.reduce((sum, t) => sum + (t.isUnlimited ? 0 : t.quantity), 0);
  const booked = existingRow?.booked_spots ?? 0;
  const flyers = payload.flyers?.length ? payload.flyers : (payload.coverImage ? [payload.coverImage] : existingRow?.flyers || []);

  return {
    title: payload.title?.trim(),
    description: (payload.description || '').trim(),
    date: payload.date,
    start_time: payload.startTime,
    end_time: payload.hasEndTime ? payload.endTime : null,
    has_end_time: !!payload.hasEndTime,
    venue: payload.venue?.trim(),
    address: buildAddress(payload),
    cover_image: payload.coverImage || flyers[0] || null,
    flyers,
    tickets,
    show_on_explore: payload.showOnExplore !== false,
    total_spots: totalSpots,
    spots_left: Math.max(0, totalSpots - booked),
    updated_at: new Date().toISOString(),
  };
}

export function buildEventInsertRow(organizerId, payload, profile) {
  const tickets = formatTicketsForSave(payload.tickets || []);
  const totalSpots = tickets.reduce((sum, t) => sum + (t.isUnlimited ? 0 : t.quantity), 0);
  const providerInfo = profile?.providerInfo || profile?.provider_info || {};
  const flyers = payload.flyers?.length ? payload.flyers : (payload.coverImage ? [payload.coverImage] : []);
  const eventId = payload.id || generateEventId();

  return {
    id: eventId,
    organizer_id: organizerId,
    title: payload.title.trim(),
    description: (payload.description || '').trim(),
    date: payload.date,
    start_time: payload.startTime,
    end_time: payload.hasEndTime ? payload.endTime : null,
    has_end_time: !!payload.hasEndTime,
    venue: payload.venue.trim(),
    address: buildAddress(payload),
    cover_image: payload.coverImage || flyers[0] || null,
    flyers,
    tickets,
    organizer: {
      id: organizerId,
      name: providerInfo.organizationName || profile?.name,
      organizationName: providerInfo.organizationName,
      profilePicture: providerInfo.partyLogo || profile?.profile_picture_url,
      description: providerInfo.description,
      contactEmail: providerInfo.partyEmail || profile?.email,
      contactPhone: providerInfo.partyPhone,
    },
    status: 'upcoming',
    ticket_sales_open: true,
    show_on_explore: payload.showOnExplore !== false,
    total_spots: totalSpots,
    spots_left: totalSpots,
    booked_spots: 0,
    verification_code: payload.verificationCode || generateVerificationCode(),
    category: payload.category || 'Event',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
