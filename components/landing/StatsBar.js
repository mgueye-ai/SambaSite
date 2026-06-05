const STATS = [
  { value: '50K+', label: 'Tickets Sold' },
  { value: '500+', label: 'Events Hosted' },
  { value: '20+', label: 'Cities' },
  { value: '100+', label: 'Organizers' },
];

export default function StatsBar() {
  return (
    <div className="lp-stats">
      {STATS.map((s) => (
        <div key={s.label} className="lp-stat">
          <div className="lp-stat-value">{s.value}</div>
          <div className="lp-stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
