'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function Icon({ name, size = 20, color = '#FFFFFF' }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'search')       return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if (name === 'x')            return <svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  if (name === 'calendar')     return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (name === 'chevron-left') return <svg {...p}><polyline points="15 18 9 12 15 6"/></svg>;
  if (name === 'chevron-right')return <svg {...p}><polyline points="9 18 15 12 9 6"/></svg>;
  if (name === 'map-pin')      return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
  if (name === 'check')        return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
  return null;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function InlineCalendar({ selected, onSelect }) {
  const today = new Date();
  const [yr, setYr] = useState(today.getFullYear());
  const [mo, setMo] = useState(today.getMonth());
  const prevMo = () => { if (mo === 0) { setMo(11); setYr((y) => y - 1); } else setMo((m) => m - 1); };
  const nextMo = () => { if (mo === 11) { setMo(0); setYr((y) => y + 1); } else setMo((m) => m + 1); };
  const first = new Date(yr, mo, 1).getDay();
  const days = new Date(yr, mo + 1, 0).getDate();
  const cells = Array(first).fill(null).concat(Array.from({ length: days }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);
  const isSel = (d) => selected && selected.getDate() === d && selected.getMonth() === mo && selected.getFullYear() === yr;
  const isTdy = (d) => d === today.getDate() && mo === today.getMonth() && yr === today.getFullYear();
  return (
    <div className="ex-cal">
      <div className="ex-cal-nav">
        <button type="button" onClick={prevMo}><Icon name="chevron-left" size={20}/></button>
        <span>{MONTHS[mo]} {yr}</span>
        <button type="button" onClick={nextMo}><Icon name="chevron-right" size={20}/></button>
      </div>
      <div className="ex-cal-row ex-cal-headers">{DAY_LABELS.map((d) => <span key={d} className="ex-cal-day-h">{d}</span>)}</div>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <div key={r} className="ex-cal-row">
          {cells.slice(r * 7, r * 7 + 7).map((d, i) => (
            <button key={i} type="button" className={`ex-cal-cell${d && isSel(d) ? ' ex-cal-sel' : ''}${d && isTdy(d) ? ' ex-cal-today' : ''}`} onClick={() => d && onSelect(new Date(yr, mo, d))} disabled={!d}>{d || ''}</button>
          ))}
        </div>
      ))}
      {selected && <button type="button" className="ex-cal-clear" onClick={() => onSelect(null)}>Clear date filter</button>}
    </div>
  );
}

/* ── Mobile grid card (original style) ── */
function MobileCard({ event }) {
  return (
    <Link href={`/events/${event.id}`} className="ex-card">
      {event.image ? <img src={event.image} alt="" className="ex-card-img"/> : <div className="ex-card-img ex-card-fallback"/>}
      <div className="ex-card-gradient"/>
      <span className="ex-card-cat">{event.category?.toUpperCase()}</span>
      <div className="ex-card-bottom">
        <span className="ex-card-title">{event.title}</span>
        <div className="ex-card-loc"><Icon name="map-pin" size={10} color="rgba(255,255,255,0.7)"/><span>{event.location || 'Venue TBD'}</span></div>
        <span className="ex-card-date">{event.date}{event.time ? `  ·  ${event.time}` : ''}</span>
      </div>
    </Link>
  );
}

/* ── Desktop featured card (large landscape) ── */
function FeaturedCard({ event }) {
  const orgName = event.organizerName || 'Organizer';
  return (
    <Link href={`/events/${event.id}`} className="exd-feat-card">
      <div className="exd-feat-cover">
        {event.image
          ? <img src={event.image} alt=""/>
          : <div className="exd-feat-cover-ph"><span>{event.title?.[0]}</span></div>}
        <div className="exd-feat-gradient"/>
        <div className="exd-feat-inner">
          <span className="exd-feat-cat">{event.category?.toUpperCase()}</span>
          <h3 className="exd-feat-title">{event.title}</h3>
          <div className="exd-feat-meta">
            {event.organizerAvatar
              ? <img src={event.organizerAvatar} alt="" className="exd-feat-org-avatar"/>
              : <span className="exd-feat-org-avatar exd-feat-org-initial">{orgName[0]}</span>}
            <span className="exd-feat-org-name">{orgName}</span>
            <span className="exd-feat-dot">·</span>
            <span>{event.date}{event.time ? `, ${event.time}` : ''}</span>
            {event.location && <><span className="exd-feat-dot">·</span><span>{event.location}</span></>}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Desktop card: portrait image + info to the right ── */
function DesktopCard({ event }) {
  const orgName = event.organizerName || 'Organizer';
  const orgInitial = orgName[0]?.toUpperCase();

  return (
    <Link href={`/events/${event.id}`} className="exd-card">
      {/* Portrait cover */}
      <div className="exd-card-cover">
        {event.image
          ? <img src={event.image} alt=""/>
          : <div className="exd-card-cover-ph"><span>{event.title?.[0]}</span></div>}
        <div className="exd-card-cover-gradient"/>
        <span className="exd-card-cat-badge">{event.category?.toUpperCase()}</span>
      </div>

      {/* Info panel — floats to the right of the image */}
      <div className="exd-card-info">
        <div className="exd-card-org">
          <div className="exd-card-org-avatar">
            {event.organizerAvatar
              ? <img src={event.organizerAvatar} alt=""/>
              : <span>{orgInitial}</span>}
          </div>
          <span className="exd-card-org-name">{orgName}</span>
          <span className="exd-card-org-check" title="Verified">
            <Icon name="check" size={10} color="#000"/>
          </span>
        </div>

        <p className="exd-card-info-title">{event.title}</p>

        <div className="exd-card-info-meta">
          {event.date && <span>{event.date}{event.time ? ` · ${event.time}` : ''}</span>}
          {event.location && (
            <span className="exd-card-info-loc">
              <Icon name="map-pin" size={10} color="rgba(255,255,255,0.35)"/>
              {event.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ExploreView({ events }) {
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [calOpen, setCalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const displayEvents = useMemo(() => events.map((event) => {
    const dateObj = event.date ? new Date(event.date) : null;
    const validDate = dateObj && !Number.isNaN(dateObj.getTime());
    const timeObj = event.startTime ? new Date(event.startTime) : null;
    return {
      id: event.id,
      title: event.title,
      category: event.category || 'Event',
      location: event.venue || event.address?.formatted || '',
      date: validDate ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD',
      time: validDate && timeObj ? timeObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
      rawDate: dateObj,
      image: event.coverImage || event.flyers?.[0] || null,
      organizerName: event.organizer?.name || '',
      organizerAvatar: event.organizer?.avatar || event.organizer?.partyLogo || null,
    };
  }), [events]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return displayEvents.filter((ev) => {
      if (dateFilter && ev.rawDate && !sameDay(ev.rawDate, dateFilter)) return false;
      if (!q) return true;
      return ev.title.toLowerCase().includes(q) || (ev.location || '').toLowerCase().includes(q) || ev.category.toLowerCase().includes(q) || ev.date.toLowerCase().includes(q);
    });
  }, [displayEvents, query, dateFilter]);

  /* Group by date for desktop view */
  const grouped = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const groups = new Map();
    filtered.forEach((ev) => {
      let label = ev.date;
      if (ev.rawDate) {
        if (sameDay(ev.rawDate, today))    label = 'Today';
        else if (sameDay(ev.rawDate, tomorrow)) label = 'Tomorrow';
        else label = ev.rawDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(ev);
    });
    return Array.from(groups.entries());
  }, [filtered]);

  const searchBar = (
    <div className="ex-search-row">
      <div className="ex-search-bar">
        <Icon name="search" size={16} color="rgba(255,255,255,0.4)"/>
        <input type="search" placeholder="Search events…" value={query} onChange={(e) => setQuery(e.target.value)}/>
        {query.length > 0 && (
          <button type="button" className="ex-clear" onClick={() => setQuery('')}>
            <Icon name="x" size={14} color="rgba(255,255,255,0.4)"/>
          </button>
        )}
      </div>
      <button type="button" className={`ex-cal-btn${calOpen || dateFilter ? ' ex-cal-btn-active' : ''}`} onClick={() => setCalOpen((o) => !o)}>
        <Icon name="calendar" size={16} color={calOpen || dateFilter ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}/>
      </button>
    </div>
  );

  /* ── DESKTOP layout ── */
  if (isDesktop) {
    const featured = filtered.filter((e) => e.image).slice(0, 3);
    const hasFeatured = featured.length > 0 && !query && !dateFilter;

    return (
      <div className="exd-page">

        {/* Top bar */}
        <header className="exd-topbar">
          <div className="exd-topbar-left">
            <Link href="/" className="ex-back exd-back">
              <Icon name="chevron-left" size={16}/><span>Home</span>
            </Link>
            <h1 className="exd-topbar-title">Explore</h1>
          </div>

          <div className="exd-topbar-search">
            <div className="ex-search-bar exd-search-bar">
              <Icon name="search" size={15} color="rgba(255,255,255,0.35)"/>
              <input
                type="search"
                placeholder="Search events…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query.length > 0 && (
                <button type="button" className="ex-clear" onClick={() => setQuery('')}>
                  <Icon name="x" size={13} color="rgba(255,255,255,0.4)"/>
                </button>
              )}
            </div>

            {/* Calendar button + anchored dropdown */}
            <div className="exd-cal-wrap">
              <button
                type="button"
                className={`ex-cal-btn exd-cal-btn${calOpen || dateFilter ? ' ex-cal-btn-active' : ''}`}
                onClick={() => setCalOpen((o) => !o)}
              >
                <Icon name="calendar" size={15} color={calOpen || dateFilter ? '#000' : 'rgba(255,255,255,0.55)'}/>
              </button>

              {calOpen && (
                <div className="exd-cal-dropdown">
                  {dateFilter && (
                    <div className="exd-cal-active-date">
                      <Icon name="calendar" size={11} color="#f5b642"/>
                      <span>{dateFilter.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <button type="button" onClick={() => setDateFilter(null)}>
                        <Icon name="x" size={12} color="rgba(255,255,255,0.4)"/>
                      </button>
                    </div>
                  )}
                  <InlineCalendar
                    selected={dateFilter}
                    onSelect={(d) => { setDateFilter(d); if (d) setCalOpen(false); }}
                  />
                </div>
              )}
            </div>
          </div>

          <span className="exd-topbar-count">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
        </header>


        {/* Main feed */}
        <main className="exd-feed">
          {filtered.length === 0 ? (
            <div className="ex-empty">
              <Icon name="search" size={36} color="rgba(255,255,255,0.15)"/>
              <p>No events found</p>
              <span>Try a different search or date</span>
            </div>
          ) : (
            <div className="exd-all-grid">
              {filtered.map((ev) => <DesktopCard key={ev.id} event={ev}/>)}
            </div>
          )}
        </main>
      </div>
    );
  }

  /* ── MOBILE layout (original) ── */
  return (
    <div className="ex-page">
      <header className="ex-header">
        <Link href="/" className="ex-back"><Icon name="chevron-left" size={18}/><span>Home</span></Link>
        <h1>Explore</h1>
        <div className="ex-header-spacer"/>
      </header>
      <div className="ex-content">
        {searchBar}
        {calOpen && (
          <div className="ex-cal-wrap">
            <InlineCalendar selected={dateFilter} onSelect={(d) => { setDateFilter(d); if (d) setCalOpen(false); }}/>
          </div>
        )}
        {dateFilter && !calOpen && (
          <div className="ex-date-chip">
            <Icon name="calendar" size={11} color="#AAAAAA"/>
            <span>{dateFilter.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <button type="button" onClick={() => setDateFilter(null)}><Icon name="x" size={12} color="rgba(255,255,255,0.5)"/></button>
          </div>
        )}
        <p className="ex-count">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</p>
        {filtered.length > 0
          ? <div className="ex-grid">{filtered.map((ev) => <MobileCard key={ev.id} event={ev}/>)}</div>
          : <div className="ex-empty"><Icon name="search" size={36} color="rgba(255,255,255,0.15)"/><p>No events found</p><span>Try a different search or date</span></div>}
      </div>
    </div>
  );
}
