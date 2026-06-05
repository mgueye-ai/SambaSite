import Link from 'next/link';
import PhoneMockup from './PhoneMockup';
import FloatingEventCard from './FloatingEventCard';
import FloatingImageCard from './FloatingImageCard';
import GameNightCard from './GameNightCard';
import GiveawayCard from './GiveawayCard';
import CityTag from './CityTag';
import StatsBar from './StatsBar';
import TicketStubCard from './TicketStubCard';

const CITIES = ['Dakar', 'Abidjan', 'Lagos', 'Accra', 'Cotonou', 'Nairobi'];

export default function HeroSection() {
  return (
    <header className="lp-hero lp-hero--artwork">
      <div className="lp-hero-bg" aria-hidden="true" />
      <div className="lp-container">
        <span className="lp-eyebrow">
          <span className="lp-eyebrow-dot" />
          Africa&apos;s premium event & ticketing platform
        </span>

        <h1>
          Discover Africa&apos;s <span className="lp-accent">Best Experiences</span>
        </h1>

        <p className="lp-hero-lead">
          Concerts, festivals, movie premieres, game nights, cultural events, and
          unforgettable moments — all in one platform.
        </p>

        <div className="lp-hero-cta">
          <Link href="/explore" className="lp-btn lp-btn-primary lp-btn-lg">Explore Events</Link>
          <Link href="/login" className="lp-btn lp-btn-ghost lp-btn-lg">List Your Event</Link>
        </div>

        {/* Mobile-only condensed city chips */}
        <div className="lp-mobile-cities">
          {CITIES.map((c) => <CityTag key={c} name={c} />)}
        </div>
      </div>

      <div className="lp-stage">
        <div className="lp-stage-glow" />
        <div className="lp-connector lp-connector-left" />
        <div className="lp-connector lp-connector-right" />

        {/* Floating city tags */}
        <div className="lp-city-float-wrap">
          <CityTag name="Dakar" className="lp-cpos-1" />
          <CityTag name="Abidjan" className="lp-cpos-2" />
          <CityTag name="Accra" className="lp-cpos-3" />
          <CityTag name="Lagos" className="lp-cpos-4" />
          <CityTag name="Cotonou" className="lp-cpos-5" />
          <CityTag name="Nairobi" className="lp-cpos-6" />
        </div>

        {/* Left side ecosystem */}
        <FloatingImageCard
          className="lp-pos-artist"
          gradient="lp-photo-artist"
          image="/landing/artist-live.svg"
          label="Live"
          title="Artist night"
          shape="circle"
        />
        <FloatingEventCard
          position="lp-pos-movie"
          category="Movie Premiere"
          title="Sinners"
          gradient="lp-grad-3"
          image="/landing/sinners-card.png"
          variant="landscape"
        />
        <GameNightCard className="lp-pos-game" />

        {/* Right side ecosystem */}
        <FloatingEventCard
          position="lp-pos-afro"
          category="Concerts"
          title="Afrobeats Festival"
          sub="Sat · Eko Atlantic"
          gradient="lp-grad-1"
          image="/landing/concert-crowd.svg"
          variant="glass"
        />
        <TicketStubCard className="lp-pos-ticket" />
        <GiveawayCard className="lp-pos-giveaway" />

        <PhoneMockup />
      </div>

      <div className="lp-container">
        <StatsBar />
      </div>
    </header>
  );
}
