import Link from 'next/link';
import LandingIcon from './LandingIcon';

export default function CityCard({ name, country, count, theme, image }) {
  return (
    <Link href="/explore" className={`lp-city-card lp-city-card--${theme}`}>
      <div
        className="lp-city-card-bg"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden="true"
      />
      <div className="lp-city-card-overlay" aria-hidden="true" />

      <div className="lp-city-card-top">
        <span className="lp-city-card-icon">
          <LandingIcon name="map-pin" size={16} />
        </span>
        <span className="lp-city-card-badge">
          <LandingIcon name="calendar" size={12} />
          {count}
        </span>
      </div>

      <div className="lp-city-card-body">
        <span className="lp-city-card-country">{country}</span>
        <h3>{name}</h3>
        <span className="lp-city-card-link">
          Explore events
          <LandingIcon name="arrow-right" size={14} />
        </span>
      </div>
    </Link>
  );
}
