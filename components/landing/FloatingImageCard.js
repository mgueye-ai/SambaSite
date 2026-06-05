export default function FloatingImageCard({
  className = '',
  gradient = 'lp-grad-1',
  image,
  label,
  title,
  shape = 'rounded',
}) {
  return (
    <div className={`lp-float ${className}`}>
      <div
        className={`lp-image-card lp-image-card-${shape} ${gradient}`}
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      >
        <div className="lp-image-card-shine" />
        {label || title ? (
          <div className="lp-image-card-caption">
            {label ? <span>{label}</span> : null}
            {title ? <strong>{title}</strong> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
