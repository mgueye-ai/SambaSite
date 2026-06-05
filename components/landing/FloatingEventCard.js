export default function FloatingEventCard({
  category,
  title,
  sub,
  gradient = 'lp-grad-1',
  image,
  position,
  variant = 'compact',
  cta,
}) {
  const isLandscape = variant === 'landscape';
  const isPortrait = variant === 'portrait';
  const isFullArt = isLandscape || isPortrait;

  return (
    <div className={`lp-float ${position}`}>
      <div className={`lp-event-card lp-event-card-${variant}`}>
        <div
          className={`lp-event-thumb ${gradient}`}
          style={image ? { backgroundImage: `url(${image})` } : undefined}
          role={isFullArt ? 'img' : undefined}
          aria-label={isFullArt ? `${category}: ${title}` : undefined}
        />
        {!isFullArt ? (
          <div className="lp-event-info">
            <div className="lp-event-cat">{category}</div>
            <div className="lp-event-title">{title}</div>
            {sub ? <div className="lp-event-sub">{sub}</div> : null}
            {cta ? <span className="lp-event-cta">{cta}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
