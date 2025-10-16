import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

import SEO from '@/components/SEO';
import StreamlinedHero from '@/components/StreamlinedHero';
import CategoriesGrid from '@/components/CategoriesGrid';
import CompanionStories from '@/components/CompanionStories';
import FinalCTA from '@/components/FinalCTA';
import ForLocalGuides from '@/components/ForLocalGuides';
import Footer from '@/components/Footer';
import { CultureBlob, AdventureBlob, WellnessBlob } from '@/components/ui/blob-shapes';

const TirakLanding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const isCompanyRep = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const flags = ['role', 'audience', 'rep', 'company', 'enterprise'];
    for (const f of flags) {
      const v = params.get(f);
      if (v && (/company|enterprise/i.test(v) || v === '1' || v === 'true')) return true;
    }
    const utmSource = params.get('utm_source');
    const utmCampaign = params.get('utm_campaign');
    if (
      (utmSource && /company|enterprise|partner|b2b/i.test(utmSource)) ||
      (utmCampaign && /enterprise|partner|b2b/i.test(utmCampaign))
    ) {
      return true;
    }
    if (typeof document !== 'undefined' && document.referrer && /company|partners|enterprise/i.test(document.referrer)) {
      return true;
    }
    return false;
  }, [location.search]);

  useEffect(() => {
    if (isCompanyRep) {
      navigate('/download');
    }
  }, [isCompanyRep, navigate]);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Email required', description: 'Please enter a valid email.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams(location.search);
      const meta: Record<string, string> = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => {
        const v = params.get(k);
        if (v) meta[k] = v;
      });
      const payload = {
        email,
        name,
        source: 'tirak_prelaunch',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        meta,
      };

      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Signup failed');

      toast({ title: "You're on the list!", description: 'We will notify you at launch.' });
      setEmail('');
      setName('');
    } catch (err) {
      toast({ title: 'Signup failed', description: 'Please try again or contact support.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-sunset min-h-screen text-foreground" role="main">
      <SEO 
        title="Tirak - Connect with Local Travel Companions in Thailand"
        description="Experience Thailand through the eyes of locals. Find verified companions for authentic adventures, cultural immersion, and unforgettable travel memories."
        canonical="/tirak"
      />
      {/* Hero */}
      <StreamlinedHero />
      
      {/* Pre-Launch Signup - Enhanced Mobile Responsive */}
      <section id="prelaunch" className="py-12 md:py-16 lg:py-20" aria-labelledby="prelaunch-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Decorative Blobs - Responsive positioning */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-4 -left-2 sm:-top-6 sm:-left-4 opacity-50 sm:opacity-70 animate-blob-breathe hardware-accelerated">
              <CultureBlob size={100} className="sm:w-[140px] sm:h-[140px]" />
            </div>
            <div className="absolute top-6 right-4 sm:top-10 sm:right-8 opacity-40 sm:opacity-60 animate-blob-float hardware-accelerated">
              <AdventureBlob size={120} className="sm:w-[160px] sm:h-[160px]" />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 sm:-bottom-6 opacity-30 sm:opacity-50 animate-blob-breathe hardware-accelerated">
              <WellnessBlob size={140} className="sm:w-[180px] sm:h-[180px]" />
            </div>
          </div>

          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Copy Section - Enhanced Mobile Typography */}
            <div className="space-y-4 sm:space-y-6 will-change-transform text-center lg:text-left">
              <h2 id="prelaunch-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-inter text-contrast leading-tight">
                Join the Pre‑Launch List
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-contrast-secondary font-inter leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Be first to explore authentic Thailand with verified local companions. Early members get beta access and exclusive perks.
              </p>
              
              {/* Enhanced Mobile Benefits List */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 sm:gap-4 text-sm text-contrast-secondary/80 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5">
                  <span className="text-primary">✨</span>
                  <span>Priority access</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5">
                  <span className="text-primary">🎁</span>
                  <span>Founder rewards</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5">
                  <span className="text-primary">🤝</span>
                  <span>Curated matching</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/5">
                  <span className="text-primary">🗺️</span>
                  <span>Trip planning</span>
                </div>
              </div>
            </div>

            {/* Form Section - Enhanced Mobile UX */}
            <form onSubmit={handleSignup} className="glass-card p-4 sm:p-6 lg:p-8 rounded-2xl space-y-4 sm:space-y-6 max-w-md mx-auto lg:max-w-none">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-contrast-secondary mb-2">
                    Name (optional)
                  </label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Your name" 
                    autoComplete="name"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-contrast-secondary mb-2">
                    Email *
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="you@example.com" 
                    autoComplete="email" 
                    required
                    className="h-12 text-base"
                  />
                </div>
              </div>
              
              {/* Enhanced Mobile Button Layout */}
              <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
                <Button 
                  type="submit" 
                  className="btn-primary w-full sm:w-auto h-12 px-6 text-base font-semibold" 
                  disabled={loading}
                >
                  {loading ? 'Signing up…' : 'Notify Me'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="btn-ghost w-full sm:w-auto h-12 px-6 text-base" 
                  onClick={() => navigate('/download')}
                >
                  Prefer to download?
                </Button>
              </div>
              <p className="text-xs text-contrast-secondary/70 text-center">
                We value privacy. Unsubscribe anytime.
              </p>
            </form>

            {/* Visual Card - Enhanced Mobile Design */}
            <div className="glass-card rounded-2xl p-4 sm:p-6 lg:p-8 will-change-transform hardware-accelerated rotate-1 hover:rotate-0 transition-transform duration-300 max-w-md mx-auto lg:max-w-none">
              <div className="space-y-3 sm:space-y-4 text-center">
                <div className="text-xs sm:text-sm uppercase tracking-wide text-contrast-secondary font-medium">
                  Early Access
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-inter gradient-text">
                  Beta Launch
                </div>
                <div className="text-xs sm:text-sm text-contrast-secondary leading-relaxed">
                  Limited spots • Verified companions • Real local vibes
                </div>
                
                {/* Mobile-friendly stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">500+</div>
                    <div className="text-xs text-contrast-secondary">Companions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">50+</div>
                    <div className="text-xs text-contrast-secondary">Cities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">24/7</div>
                    <div className="text-xs text-contrast-secondary">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Explore by Vibe - Enhanced Section Spacing */}
      <section id="explore" className="py-12 md:py-16 lg:py-20" aria-label="Explore by vibe">
        <CategoriesGrid />
      </section>
      
      {/* Testimonials - Enhanced Mobile Layout */}
      <section id="companion-stories" className="py-12 md:py-16 lg:py-20" aria-labelledby="stories-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 id="stories-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-inter text-contrast mb-4">
              Stories from Our
              <span className="gradient-text ml-2 block sm:inline">Early Explorers</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-contrast-secondary font-inter max-w-2xl mx-auto">
              Real experiences from travelers who've discovered Thailand's hidden gems
            </p>
          </div>
        </div>
        <CompanionStories />
      </section>
      
      {/* Vendor Onboarding - Enhanced Mobile Layout */}
      <section id="for-guides" className="py-12 md:py-16 lg:py-20" aria-labelledby="guides-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 id="guides-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-inter text-contrast mb-4">
              For Locals,
              <span className="gradient-text ml-2 block sm:inline">By Locals</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-contrast-secondary font-inter max-w-2xl mx-auto">
              Turn your love for Thailand into a flexible career.
            </p>
          </div>
        </div>
        <ForLocalGuides />
      </section>
      
      {/* Final CTA */}
      <FinalCTA />
      
      {/* Footer */}
      <Footer />
    </main>
  );
};

export default TirakLanding;