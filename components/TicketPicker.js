'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { computeOrderTotals, getTicketAvailability } from '../lib/events';

const fmt = (n) => (n === 0 ? 'Free' : `$${Number(n).toFixed(2)}`);

export default function TicketPicker({ event }) {
  const router = useRouter();
  const [quantities, setQuantities] = useState({});

  const totals = useMemo(
    () => computeOrderTotals(event.tickets, quantities),
    [event.tickets, quantities]
  );

  const setQty = (name, delta) => {
    setQuantities((prev) => {
      const ticket = event.tickets.find((t) => t.name === name);
      const max = getTicketAvailability(ticket);
      const current = prev[name] || 0;
      const next = Math.max(0, Math.min(current + delta, max === Infinity ? 99 : max));
      return { ...prev, [name]: next };
    });
  };

  const handleCheckout = () => {
    if (totals.count === 0) return;
    sessionStorage.setItem(
      `checkout_${event.id}`,
      JSON.stringify({ tickets: quantities, eventId: event.id })
    );
    router.push(`/events/${event.id}/checkout`);
  };

  if (event.isSalesClosed) {
    return (
      <div className="sales-closed">
        <h3>Sales Closed</h3>
        <p>Tickets are no longer available for this event.</p>
      </div>
    );
  }

  return (
    <div className="ticket-picker">
      <h2>Get Tickets</h2>
      {event.spotsLeft > 0 && (
        <p className="spots-note">{event.spotsLeft} spots left</p>
      )}

      <div className="ticket-list">
        {event.tickets.map((ticket) => {
          const avail = getTicketAvailability(ticket);
          const soldOut = !ticket.isUnlimited && avail <= 0;
          const qty = quantities[ticket.name] || 0;

          return (
            <div key={ticket.id || ticket.name} className={`ticket-row ${soldOut ? 'sold-out' : ''}`}>
              <div className="ticket-info">
                <h4>{ticket.name}</h4>
                {ticket.instructions && <p className="ticket-note">{ticket.instructions}</p>}
                {ticket.includes?.length > 0 && (
                  <p className="ticket-includes">Includes: {ticket.includes.join(', ')}</p>
                )}
                <span className="ticket-price">{ticket.isFree ? 'Free' : fmt(ticket.price)}</span>
                {!ticket.isUnlimited && (
                  <span className="ticket-avail">{avail} left</span>
                )}
              </div>
              {!soldOut && (
                <div className="qty-controls">
                  <button type="button" onClick={() => setQty(ticket.name, -1)} disabled={qty <= 0}>−</button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(ticket.name, 1)}
                    disabled={!ticket.isUnlimited && qty >= avail}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totals.count > 0 && (
        <div className="ticket-summary">
          <div className="summary-row">
            <span>{totals.count} ticket{totals.count > 1 ? 's' : ''}</span>
            <span>{fmt(totals.subtotal)}</span>
          </div>
          <button type="button" className="btn-primary btn-full" onClick={handleCheckout}>
            Get Tickets
          </button>
        </div>
      )}
    </div>
  );
}
