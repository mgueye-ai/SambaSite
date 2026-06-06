'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api-client';
import {
  AreaChart, BarChart, fmt$, fmtN, HeroStat, SectionLabel, SdcCard,
} from '../dashboard/ui';
import {
  buildCheckInTrend, buildScanBars, computeEventMetrics, formatElapsed, formatTimeAgo,
} from '../../lib/event-manage';
import EventGuestsList from './EventGuestsList';
import EventManageLayout from './EventManageLayout';

export default function LiveEventStatsView({ event, tickets, organizerId, backHref }) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(() => formatElapsed(event.liveStartedAt || event.startTime));
  const [showCode, setShowCode] = useState(false);
  const [ending, setEnding] = useState(false);

  const metrics = computeEventMetrics(event, tickets);
  const liveStart = event.liveStartedAt || event.startTime;

  useEffect(() => {
    const id = setInterval(() => setElapsed(formatElapsed(liveStart)), 1000);
    return () => clearInterval(id);
  }, [liveStart]);

  const chartData = useMemo(() => {
    const scansPerMin = Math.max(2, Math.min(24, Math.round(metrics.checkedInCount / 8) || 4));
    const elapsedMins = Math.max(1, Math.floor((Date.now() - new Date(liveStart).getTime()) / 60000));
    const checkInLabels = Array.from({ length: 12 }, (_, i) => {
      const mins = Math.round((elapsedMins * i) / 11);
      return i === 0 ? 'Start' : i === 11 ? 'Now' : `${mins}m`;
    });
    return {
      checkInSeries: buildCheckInTrend(metrics.checkedInCount, (event.id || '').length + metrics.checkedInCount),
      scanSeries: buildScanBars(scansPerMin, scansPerMin + (event.id || '').length),
      checkInLabels,
      scanLabels: ['-35', '-30', '-25', '-20', '-15', '-10', '-5', 'Now'],
    };
  }, [event.id, liveStart, metrics.checkedInCount]);

  const handleEnd = async () => {
    if (!window.confirm('End this event? It will move to Past events.')) return;
    setEnding(true);
    try {
      await apiFetch(`/api/dashboard/events/${event.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ organizerId, status: 'completed' }),
      });
      router.push(`/dashboard/events/${event.id}/stats`);
      router.refresh();
    } catch (err) {
      alert(err.message);
      setEnding(false);
    }
  };

  return (
    <EventManageLayout
      event={event}
      backHref={backHref}
      headerCenter={<><span className="evm-live-dot" /> Live · {elapsed}</>}
      headerRight={
        <button type="button" className="evm-end-btn" onClick={handleEnd} disabled={ending}>
          {ending ? 'Ending…' : 'End event'}
        </button>
      }
    >
      <div className="sdc-hero-grid sdc-hero-grid-3">
        <HeroStat label="Revenue" value={fmt$(metrics.revenueAmount)} accent />
        <HeroStat label="Checked in" value={fmtN(metrics.checkedInCount)} />
        <HeroStat label="Check-in rate" value={`${metrics.checkInPct}%`} />
      </div>

      <div className="sdc-grid-2">
        <SdcCard title="Check-ins over time">
          <AreaChart data={chartData.checkInSeries} labels={chartData.checkInLabels} color="#888888" formatY={fmtN} />
        </SdcCard>
        <SdcCard title="Door activity" meta="Avg scans / min">
          <BarChart data={chartData.scanSeries} labels={chartData.scanLabels} color="#666666" />
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

      <SdcCard title="Scanner code" meta="For door staff in the Samba app">
        <button type="button" className="evm-code-btn" onClick={() => setShowCode((v) => !v)}>
          {showCode ? event.verificationCode || '------' : 'Tap to reveal code'}
        </button>
        <p className="sdc-hint">Use Scan Tickets in the Samba app to check guests in at the door.</p>
      </SdcCard>

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
                <span>{c.ticketType || 'Ticket'} · {formatTimeAgo(c.timestamp)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </EventManageLayout>
  );
}
