import Image from 'next/image';

export default function CitiesSection() {
  return (
    <section className="lp-section lp-cities-section" id="cities">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-kicker">Across the continent</span>
          <h2>Discover Events Across Africa</h2>
          <p>From Lagos to Nairobi, find what&apos;s happening in the cities shaping African culture tonight.</p>
        </div>

        <div className="lp-cities-artwork">
          <Image
            src="/landing/Discver.png"
            alt="Discover events in Lagos, Dakar, Accra, Abidjan, Nairobi, and Cotonou"
            width={1346}
            height={743}
            className="lp-cities-artwork-img"
          />
        </div>
      </div>
    </section>
  );
}
