import './landing.css';
import LandingNav from '../components/landing/LandingNav';
import HeroSection from '../components/landing/HeroSection';
import CategorySection from '../components/landing/CategorySection';
import OrganizerSection from '../components/landing/OrganizerSection';
import CitiesSection from '../components/landing/CitiesSection';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="lp-root">
      <div className="lp-bg" />
      <div className="lp-shell">
        <LandingNav />
        <HeroSection />
        <CategorySection />
        <OrganizerSection />
        <CitiesSection />
        <FinalCTA />
        <LandingFooter />
      </div>
    </div>
  );
}
