'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch, apiUpload } from '../lib/api-client';
import { DashboardAvatar } from './dashboard/ui';

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
  const [description, setDescription] = useState(initial?.description || '');
  const [showOnExplore, setShowOnExplore] = useState(initial?.showOnExplore ?? true);
  const [coverPreview, setCoverPreview] = useState(initial?.coverPreview || '');
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || '');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState(initial?.tickets || [EMPTY_TICKET()]);

  const orgName = profile?.providerInfo?.organizationName || profile?.name || user?.name || 'Organizer';
  const avatarUrl = profile?.avatar || profile?.providerInfo?.partyLogo || user?.profilePicture;

  const updateTicket = (index, field, value) => {
    setTickets((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const addTicket = () => setTickets((prev) => [...prev, EMPTY_TICKET()]);
  const removeTicket = (index) => setTickets((prev) => prev.filter((_, i) => i !== index));

  const updateInclude = (tIndex, iIndex, value) => {
    setTickets((prev) => prev.map((t, i) => {
      if (i !== tIndex) return t;
      const includes = [...(t.includes || [])];
      includes[iIndex] = value;
      return { ...t, includes };
    }));
  };

  const addInclude = (tIndex) => {
    setTickets((prev) => prev.map((t, i) => (
      i === tIndex ? { ...t, includes: [...(t.includes || []), ''] } : t
    )));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        address: { street, city, state, zipCode },
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

  return (
    <form className="sdc-create" onSubmit={handleSubmit}>
      <div className="sdc-create-layout">
        <aside className="sdc-create-preview">
          <div className="sdc-create-cover">
            <label className="sdc-create-cover-label">
              {coverPreview ? (
                <img src={coverPreview} alt="" className="sdc-create-cover-img" />
              ) : (
                <span className="sdc-create-cover-empty">
                  {uploading ? 'Uploading...' : 'Add cover image'}
                </span>
              )}
              <input type="file" accept="image/*" onChange={handleCoverPick} hidden />
            </label>
            {coverPreview && (
              <label className="sdc-create-cover-edit">
                Change image
                <input type="file" accept="image/*" onChange={handleCoverPick} hidden />
              </label>
            )}
          </div>

          <div className="sdc-create-host">
            <DashboardAvatar url={avatarUrl} name={orgName} size="sm" />
            <div>
              <p className="sdc-create-host-label">Hosted by</p>
              <p className="sdc-create-host-name">{orgName}</p>
            </div>
          </div>

          <div className="sdc-create-live-preview">
            <p className="sdc-section-label">Preview</p>
            <h3>{title.trim() || 'Event Title'}</h3>
            <p>{venue.trim() || 'Venue'} · {date} · {startTime}</p>
            {description && <p className="sdc-create-preview-desc">{description.slice(0, 120)}{description.length > 120 ? '…' : ''}</p>}
          </div>
        </aside>

        <div className="sdc-create-fields">
          <section className="sdc-create-section">
            <h2>Event basics</h2>
            <label className="sdc-field">
              <span>Event title</span>
              <input
                type="text"
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
                placeholder="Summer Rooftop Party"
                required
              />
            </label>
          </section>

          <section className="sdc-create-section">
            <h2>Date & time</h2>
            <div className="sdc-field-row">
              <label className="sdc-field">
                <span>Date</span>
                <input type="date" value={date} onChange={(ev) => setDate(ev.target.value)} required />
              </label>
              <label className="sdc-field">
                <span>Start time</span>
                <input type="time" value={startTime} onChange={(ev) => setStartTime(ev.target.value)} required />
              </label>
            </div>
            <label className="sdc-check">
              <input
                type="checkbox"
                checked={hasEndTime}
                onChange={(ev) => setHasEndTime(ev.target.checked)}
              />
              <span>Set end time</span>
            </label>
            {hasEndTime && (
              <label className="sdc-field">
                <span>End time</span>
                <input type="time" value={endTime} onChange={(ev) => setEndTime(ev.target.value)} />
              </label>
            )}
          </section>

          <section className="sdc-create-section">
            <h2>Location</h2>
            <label className="sdc-field">
              <span>Venue name</span>
              <input type="text" value={venue} onChange={(ev) => setVenue(ev.target.value)} placeholder="The Grand Hall" required />
            </label>
            <label className="sdc-field">
              <span>Street address</span>
              <input type="text" value={street} onChange={(ev) => setStreet(ev.target.value)} placeholder="123 Main St" required />
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
          </section>

          <section className="sdc-create-section">
            <h2>Description</h2>
            <label className="sdc-field">
              <span>About this event</span>
              <textarea
                rows={5}
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                placeholder="Tell guests what to expect..."
              />
            </label>
            <label className="sdc-check">
              <input
                type="checkbox"
                checked={showOnExplore}
                onChange={(ev) => setShowOnExplore(ev.target.checked)}
              />
              <span>Show on Explore page</span>
            </label>
          </section>

          <section className="sdc-create-section">
            <div className="sdc-create-section-head">
              <h2>Tickets</h2>
              <button type="button" className="sdc-link-btn" onClick={addTicket}>+ Add ticket type</button>
            </div>

            {tickets.map((ticket, index) => (
              <div key={index} className="sdc-ticket-card">
                <div className="sdc-ticket-card-head">
                  <label className="sdc-field sdc-field-grow">
                    <span>Ticket name</span>
                    <input
                      type="text"
                      value={ticket.type}
                      onChange={(ev) => updateTicket(index, 'type', ev.target.value)}
                      placeholder="General Admission"
                      required
                    />
                  </label>
                  {tickets.length > 1 && (
                    <button type="button" className="sdc-ticket-remove" onClick={() => removeTicket(index)}>Remove</button>
                  )}
                </div>

                <div className="sdc-field-row">
                  <label className="sdc-check">
                    <input
                      type="checkbox"
                      checked={ticket.isFree}
                      onChange={(ev) => updateTicket(index, 'isFree', ev.target.checked)}
                    />
                    <span>Free ticket</span>
                  </label>
                  <label className="sdc-check">
                    <input
                      type="checkbox"
                      checked={ticket.isUnlimited}
                      onChange={(ev) => updateTicket(index, 'isUnlimited', ev.target.checked)}
                    />
                    <span>Unlimited quantity</span>
                  </label>
                </div>

                <div className="sdc-field-row">
                  {!ticket.isFree && (
                    <label className="sdc-field">
                      <span>Price ($)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticket.price}
                        onChange={(ev) => updateTicket(index, 'price', ev.target.value)}
                        placeholder="25"
                      />
                    </label>
                  )}
                  {!ticket.isUnlimited && (
                    <label className="sdc-field">
                      <span>Quantity</span>
                      <input
                        type="number"
                        min="1"
                        value={ticket.quantity}
                        onChange={(ev) => updateTicket(index, 'quantity', ev.target.value)}
                        placeholder="100"
                      />
                    </label>
                  )}
                </div>

                <label className="sdc-field">
                  <span>Special instructions (optional)</span>
                  <input
                    type="text"
                    value={ticket.instructions}
                    onChange={(ev) => updateTicket(index, 'instructions', ev.target.value)}
                    placeholder="21+ only, ID required at door"
                  />
                </label>

                <div className="sdc-includes">
                  <span className="sdc-field-label">What&apos;s included</span>
                  {(ticket.includes || []).map((item, iIndex) => (
                    <input
                      key={iIndex}
                      type="text"
                      value={item}
                      onChange={(ev) => updateInclude(index, iIndex, ev.target.value)}
                      placeholder="Entry, welcome drink..."
                    />
                  ))}
                  <button type="button" className="sdc-link-btn" onClick={() => addInclude(index)}>+ Add item</button>
                </div>
              </div>
            ))}
          </section>

          {error && <p className="sdc-create-error">{error}</p>}

          <div className="sdc-create-actions">
            <button type="button" className="sdc-create-cancel" onClick={onCancel}>Cancel</button>
            <button type="submit" className="sdc-create-submit" disabled={submitting || uploading}>
              {submitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save changes' : 'Create event')}
            </button>
          </div>
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
