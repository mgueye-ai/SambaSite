'use client';

import Link from 'next/link';
import {
  AreaChart, BarChart, fmt$, fmtN, HeroStat, SectionLabel, SdcCard,
} from '../dashboard/ui';
import { computeEventMetrics, formatDuration } from '../../lib/event-manage';
import EventGuestsList from './EventGuestsList';

export default function PastEventStatsView({ event, tickets, backHref }) {
  const metrics = computeEventMetrics(event, tickets);
  const duration = formatDuration(event.startTime, event.endTime);
  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="evm-page">
      <header className="evm-lip">
        <Link href={backHref} className="evm-back">← Events</Link>
        <span className="evm-lip-meta">{duration}</span>
      </header>

      <div className="evm-body">
        <h1 className="evm-title">{event.title}</h1>
        <div className="evm-badge-row">
          <span className="evm-badge evm-badge-completed">Completed</span>
          {eventDate && <span className="evm-badge-sub">· {eventDate}</span>}
        </div>
        {event.venue && <p className="evm-venue">{event.venue}</p>}

        <div className="sdc-hero-grid sdc-hero-grid-3">
          <HeroStat label="Revenue" value={fmt$(metrics.revenueAmount)} accent />
          <HeroStat label="Checked in" value={fmtN(metrics.checkedInCount)} />
          <HeroStat label="Check-in rate" value={`${metrics.checkInPct}%`} />
        </div>

        <div className="sdc-grid-2">
          <SdcCard title="Check-ins over time">
            <AreaChart data={metrics.checkInSeries} labels={metrics.checkInLabels} color="#888888" formatY={fmtN} />
          </SdcCard>
          <SdcCard title="Ticket sales" meta={`${fmtN(metrics.ticketsSold)} sold`}>
            <BarChart data={metrics.salesSeries} labels={metrics.salesLabels} color="#666666" />
          </SdcCard>
        </div>

        {metrics.ticketBreakdown.length > 0 && (
          <>
            <SectionLabel>Ticket breakdown</SectionLabel>
            <div className="evm-ticket-grid">
              {metrics.ticketBreakdown.map((tk) => {
                const pct = tk.total > 0 ? Math.round((tk.sold / tk.total) * 100) : 0;
                return (
                  <div key={tk.name} className="evm-ticket-card">
                    <strong>{tk.name}</strong>
                    <span>{fmtN(tk.sold)}{tk.total > 0 ? ` / ${fmtN(tk.total)}` : ''}</span>
                    <div className="sdc-hbar-track"><div className="sdc-hbar-fill" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                    {tk.price > 0 && <span className="evm-ticket-price">${tk.price} each</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <SectionLabel>Guest list</SectionLabel>
        <SdcCard>
          <EventGuestsList tickets={metrics.eventTickets} />
        </SdcCard>

        {metrics.recentCheckIns.length > 0 && (
          <>
            <SectionLabel>Recent check-ins</SectionLabel>
            <div className="evm-checkin-list">
              {metrics.recentCheckIns.map((c, i) => (
                <div key={i} className="evm-checkin-row">
                  <strong>{c.name}</strong>
                  <span>{c.ticketType || 'Ticket'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
