'use client';

import Link from 'next/link';
import { formatDuration } from '../../lib/event-manage';

export default function EventManageLayout({ event, backHref, headerCenter, headerRight, children }) {
  const cover = event?.coverImage || event?.flyers?.[0] || null;

  // Only show duration when both start and end are stored — never fall back to now
  const startRef = event?.startTime;
  const endRef = event?.endTime;
  const duration = (startRef && endRef) ? formatDuration(startRef, endRef) : null;

  return (
    <div className="evm-page evm-split-page">
      {/* Slim top bar */}
      <header className="evm-split-topbar">
        <Link href={backHref} className="evm-back">← Events</Link>
        {headerCenter && <span className="evm-split-center">{headerCenter}</span>}
        <span className="evm-split-right">{headerRight || duration || ''}</span>
      </header>

      <div className="evm-split-body">
        {/* LEFT: portrait cover */}
        <aside className="evm-split-cover-side">
          <div className="evm-split-cover">
            {cover
              ? <img src={cover} alt={event?.title || ''} className="evm-split-cover-img" />
              : <span className="evm-split-cover-ph">{event?.title?.[0] || '?'}</span>}
          </div>
          <div className="evm-split-cover-meta">
            <h1 className="evm-split-title">{event?.title}</h1>
            {event?.venue && <p className="evm-split-venue">{event.venue}</p>}
            {event?.dateLabel && <p className="evm-split-date">{event.dateLabel}</p>}
            {duration && <p className="evm-split-dur">⏱ {duration}</p>}
          </div>
        </aside>

        {/* RIGHT: all content stacks */}
        <div className="evm-split-content">
          {children}
        </div>
      </div>
    </div>
  );
}
