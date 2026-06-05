'use client';

import Link from 'next/link';
import { getEventManagePath } from '../../lib/event-manage';

export const fmt$ = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
};

export const fmtN = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
};

function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = ((prev.x + curr.x) / 2).toFixed(1);
    d += ` C ${cpx} ${prev.y.toFixed(1)}, ${cpx} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

function toPoints(data, w, h, pad = 4) {
  const max = Math.max(...data, 1);
  return data.map((v, i) => ({
    x: pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2),
    y: pad + (1 - v / max) * (h - pad * 2),
  }));
}

export function Sparkline({ data, width = 280, height = 54, color = '#AAAAAA' }) {
  if (!data?.length || data.length < 2) return null;
  const pts = toPoints(data, width, height);
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${height} L ${pts[0].x.toFixed(1)} ${height} Z`;
  const id = `spk-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} className="sdc-sparkline" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3.5" fill={color} />
    </svg>
  );
}

export function AreaChart({ data, labels, width = 560, height = 160, color = '#AAAAAA', formatY = fmt$ }) {
  if (!data?.length || data.length < 2) {
    return <p className="sdc-empty-chart">Not enough data yet</p>;
  }

  const inner = { l: 52, r: 12, t: 12, b: 28 };
  const cw = width - inner.l - inner.r;
  const ch = height - inner.t - inner.b;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({
    x: inner.l + (i / (data.length - 1)) * cw,
    y: inner.t + (1 - v / max) * ch,
  }));
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${inner.t + ch} L ${pts[0].x.toFixed(1)} ${inner.t + ch} Z`;
  const ticks = [0, 0.5, 1].map((f) => ({ v: f * max, y: inner.t + (1 - f) * ch }));
  const labelIdx = labels ? [0, Math.floor(labels.length / 2), labels.length - 1] : [];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="sdc-area-chart" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="sdcAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={inner.l} y1={t.y} x2={inner.l + cw} y2={t.y} stroke="rgba(255,255,255,0.07)" />
          <text x={inner.l - 6} y={t.y + 4} fontSize="9" fill="rgba(255,255,255,0.35)" textAnchor="end">
            {formatY(t.v)}
          </text>
        </g>
      ))}
      {labelIdx.map((i) => (
        <text key={i} x={pts[i]?.x ?? 0} y={height - 6} fontSize="9" fill="rgba(255,255,255,0.35)" textAnchor="middle">
          {labels[i]?.slice(5) || ''}
        </text>
      ))}
      <path d={area} fill="url(#sdcAreaGrad)" />
      <path d={line} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4" fill={color} />
    </svg>
  );
}

export function DonutChart({ segments, size = 140 }) {
  const thick = 18;
  const r = (size - thick) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, g) => s + g.value, 0) || 1;
  let offset = 0;

  return (
    <div className="sdc-donut-wrap">
      <svg width={size} height={size} aria-hidden>
        <g transform={`rotate(-90 ${cx} ${cx})`}>
          {segments.map((seg, i) => {
            const frac = seg.value / total;
            const dash = Math.max(0, frac - 0.01) * circ;
            const el = (
              <circle
                key={i}
                cx={cx}
                cy={cx}
                r={r}
                stroke={seg.color}
                strokeWidth={thick}
                fill="none"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset * circ}
                strokeLinecap="round"
              />
            );
            offset += frac;
            return el;
          })}
        </g>
      </svg>
      <div className="sdc-donut-legend">
        {segments.map((seg) => (
          <div key={seg.label} className="sdc-donut-legend-row">
            <span className="sdc-dot" style={{ background: seg.color }} />
            <span>{seg.label}</span>
            <strong>{seg.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ data, labels, width = 560, height = 120, color = '#666666' }) {
  if (!data?.length) return <p className="sdc-empty-chart">Not enough data yet</p>;
  const max = Math.max(...data, 1);
  const pad = { l: 12, r: 12, t: 8, b: 24 };
  const cw = width - pad.l - pad.r;
  const ch = height - pad.t - pad.b;
  const slotW = cw / data.length;
  const barW = Math.max(6, slotW - 6);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="sdc-area-chart" preserveAspectRatio="none" aria-hidden>
      {data.map((v, i) => {
        const barH = (v / max) * ch;
        const x = pad.l + i * slotW + (slotW - barW) / 2;
        const y = pad.t + ch - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={3} fill={color} opacity={i === data.length - 1 ? 1 : 0.65} />
            {labels?.[i] && (
              <text x={x + barW / 2} y={height - 6} fontSize="9" fill="rgba(255,255,255,0.35)" textAnchor="middle">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function HBar({ label, value, maxValue, color = '#666666', display }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="sdc-hbar">
      <span className="sdc-hbar-label">{label}</span>
      <div className="sdc-hbar-track">
        <div className="sdc-hbar-fill" style={{ width: `${Math.max(4, pct)}%`, background: color }} />
      </div>
      <span className="sdc-hbar-val">{display ?? value}</span>
    </div>
  );
}

export function SectionLabel({ children }) {
  return <p className="sdc-section-label">{children}</p>;
}

export function HeroStat({ label, value, sub, accent }) {
  return (
    <div className={`sdc-hero-stat${accent ? ' accent' : ''}`}>
      <span className="sdc-hero-stat-val">{value}</span>
      <span className="sdc-hero-stat-label">{label}</span>
      {sub && <span className="sdc-hero-stat-sub">{sub}</span>}
    </div>
  );
}

export function SdcCard({ title, meta, children, wide, className = '' }) {
  return (
    <div className={`sdc-card${wide ? ' wide' : ''} ${className}`.trim()}>
      {(title || meta) && (
        <div className="sdc-card-head">
          {title && <h3>{title}</h3>}
          {meta && <span className="sdc-card-meta">{meta}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export function PeriodPills({ periods, active, onChange }) {
  return (
    <div className="sdc-periods">
      {periods.map((p) => (
        <button
          key={p}
          type="button"
          className={`sdc-period${active === p ? ' active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }) {
  const cls = status === 'live' || status === 'verified' || status === 'checked_in'
    ? 'live'
    : status === 'completed' || status === 'past'
      ? 'past'
      : 'upcoming';
  return <span className={`sdc-badge sdc-badge-${cls}`}>{status}</span>;
}

export function DashboardAvatar({ url, name, size = 'md' }) {
  const initials = (name || 'OR').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  if (url) return <img src={url} alt="" className={`sdc-avatar sdc-avatar-${size}`} />;
  return <span className={`sdc-avatar sdc-avatar-${size} sdc-avatar-ph`}>{initials}</span>;
}

export function EventCard({ event, onToggleSales, onToggleExplore }) {
  const cover = event.coverImage;
  const managePath = getEventManagePath(event);
  const publicPath = `/events/${event.id}`;

  return (
    <article className={`sdc-event-card sdc-event-${event.status}`}>
      <Link href={managePath} className="sdc-event-link">
        <div className="sdc-event-cover" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
          {!cover && <span className="sdc-event-cover-ph">{event.title?.[0]}</span>}
          <StatusBadge status={event.status} />
        </div>
        <div className="sdc-event-body">
          <h4>{event.title}</h4>
          <p className="sdc-event-meta">{event.dateLabel} · {event.venue || 'Venue TBD'}</p>
          <div className="sdc-event-stats">
            <span>{event.bookedSpots || 0} sold</span>
            <span>{fmt$(event.revenue || 0)}</span>
          </div>
        </div>
      </Link>
      <div className="sdc-event-actions">
        <button
          type="button"
          className={`sdc-toggle${event.ticketSalesOpen ? ' on' : ''}`}
          onClick={() => onToggleSales?.(event)}
        >
          Sales {event.ticketSalesOpen ? 'On' : 'Off'}
        </button>
        <button
          type="button"
          className={`sdc-toggle${event.showOnExplore ? ' on' : ''}`}
          onClick={() => onToggleExplore?.(event)}
        >
          Explore {event.showOnExplore ? 'On' : 'Off'}
        </button>
        <Link href={publicPath} className="sdc-link-btn" onClick={(e) => e.stopPropagation()}>Public page</Link>
      </div>
    </article>
  );
}
