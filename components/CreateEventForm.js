'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch, apiUpload } from '../lib/api-client';
import AddressAutocomplete from './AddressAutocomplete';

const EMPTY_TICKET = () => ({
  type: 'General Admission',
  price: '',
  isFree: false,
  quantity: '100',
  isUnlimited: false,
  instructions: '',
  includes: [''],
});

function toLocalDateValue(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toLocalTimeValue(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combineDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return new Date().toISOString();
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

function mapEventToFormState(initialEvent) {
  const addr = initialEvent?.address || {};
  const cover = initialEvent?.coverImage || initialEvent?.flyers?.[0] || '';
  const mappedTickets = (initialEvent?.tickets?.length ? initialEvent.tickets : [EMPTY_TICKET()]).map((t) => ({
    type: t.name || t.type || '',
    price: t.isFree ? '' : String(t.price ?? ''),
    isFree: !!t.isFree,
    quantity: t.isUnlimited ? '100' : String(t.quantity ?? ''),
    isUnlimited: !!t.isUnlimited,
    instructions: t.instructions || '',
    includes: t.includes?.length ? t.includes : [''],
  }));

  return {
    title: initialEvent?.title || '',
    date: initialEvent?.date ? toLocalDateValue(initialEvent.date) : toLocalDateValue(new Date()),
    startTime: initialEvent?.startTime ? toLocalTimeValue(initialEvent.startTime) : toLocalTimeValue(new Date()),
    endTime: initialEvent?.endTime ? toLocalTimeValue(initialEvent.endTime) : '',
    hasEndTime: !!initialEvent?.hasEndTime,
    venue: initialEvent?.venue || '',
    street: addr.street || '',
    city: addr.city || '',
    state: addr.state || '',
    zipCode: addr.zipCode || addr.zip || '',
    description: initialEvent?.description || '',
    showOnExplore: initialEvent?.showOnExplore !== false,
    coverPreview: cover,
    coverUrl: cover,
    tickets: mappedTickets,
  };
}

export default function CreateEventForm({
  profile, user, organizerId, onSuccess, onCancel, mode = 'create', initialEvent,
}) {
  const isEdit = mode === 'edit' && initialEvent?.id;
  const initial = useMemo(() => (isEdit ? mapEventToFormState(initialEvent) : null), [isEdit, initialEvent]);

  const now = useMemo(() => new Date(), []);
  const defaultEnd = useMemo(() => {
    const d = new Date(now);
    d.setHours(d.getHours() + 2);
    return d;
  }, [now]);

  const [title, setTitle] = useState(initial?.title || '');
  const [date, setDate] = useState(initial?.date || toLocalDateValue(now));
  const [startTime, setStartTime] = useState(initial?.startTime || toLocalTimeValue(now));
  const [endTime, setEndTime] = useState(initial?.endTime || toLocalTimeValue(defaultEnd));
  const [hasEndTime, setHasEndTime] = useState(initial?.hasEndTime || false);
  const [venue, setVenue] = useState(initial?.venue || '');
  const [street, setStreet] = useState(initial?.street || '');
  const [city, setCity] = useState(initial?.city || '');
  const [state, setState] = useState(initial?.state || '');
  const [zipCode, setZipCode] = useState(initial?.zipCode || '');
  const [coordinates, setCoordinates] = useState(initialEvent?.address?.coordinates || null);
  const [description, setDescription] = useState(initial?.description || '');
  const [showOnExplore, setShowOnExplore] = useState(initial?.showOnExplore ?? true);
  const [coverPreview, setCoverPreview] = useState(initial?.coverPreview || '');
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || '');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState(initial?.tickets || [EMPTY_TICKET()]);
  const [activeTicketIdx, setActiveTicketIdx] = useState(0);

  const updateTicket = (index, field, value) =>
    setTickets((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));

  const addTicket = () => setTickets((prev) => {
    const next = [...prev, EMPTY_TICKET()];
    setActiveTicketIdx(next.length - 1);
    return next;
  });

  const removeTicket = (index) => setTickets((prev) => {
    const next = prev.filter((_, i) => i !== index);
    setActiveTicketIdx((ai) => Math.min(ai, Math.max(0, next.length - 1)));
    return next;
  });

  const updateInclude = (tIndex, iIndex, value) => setTickets((prev) => prev.map((t, i) => {
    if (i !== tIndex) return t;
    const includes = [...(t.includes || [])];
    includes[iIndex] = value;
    return { ...t, includes };
  }));

  const addInclude = (tIndex) => setTickets((prev) => prev.map((t, i) =>
    i === tIndex ? { ...t, includes: [...(t.includes || []), ''] } : t,
  ));

  const removeInclude = (tIndex, iIndex) => setTickets((prev) => prev.map((t, i) => {
    if (i !== tIndex) return t;
    const includes = (t.includes || []).filter((_, j) => j !== iIndex);
    return { ...t, includes: includes.length ? includes : [''] };
  }));

  const handleCoverPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setCoverPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { url } = await apiUpload('/api/dashboard/upload', file, { folder: 'events/new' });
      setCoverUrl(url);
    } catch (err) {
      setError(err.message);
      setCoverPreview('');
      setCoverUrl('');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return setError('Enter an event title');
    if (!venue.trim()) return setError('Enter a venue name');
    if (!street.trim()) return setError('Enter a street address');
    for (const t of tickets) {
      if (!t.type.trim()) return setError('Every ticket needs a name');
      if (!t.isFree && !t.price) return setError('Set a price or mark ticket as free');
      if (!t.isUnlimited && !t.quantity) return setError('Set ticket quantity or mark unlimited');
    }

    setError('');
    setSubmitting(true);
    try {
      const payload = {
        organizerId,
        title,
        date: combineDateTime(date, startTime),
        startTime: combineDateTime(date, startTime),
        endTime: hasEndTime ? combineDateTime(date, endTime) : null,
        hasEndTime,
        venue,
        address: { street, city, state, zipCode, coordinates },
        description,
        showOnExplore,
        coverImage: coverUrl,
        flyers: coverUrl ? [coverUrl] : [],
        tickets,
      };

      if (isEdit) {
        const { event } = await apiFetch(`/api/dashboard/events/${initialEvent.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ organizerId, fullEdit: payload }),
        });
        onSuccess?.(event);
      } else {
        const { event } = await apiFetch('/api/dashboard/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        onSuccess?.(event);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const ai = Math.min(activeTicketIdx, tickets.length - 1);
  const ticket = tickets[ai];

  return (
    <form className="sdc-create" onSubmit={(e) => e.preventDefault()}>
      <div className="sdc-create-layout">

        {/* ── LEFT: cover + identity ── */}
        <aside className="sdc-create-left">
          <div className="sdc-create-cover">
            <label className="sdc-create-cover-label">
              {coverPreview
                ? <img src={coverPreview} alt="" className="sdc-create-cover-img" />
                : <span className="sdc-create-cover-empty">{uploading ? 'Uploading…' : 'Tap to add cover'}</span>}
              <input type="file" accept="image/*" onChange={handleCoverPick} hidden />
            </label>
            {coverPreview && (
              <label className="sdc-create-cover-edit">
                Change
                <input type="file" accept="image/*" onChange={handleCoverPick} hidden />
              </label>
            )}
          </div>

          <div className="sdc-create-identity">
            <input
              className="sdc-create-title-input"
              type="text"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              placeholder="Event name"
            />
            <label className="sdc-field">
              <span>Venue</span>
              <input type="text" value={venue} onChange={(ev) => setVenue(ev.target.value)} placeholder="The Grand Hall" />
            </label>
            <label className="sdc-field">
              <span>Street address</span>
              <AddressAutocomplete
                value={street}
                onChange={setStreet}
                onSelect={(addr) => {
                  if (addr.street) setStreet(addr.street);
                  if (addr.city) setCity(addr.city);
                  if (addr.state) setState(addr.state);
                  if (addr.zipCode) setZipCode(addr.zipCode);
                  if (addr.venue && !venue.trim()) setVenue(addr.venue);
                  setCoordinates(addr.coordinates || null);
                }}
                placeholder="123 Main St"
              />
            </label>
            <div className="sdc-field-row sdc-field-row-3">
              <label className="sdc-field">
                <span>City</span>
                <input type="text" value={city} onChange={(ev) => setCity(ev.target.value)} />
              </label>
              <label className="sdc-field">
                <span>State</span>
                <input type="text" value={state} onChange={(ev) => setState(ev.target.value)} />
              </label>
              <label className="sdc-field">
                <span>Zip</span>
                <input type="text" value={zipCode} onChange={(ev) => setZipCode(ev.target.value)} />
              </label>
            </div>
          </div>
        </aside>

        {/* ── RIGHT: everything else ── */}
        <div className="sdc-create-right">

          {/* Date & time */}
          <section className="sdc-create-section-block">
            <p className="sdc-create-section-label">Date &amp; time</p>
            <div className="sdc-field-row">
              <label className="sdc-field">
                <span>Date</span>
                <input type="date" value={date} onChange={(ev) => setDate(ev.target.value)} />
              </label>
              <label className="sdc-field">
                <span>Start time</span>
                <input type="time" value={startTime} onChange={(ev) => setStartTime(ev.target.value)} />
              </label>
            </div>
            <label className="sdc-check">
              <input type="checkbox" checked={hasEndTime} onChange={(ev) => setHasEndTime(ev.target.checked)} />
              <span>Set end time</span>
            </label>
            {hasEndTime && (
              <label className="sdc-field" style={{ marginTop: 10 }}>
                <span>End time</span>
                <input type="time" value={endTime} onChange={(ev) => setEndTime(ev.target.value)} />
              </label>
            )}
          </section>

          {/* Description */}
          <section className="sdc-create-section-block">
            <p className="sdc-create-section-label">About this event</p>
            <div className="sdc-lined-field-wrap">
              <textarea
                className="sdc-lined-textarea"
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                placeholder="Tell guests what to expect…"
                rows={7}
              />
              <div className="sdc-lined-field-lines" aria-hidden="true" />
            </div>
          </section>

          {/* Tickets */}
          <section className="sdc-create-section-block">
            <div className="sdc-ticket-selector">
              <p className="sdc-create-section-label" style={{ flex: 1 }}>Tickets</p>
              <div className="sdc-ticket-select-wrap">
                <select className="sdc-ticket-select" value={ai} onChange={(ev) => setActiveTicketIdx(Number(ev.target.value))}>
                  {tickets.map((t, i) => (
                    <option key={i} value={i}>{t.type || `Ticket ${i + 1}`}</option>
                  ))}
                </select>
              </div>
              <button type="button" className="sdc-link-btn" onClick={addTicket}>+ Add</button>
              {tickets.length > 1 && (
                <button type="button" className="sdc-ticket-remove-btn" onClick={() => removeTicket(ai)}>Remove</button>
              )}
            </div>

            <div className="sdc-ticket-row">
              {/* Left: ticket card */}
              <div className="sdc-ticket-shaped" style={{ '--ticket-notch-y': '86px' }}>
                <div className="sdc-ticket-stub">
                  <div className="sdc-ticket-stub-left">
                    <span className="sdc-ticket-eyebrow">Ticket type</span>
                    <input
                      className="sdc-ticket-name-input"
                      type="text"
                      value={ticket.type}
                      onChange={(ev) => updateTicket(ai, 'type', ev.target.value)}
                      placeholder="General Admission"
                    />
                  </div>
                </div>
                <div className="sdc-ticket-perf" />
                <div className="sdc-ticket-body">
                  <div className="sdc-field-row">
                    <label className="sdc-check">
                      <input type="checkbox" checked={ticket.isFree} onChange={(ev) => updateTicket(ai, 'isFree', ev.target.checked)} />
                      <span>Free</span>
                    </label>
                    <label className="sdc-check">
                      <input type="checkbox" checked={ticket.isUnlimited} onChange={(ev) => updateTicket(ai, 'isUnlimited', ev.target.checked)} />
                      <span>Unlimited qty</span>
                    </label>
                  </div>
                  <div className="sdc-ticket-price-row">
                    <label className="sdc-field">
                      <span>Price ($)</span>
                      <input
                        type="text"
                        value={ticket.isFree ? '0' : ticket.price}
                        onChange={(ev) => !ticket.isFree && updateTicket(ai, 'price', ev.target.value)}
                        placeholder="25"
                        readOnly={ticket.isFree}
                        className={ticket.isFree ? 'sdc-field-locked' : ''}
                      />
                    </label>
                    <label className="sdc-field">
                      <span>Quantity</span>
                      <input
                        type="text"
                        value={ticket.isUnlimited ? '∞' : ticket.quantity}
                        onChange={(ev) => !ticket.isUnlimited && updateTicket(ai, 'quantity', ev.target.value)}
                        placeholder="100"
                        readOnly={ticket.isUnlimited}
                        className={ticket.isUnlimited ? 'sdc-field-locked' : ''}
                      />
                    </label>
                  </div>
                  <label className="sdc-field">
                    <span>Special instructions (optional)</span>
                    <input type="text" value={ticket.instructions} onChange={(ev) => updateTicket(ai, 'instructions', ev.target.value)} placeholder="21+ only, ID required at door" />
                  </label>
                </div>
              </div>

              {/* Right: what's included */}
              <div className="sdc-ticket-includes-panel">
                <p className="sdc-ticket-includes-label">What&apos;s included</p>
                <ul className="sdc-ticket-includes-list">
                  {(ticket.includes || []).map((item, iIndex) => (
                    <li key={iIndex} className="sdc-ticket-include-item">
                      <span className="sdc-ticket-include-bullet">—</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(ev) => updateInclude(ai, iIndex, ev.target.value)}
                        placeholder="e.g. Entry, welcome drink…"
                      />
                      {(ticket.includes.length > 1 || item) && (
                        <button type="button" className="sdc-include-remove" onClick={() => removeInclude(ai, iIndex)} aria-label="Remove">×</button>
                      )}
                    </li>
                  ))}
                </ul>
                <button type="button" className="sdc-link-btn" onClick={() => addInclude(ai)}>+ Add item</button>
              </div>
            </div>
          </section>

          {/* Options + Submit */}
          <section className="sdc-create-section-block sdc-create-footer">
            <label className="sdc-check">
              <input type="checkbox" checked={showOnExplore} onChange={(ev) => setShowOnExplore(ev.target.checked)} />
              <span>Show on Explore page</span>
            </label>
            {error && <p className="sdc-create-error">{error}</p>}
            <button
              type="button"
              className="sdc-create-submit"
              onClick={handleCreate}
              disabled={submitting || uploading}
            >
              {submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create event')}
            </button>
          </section>
        </div>
      </div>
    </form>
  );
}

export function CreateEventSuccess({ event, onDone }) {
  return (
    <div className="sdc-create-success">
      <h2>Event created</h2>
      <p className="sdc-create-success-title">{event.title}</p>
      <div className="sdc-create-code">
        <span>Check-in code</span>
        <strong>{event.verificationCode || '------'}</strong>
      </div>
      <p className="sdc-hint">Share this code with door staff for ticket scanning in the Samba app.</p>
      <div className="sdc-create-actions">
        <Link href={`/events/${event.id}`} className="sdc-link-btn">View event page</Link>
        <button type="button" className="sdc-create-submit" onClick={onDone}>Back to events</button>
      </div>
    </div>
  );
}
