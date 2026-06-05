import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="lp-final">
      <div className="lp-container">
        <div className="lp-final-inner">
          <h2>Ready to experience Samba?</h2>
          <p>Join the platform powering Africa&apos;s best nights out — for the fans who show up and the organizers who make it happen.</p>
          <div className="lp-final-cta">
            <Link href="/explore" className="lp-btn lp-btn-primary lp-btn-lg">Explore Events</Link>
            <Link href="/login" className="lp-btn lp-btn-ghost lp-btn-lg">List Your Event</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
