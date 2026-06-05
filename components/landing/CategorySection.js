import Image from 'next/image';

export default function CategorySection() {
  return (
    <section className="lp-section lp-categories-section" id="categories">
      <div className="lp-categories-bg" aria-hidden="true" />
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-kicker">Every event, one platform</span>
          <h2>Every Event. One Platform.</h2>
          <p>From sold-out concerts to intimate game nights — Samba brings the best of African nightlife and culture into a single, beautiful experience.</p>
        </div>

        <div className="lp-cat-artwork">
          <Image
            src="/landing/category-cards.png"
            alt="Event categories including Concerts, Festivals, Movie Premieres, Game Nights, Cultural Events, and Networking"
            width={1024}
            height={572}
            className="lp-cat-artwork-img"
          />
        </div>
      </div>
    </section>
  );
}
