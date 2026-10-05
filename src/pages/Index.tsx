import { useEffect } from 'react';
import StreamlinedHero from '@/components/StreamlinedHero';
import CategoriesGrid from '@/components/CategoriesGrid';
import FeaturedCompanions from '@/components/FeaturedCompanions';
import CompanionStories from '@/components/CompanionStories';
import HowItWorks from '@/components/HowItWorks';
import ForLocalGuides from '@/components/ForLocalGuides';
import FinalCTA from '@/components/FinalCTA';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, []);

  return (
    <div id="home" className="min-h-screen" role="main">
      <SEO 
        title="Tirak - Authentic Travel Experiences with Local Companions"
        description="Discover Tirak's upcoming Thailand travel marketplace, join the app rollout, and apply for future guide access through the official intake flow."
        canonical="/"
      />

      {/* Hero Section */}
      <StreamlinedHero />
      
      {/* Categories Grid */}
      <section id="explore" aria-label="Explore categories">
        <CategoriesGrid />
      </section>
      
      {/* Featured Companions */}
      <section aria-label="Featured companions">
        <FeaturedCompanions />
      </section>
      
      {/* Companion Stories */}
      <section id="companion-stories" aria-label="Companion stories">
        <CompanionStories />
      </section>
      
      {/* How It Works */}
      <section aria-label="How Tirak works">
        <HowItWorks />
      </section>
      
      {/* For Local Guides */}
      <section id="for-guides" aria-label="For local guides">
        <ForLocalGuides />
      </section>
      
      {/* Final CTA */}
      <section id="download" aria-label="Final call to action">
        <FinalCTA />
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
