'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function Icon({ name, size = 20, color = '#FFFFFF' }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  if (name === 'search') return <svg {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
  if (name === 'x') return <svg {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
  if (name === 'calendar') return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
  if (name === 'chevron-left') return <svg {...props}><polyline points="15 18 9 12 15 6" /></svg>;
  if (name === 'chevron-right') return <svg {...props}><polyline points="9 18 15 12 9 6" /></svg>;
  if (name === 'map-pin') return <svg {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
  return null;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function InlineCalendar({ selected, onSelect }) {
  const today = new Date();
  const [yr, setYr] = useState(today.getFullYear());
  const [mo, setMo] = useState(today.getMonth());

  const prevMo = () => {
    if (mo === 0) {
      setMo(11);
      setYr((y) => y - 1);
    } else setMo((m) => m - 1);
  };
  const nextMo = () => {
    if (mo === 11) {
      setMo(0);
      setYr((y) => y + 1);
    } else setMo((m) => m + 1);
  };

  const first = new Date(yr, mo, 1).getDay();
  const days = new Date(yr, mo + 1, 0).getDate();
  const cells = Array(first).fill(null).concat(Array.from({ length: days }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  const isSel = (d) =>
    selected &&
    selected.getDate() === d &&
    selected.getMonth() === mo &&
    selected.getFullYear() === yr;
  const isTdy = (d) =>
    d === today.getDate() && mo === today.getMonth() && yr === today.getFullYear();

  return (
    <div className="ex-cal">
      <div className="ex-cal-nav">
        <button type="button" onClick={prevMo} aria-label="Previous month">
          <Icon name="chevron-left" size={20} />
        </button>
        <span>{MONTHS[mo]} {yr}</span>
        <button type="button" onClick={nextMo} aria-label="Next month">
          <Icon name="chevron-right" size={20} />
        </button>
      </div>
      <div className="ex-cal-row ex-cal-headers">
        {DAY_LABELS.map((d) => (
          <span key={d} className="ex-cal-day-h">{d}</span>
        ))}
      </div>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <div key={r} className="ex-cal-row">
          {cells.slice(r * 7, r * 7 + 7).map((d, i) => (
            <button
              key={i}
              type="button"
              className={`ex-cal-cell${d && isSel(d) ? ' ex-cal-sel' : ''}${d && isTdy(d) ? ' ex-cal-today' : ''}`}
              onClick={() => d && onSelect(new Date(yr, mo, d))}
              disabled={!d}
            >
              {d || ''}
            </button>
          ))}
        </div>
      ))}
      {selected && (
        <button type="button" className="ex-cal-clear" onClick={() => onSelect(null)}>
          Clear date filter
        </button>
      )}
    </div>
  );
}

function SmallEventCard({ event }) {
  return (
    <Link href={`/events/${event.id}`} className="ex-card">
      {event.image ? (
        <img src={event.image} alt="" className="ex-card-img" />
      ) : (
        <div className="ex-card-img ex-card-fallback" />
      )}
      <div className="ex-card-gradient" />
      <span className="ex-card-cat">{event.category?.toUpperCase()}</span>
      <div className="ex-card-bottom">
        <span className="ex-card-title">{event.title}</span>
        <div className="ex-card-loc">
          <Icon name="map-pin" size={10} color="rgba(255,255,255,0.7)" />
          <span>{event.location || 'Venue TBD'}</span>
        </div>
        <span className="ex-card-date">
          {event.date}{event.time ? `  ·  ${event.time}` : ''}
        </span>
      </div>
    </Link>
  );
}

export default function ExploreView({ events }) {
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [calOpen, setCalOpen] = useState(false);

  const displayEvents = useMemo(
    () =>
      events.map((event) => {
        const dateObj = event.date ? new Date(event.date) : null;
        const validDate = dateObj && !Number.isNaN(dateObj.getTime());
        const timeObj = event.startTime ? new Date(event.startTime) : null;

        return {
          id: event.id,
          title: event.title,
          category: event.category || 'Event',
          location: event.venue || event.address?.formatted || '',
          date: validDate
            ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            : 'TBD',
          time: validDate && timeObj
            ? timeObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            : '',
          rawDate: dateObj,
          image: event.coverImage || event.flyers?.[0] || null,
        };
      }),
    [events]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return displayEvents.filter((ev) => {
      if (dateFilter && ev.rawDate && !sameDay(ev.rawDate, dateFilter)) return false;
      if (!q) return true;
      return (
        ev.title.toLowerCase().includes(q) ||
        (ev.location || '').toLowerCase().includes(q) ||
        ev.category.toLowerCase().includes(q) ||
        ev.date.toLowerCase().includes(q)
      );
    });
  }, [displayEvents, query, dateFilter]);

  return (
    <div className="ex-page">
      <header className="ex-header">
        <Link href="/" className="ex-back">
          <Icon name="chevron-left" size={18} />
          <span>Home</span>
        </Link>
        <h1>Explore</h1>
        <div className="ex-header-spacer" />
      </header>

      <div className="ex-content">
        <div className="ex-search-row">
          <div className="ex-search-bar">
            <Icon name="search" size={16} color="rgba(255,255,255,0.4)" />
            <input
              type="search"
              placeholder="Search events…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query.length > 0 && (
              <button type="button" className="ex-clear" onClick={() => setQuery('')} aria-label="Clear search">
                <Icon name="x" size={14} color="rgba(255,255,255,0.4)" />
              </button>
            )}
          </div>
          <button
            type="button"
            className={`ex-cal-btn${calOpen || dateFilter ? ' ex-cal-btn-active' : ''}`}
            onClick={() => setCalOpen((o) => !o)}
            aria-label="Toggle calendar"
          >
            <Icon
              name="calendar"
              size={16}
              color={calOpen || dateFilter ? '#FF4B8C' : 'rgba(255,255,255,0.6)'}
            />
          </button>
        </div>

        {calOpen && (
          <div className="ex-cal-wrap">
            <InlineCalendar
              selected={dateFilter}
              onSelect={(d) => {
                setDateFilter(d);
                if (d) setCalOpen(false);
              }}
            />
          </div>
        )}

        {dateFilter && !calOpen && (
          <div className="ex-date-chip">
            <Icon name="calendar" size={11} color="#FF4B8C" />
            <span>
              {dateFilter.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button type="button" onClick={() => setDateFilter(null)} aria-label="Clear date filter">
              <Icon name="x" size={12} color="rgba(255,255,255,0.5)" />
            </button>
          </div>
        )}

        <p className="ex-count">
          {filtered.length} event{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length > 0 ? (
          <div className="ex-grid">
            {filtered.map((event) => (
              <SmallEventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="ex-empty">
            <Icon name="search" size={36} color="rgba(255,255,255,0.15)" />
            <p>No events found</p>
            <span>Try a different search or date</span>
          </div>
        )}
      </div>
    </div>
  );
}
