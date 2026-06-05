export default function GiveawayCard({ className = '' }) {
  return (
    <div className={`lp-float ${className}`}>
      <div className="lp-giveaway-card">
        <div className="lp-giveaway-body">
          <div className="lp-giveaway-copy">
            <span className="lp-giveaway-label">Giveaway</span>
            <strong className="lp-giveaway-headline">
              Win 2 VIP
              <br />
              Tickets
            </strong>
            <span className="lp-giveaway-event">Olamide Live in Concert</span>
            <span className="lp-giveaway-cta">Follow · Like · Share</span>
          </div>
          <div className="lp-giveaway-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="4" y="10" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 10V20" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M12 10c-2.2 0-3.5-1.4-3.5-3S9.8 4 12 4s3.5 1.4 3.5 3-1.3 3-3.5 3Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path d="M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
