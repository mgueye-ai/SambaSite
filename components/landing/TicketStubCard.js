export default function TicketStubCard({ className = '' }) {
  return (
    <div className={`lp-float ${className}`}>
      <div className="lp-ticket-stub">
        <div className="lp-ticket-stub-main">
          <span className="lp-ticket-stub-kicker">Early Bird</span>
          <strong>Summer Vibes Fest</strong>
          <span>Accra, Ghana</span>
        </div>
        <div className="lp-ticket-stub-cut" aria-hidden="true" />
        <div className="lp-ticket-stub-side">
          <span>GA Ticket</span>
          <div className="lp-barcode" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
