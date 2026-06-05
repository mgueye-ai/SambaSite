import { createAdminClient } from './supabase-admin';
import { getTicketAvailability } from './events';

function randomId() {
  return `${Date.now()}${Math.random().toString(36).slice(2, 9)}`;
}

function validatePurchase(event, ticketSelections) {
  const errors = [];
  let totalRequested = 0;

  Object.entries(ticketSelections).forEach(([ticketName, quantity]) => {
    if (!quantity || quantity <= 0) return;

    totalRequested += quantity;
    const ticketType = event.tickets.find((t) => t.name === ticketName);

    if (!ticketType) {
      errors.push(`Ticket type "${ticketName}" not found`);
      return;
    }

    const available = getTicketAvailability(ticketType);
    if (quantity > available) {
      errors.push(
        `Only ${available === Infinity ? 'unlimited' : available} tickets available for "${ticketName}"`
      );
    }
  });

  if (totalRequested === 0) {
    errors.push('No tickets selected');
  }

  if (event.total_spots && event.total_spots > 0) {
    const spotsLeft = event.spots_left ?? event.total_spots;
    if (totalRequested > spotsLeft) {
      errors.push(`Only ${spotsLeft} spots left for this event`);
    }
  }

  if (!event.ticket_sales_open) {
    errors.push('Ticket sales are closed');
  }

  if (event.status === 'completed') {
    errors.push('This event has ended');
  }

  return { errors, totalRequested };
}

export async function processPurchase({
  eventId,
  tickets: ticketSelections,
  buyer,
  paymentId = `demo_${Date.now()}`,
  paymentStatus = 'demo_completed',
}) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error('Server misconfigured: SUPABASE_SERVICE_ROLE_KEY is required for purchases');
  }

  const { data: event, error: fetchError } = await admin
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (fetchError || !event) {
    throw new Error('Event not found');
  }

  const { errors, totalRequested } = validatePurchase(event, ticketSelections);
  if (errors.length) {
    throw new Error(errors.join('; '));
  }

  const sharedTicketNumber = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  const orderId = `order_${Date.now()}`;
  const createdTickets = [];

  const updatedTickets = event.tickets.map((ticketType) => {
    const purchasedQty = ticketSelections[ticketType.name] || 0;
    if (purchasedQty <= 0) return ticketType;

    if (ticketType.isUnlimited) {
      return { ...ticketType, sold: (ticketType.sold || 0) + purchasedQty };
    }

    const currentAvailable = getTicketAvailability(ticketType);
    return {
      ...ticketType,
      availableQuantity: Math.max(0, currentAvailable - purchasedQty),
      sold: (ticketType.sold || 0) + purchasedQty,
    };
  });

  Object.entries(ticketSelections).forEach(([ticketTypeName, quantity]) => {
    if (!quantity || quantity <= 0) return;

    const eventTicketType = event.tickets.find((t) => t.name === ticketTypeName);
    for (let i = 0; i < quantity; i++) {
      const qrCode = `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 9)}_${i}`;
      createdTickets.push({
        id: randomId(),
        event_id: eventId,
        ticket_number: sharedTicketNumber,
        ticket_type: ticketTypeName,
        price: eventTicketType?.isFree ? 0 : (eventTicketType?.price || 0),
        is_free: eventTicketType?.isFree || false,
        buyer_name: buyer.name,
        buyer_email: buyer.email,
        qr_code: qrCode,
        status: 'upcoming',
        payment_id: paymentId,
      });
    }
  });

  const updatePayload = {
    tickets: updatedTickets,
    updated_at: new Date().toISOString(),
  };

  if (event.total_spots && event.total_spots > 0) {
    updatePayload.spots_left = Math.max(0, (event.spots_left ?? event.total_spots) - totalRequested);
    updatePayload.booked_spots = (event.booked_spots || 0) + totalRequested;
  }

  const { error: updateError } = await admin
    .from('events')
    .update(updatePayload)
    .eq('id', eventId);

  if (updateError) {
    throw new Error(`Failed to update event: ${updateError.message}`);
  }

  const { data: insertedTickets, error: insertError } = await admin
    .from('tickets')
    .insert(createdTickets)
    .select();

  if (insertError) {
    throw new Error(`Failed to create tickets: ${insertError.message}`);
  }

  return {
    success: true,
    orderId,
    paymentId,
    paymentStatus,
    tickets: insertedTickets,
    totalTickets: totalRequested,
    buyer,
    joinGuestList: buyer.joinGuestList !== false,
  };
}
