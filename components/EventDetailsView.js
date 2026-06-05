'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCount } from '../lib/formatNumbers';
import { getTicketAvailability } from '../lib/events';
import { SITE_URL } from '../lib/config';

function Icon({ name, size = 20, color = '#FFFFFF' }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'chevron-left') return <svg {...props}><polyline points="15 18 9 12 15 6" /></svg>;
  if (name === 'share') return <svg {...props}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
  if (name === 'image') return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
  if (name === 'x') return <svg {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
  if (name === 'minus') return <svg {...props}><line x1="5" y1="12" x2="19" y2="12" /></svg>;
  if (name === 'plus') return <svg {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
  return null;
}

function formatDate(date) {
  if (!date) return { day: '—', month: '—', weekday: '—' };
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return { day: date, month: '', weekday: '' };
  return {
    day: d.getDate(),
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
  };
}

function formatTime(time) {
  if (!time) return '—';
  if (typeof time === 'string' && !time.includes('T')) return time;
  const d = typeof time === 'string' ? new Date(time) : time;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function EventDetailsView({ event }) {
  const router = useRouter();
  const ticketTypes = event.tickets || [];
  const [ticketCounts, setTicketCounts] = useState({});
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const organizerName =
    typeof event.organizer === 'string'
      ? event.organizer
      : event.organizer?.name || 'Event Organizer';
  const initials = organizerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const profilePicture = typeof event.organizer === 'object' ? event.organizer?.profilePicture : null;

  const dateInfo = formatDate(event.date);
  const startTime = formatTime(event.startTime);
  const endTime = event.endTime ? formatTime(event.endTime) : null;
  const timeLabel = endTime ? `${startTime} – ${endTime}` : startTime;

  const spotsLeft = useMemo(() => {
    if (!ticketTypes.length) return 200;
    if (ticketTypes.some((t) => t.isUnlimited)) return '∞';
    return ticketTypes.reduce((s, t) => s + (t.availableQuantity || t.quantity || 0), 0);
  }, [ticketTypes]);

  const lowestPrice = useMemo(() => {
    if (!ticketTypes.length) return null;
    const paid = ticketTypes.filter((t) => !t.isFree);
    if (!paid.length) return null;
    return paid.reduce((min, t) => Math.min(min, t.price || 0), Infinity);
  }, [ticketTypes]);

  const calculateTotals = useCallback(() => {
    let total = 0;
    let ticketCount = 0;
    ticketTypes.forEach((t) => {
      const name = t.name || t.type;
      const count = ticketCounts[name] || 0;
      total += count * (t.isFree ? 0 : t.price || 0);
      ticketCount += count;
    });
    return { total, ticketCount };
  }, [ticketTypes, ticketCounts]);

  const { total, ticketCount } = calculateTotals();

  const mapsQuery = encodeURIComponent(
    event.address?.formatted ||
      [event.address?.street, event.address?.city, event.address?.state].filter(Boolean).join(', ') ||
      event.venue ||
      ''
  );

  const handleShare = async () => {
    const url = `${SITE_URL}/events/${event.id}`;
    const text = `🎉 Check out ${event.title}!\n📅 ${event.dateLabel}${event.timeLabel ? ` · ${event.timeLabel}` : ''}\n📍 ${event.venue || event.formattedAddress}\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
  };

  const handleCheckout = () => {
    if (ticketCount === 0) return;
    sessionStorage.setItem(
      `checkout_${event.id}`,
      JSON.stringify({ tickets: ticketCounts, eventId: event.id })
    );
    setShowTicketModal(false);
    router.push(`/events/${event.id}/checkout`);
  };

  const getTicketsLabel =
    lowestPrice != null && lowestPrice !== Infinity
      ? `GET TICKETS · $${lowestPrice}`
      : 'GET TICKETS';

  return (
    <div className="ed-page">
      <nav className="ed-float-nav">
        <Link href="/" className="ed-back-btn">
          <Icon name="chevron-left" size={18} />
          <span>Explore</span>
        </Link>
        {event.category ? (
          <span className="ed-category">{event.category.toUpperCase()}</span>
        ) : null}
        <button type="button" className="ed-share-btn" onClick={handleShare} aria-label="Share">
          <Icon name="share" size={20} />
        </button>
      </nav>

      <div className={`ed-scroll ${visible ? 'ed-visible' : ''}`}>
        <section className="ed-hero">
          {event.coverImage ? (
            <img src={event.coverImage} alt="" className="ed-hero-img" />
          ) : (
            <div className="ed-hero-placeholder">
              <Icon name="image" size={48} color="rgba(255,255,255,0.2)" />
            </div>
          )}
          <div className="ed-hero-gradient">
            <h1 className="ed-title">{event.title}</h1>
            <div className="ed-hosted-by">
              <span className="ed-hosted-label">Hosted by</span>
              {profilePicture ? (
                <img src={profilePicture} alt="" className="ed-hosted-avatar" />
              ) : (
                <span className="ed-hosted-avatar-ph">
                  <span>{initials}</span>
                </span>
              )}
              <span className="ed-hosted-name">{organizerName}</span>
            </div>
          </div>
        </section>

        <section className="ed-info-card">
          <a
            className="ed-info-block"
            href={mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="ed-info-label">Venue</span>
            <span className="ed-info-value">{event.venue || 'TBA'}</span>
            {(event.address?.formatted || event.address?.city) && (
              <span className="ed-info-sub">
                {event.address.formatted || event.address.city}
              </span>
            )}
            <span className="ed-map-hint">Open in Maps ↗</span>
          </a>
          <div className="ed-info-sep" />
          <div className="ed-info-block">
            <span className="ed-info-label">Date</span>
            <span className="ed-info-big">{dateInfo.day}</span>
            <span className="ed-info-value">{dateInfo.month}</span>
          </div>
          <div className="ed-info-sep" />
          <div className="ed-info-block">
            <span className="ed-info-label">Time</span>
            <span className="ed-info-value">{timeLabel}</span>
            <span className="ed-info-sub">{dateInfo.weekday}</span>
          </div>
        </section>

        <div className="ed-attend-strip">
          <span>{formatCount(event.bookedSpots || 0)} attending</span>
          <span className="ed-attend-dot" />
          <span>
            {spotsLeft === '∞' ? '∞' : formatCount(spotsLeft)} spots left
          </span>
        </div>

        {event.description ? (
          <section className="ed-section">
            <h2 className="ed-section-title">About the event</h2>
            <p className="ed-desc">{event.description}</p>
          </section>
        ) : null}

        {ticketTypes.length > 0 ? (
          <section className="ed-section">
            <h2 className="ed-section-title">Available Tickets</h2>
            {ticketTypes.map((ticket, i) => {
              const name = ticket.name || ticket.type;
              const spots = ticket.isUnlimited
                ? 'Unlimited spots'
                : `${ticket.availableQuantity || ticket.quantity || 0} spots remaining`;
              const price = ticket.isFree ? 'Free' : `$${ticket.price}`;
              const perks = (ticket.includes || ticket.perks || []).filter(Boolean);

              return (
                <div key={ticket.id || name || i} className={`ed-ticket-card${i > 0 ? ' ed-ticket-card-gap' : ''}`}>
                  <div className="ed-ticket-top">
                    <span className="ed-ticket-name">{name}</span>
                    <span className="ed-ticket-price">{price}</span>
                  </div>
                  {perks.length > 0 && (
                    <div className="ed-ticket-perks">
                      {perks.map((item, j) => (
                        <span key={j}>· {item}</span>
                      ))}
                    </div>
                  )}
                  <span className="ed-spots-text">{spots}</span>
                </div>
              );
            })}
          </section>
        ) : null}
      </div>

      <footer className="ed-bottom-bar">
        <button
          type="button"
          className="ed-get-tickets-btn"
          onClick={() => setShowTicketModal(true)}
          disabled={event.isSalesClosed || ticketTypes.length === 0}
        >
          <span className="ed-get-tickets-gradient">
            {event.isSalesClosed ? 'SALES CLOSED' : getTicketsLabel}
          </span>
        </button>
      </footer>

      {showTicketModal && (
        <div className="ed-modal-root">
          <button
            type="button"
            className="ed-modal-backdrop"
            onClick={() => setShowTicketModal(false)}
            aria-label="Close"
          />
          <div className="ed-modal-sheet">
            <div className="ed-modal-handle" />
            <div className="ed-modal-header">
              <span className="ed-modal-title">Select Tickets</span>
              <button type="button" onClick={() => setShowTicketModal(false)} aria-label="Close">
                <Icon name="x" size={22} color="rgba(255,255,255,0.6)" />
              </button>
            </div>

            <div className="ed-modal-list">
              {ticketTypes.map((ticket, i) => {
                const name = ticket.name || ticket.type;
                const count = ticketCounts[name] || 0;
                const max = ticket.isUnlimited ? 99 : getTicketAvailability(ticket);
                const price = ticket.isFree ? 'Free' : `$${ticket.price}`;
                const perks = (ticket.includes || ticket.perks || []).filter(Boolean).slice(0, 3);

                const updateCount = (delta) => {
                  const next = Math.max(0, Math.min(max === Infinity ? 99 : max, count + delta));
                  setTicketCounts((prev) => ({ ...prev, [name]: next }));
                };

                return (
                  <div key={ticket.id || name || i} className={`ed-modal-row${i > 0 ? ' ed-modal-row-border' : ''}`}>
                    <div className="ed-modal-ticket-info">
                      <span className="ed-modal-ticket-name">{name}</span>
                      <span className="ed-modal-ticket-price">{price}</span>
                      {perks.length > 0 && (
                        <div className="ed-modal-perks">
                          {perks.map((item, j) => (
                            <span key={j}>· {item}</span>
                          ))}
                        </div>
                      )}
                      {ticket.instructions?.trim() ? (
                        <span className="ed-modal-instruction">{ticket.instructions}</span>
                      ) : null}
                    </div>
                    <div className="ed-qty-row">
                      <button
                        type="button"
                        className={`ed-qty-btn${count === 0 ? ' ed-qty-disabled' : ''}`}
                        onClick={() => updateCount(-1)}
                        disabled={count === 0}
                      >
                        <Icon name="minus" size={14} color={count === 0 ? 'rgba(255,255,255,0.2)' : '#FFFFFF'} />
                      </button>
                      <span className="ed-qty-count">{count}</span>
                      <button
                        type="button"
                        className={`ed-qty-btn ed-qty-add${count >= (max === Infinity ? 99 : max) ? ' ed-qty-disabled' : ''}`}
                        onClick={() => updateCount(1)}
                        disabled={count >= (max === Infinity ? 99 : max)}
                      >
                        <Icon name="plus" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="ed-modal-footer">
              <div className="ed-modal-total">
                <span className="ed-modal-total-label">Total</span>
                <span className="ed-modal-total-amount">${total}</span>
              </div>
              <button
                type="button"
                className={`ed-checkout-btn${ticketCount === 0 ? ' ed-checkout-disabled' : ''}`}
                disabled={ticketCount === 0}
                onClick={handleCheckout}
              >
                <span className="ed-checkout-gradient">
                  {ticketCount === 0 ? 'Select Tickets' : 'Proceed to Checkout'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
