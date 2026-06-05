import Link from 'next/link';

const BADGE_ICONS = {
  trending: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1.5 7.4 4.6 10.8 5l-2.4 2.1.7 3.3L6 9.2 3.9 10.4l.7-3.3L2.2 5l3.4-.5L6 1.5Z" fill="currentColor" />
    </svg>
  ),
  live: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="2.2" fill="currentColor" />
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" opacity="0.55" />
    </svg>
  ),
  new: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  popular: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1.8 7.1 4.6 10 4.9 7.9 7l.6 2.9L6 8.6 3.5 9.9l.6-2.9L2 4.9l2.9-.3L6 1.8Z" fill="currentColor" />
    </svg>
  ),
  featured: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1.5c.8 1.6 1.4 2.2 3 3-1.6.8-2.2 1.4-3 3-.8-1.6-1.4-2.2-3-3 1.6-.8 2.2-1.4 3-3Z" fill="currentColor" />
    </svg>
  ),
  near: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1.8c-2 0-3.6 1.5-3.6 3.4 0 2.5 3.6 5.8 3.6 5.8s3.6-3.3 3.6-5.8c0-1.9-1.6-3.4-3.6-3.4Z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="5.2" r="1.1" fill="currentColor" />
    </svg>
  ),
};

export default function EventCategoryCard({
  icon,
  label,
  title,
  desc,
  badge,
  badgeIcon = 'trending',
  theme = 'concerts',
  image,
}) {
  return (
    <article className={`lp-cat-card lp-cat-card--${theme}`}>
      <div
        className="lp-cat-card-bg"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
        aria-hidden="true"
      />
      <div className="lp-cat-card-overlay" aria-hidden="true" />

      <div className="lp-cat-card-top">
        <span className="lp-cat-card-icon">{icon}</span>
        <span className="lp-cat-card-badge">
          {BADGE_ICONS[badgeIcon]}
          {badge}
        </span>
      </div>

      <div className="lp-cat-card-body">
        <span className="lp-cat-card-label">{label}</span>
        <h3>{title}</h3>
        <p>{desc}</p>
        <Link href="/explore" className="lp-cat-card-link">
          Explore
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
