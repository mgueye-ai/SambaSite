export default function CityTag({ name, className = '' }) {
  return (
    <span className={`lp-city ${className}`}>
      <span className="lp-city-dot" />
      {name}
    </span>
  );
}
