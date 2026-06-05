export default function GameNightCard({ className = '' }) {
  return (
    <div className={`lp-float ${className}`}>
      <div className="lp-gamenight-card">
        <h3 className="lp-gamenight-title">Game Night</h3>
        <p className="lp-gamenight-brand">Carnivife</p>
        <p className="lp-gamenight-meta">Ven, 23 Mai • 7PM</p>
        <p className="lp-gamenight-loc">Abidjan, Côte d&apos;Ivoire</p>
        <div className="lp-gamenight-foot">
          <span className="lp-gamenight-price">5 000 CFA</span>
          <button type="button" className="lp-gamenight-save" aria-label="Save event">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 4.5A2.5 2.5 0 0 1 9.5 2h5A2.5 2.5 0 0 1 17 4.5V20l-5-3.2L7 20V4.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
