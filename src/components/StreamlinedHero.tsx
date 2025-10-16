import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AdaptiveLogo from '@/components/AdaptiveLogo';
import { useIsMobile } from '@/hooks/use-mobile';

const StreamlinedHero = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentVibeIndex, setCurrentVibeIndex] = useState(0);
  const phoneRef = useRef<HTMLDivElement>(null);

  const vibes = ['CULTURE', 'ADVENTURE', 'WELLNESS', 'NIGHTLIFE', 'FOOD', 'NATURE'];

  // Rotate vibes text
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVibeIndex((prev) => (prev + 1) % vibes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [vibes.length]);

  // Physics-based gravity scrolling for phone mock-up
  useEffect(() => {
    if (!phoneRef.current) return;

    let animationId: number;
    let velocity = 0;
    const gravity = 0.5;
    const bounce = 0.8;
    const friction = 0.98;

    const animate = () => {
      if (!phoneRef.current) return;

      const rect = phoneRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top > windowHeight * 0.1 && rect.top < windowHeight * 0.9) {
        velocity += gravity;
        velocity *= friction;
        
        const currentTransform = phoneRef.current.style.transform;
        const currentY = parseFloat(currentTransform.match(/translateY\(([^)]+)px\)/)?.[1] || '0');
        const newY = currentY + velocity;
        
        if (newY > 20) {
          velocity *= -bounce;
        }
        
        phoneRef.current.style.transform = `translateY(${Math.max(0, newY)}px) rotate(${Math.sin(Date.now() * 0.001) * 2}deg)`;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleQuickSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Email required', description: 'Please enter a valid email.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'hero_quick_signup',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
        }),
      });

      if (!res.ok) throw new Error('Signup failed');

      toast({ title: "You're on the list!", description: 'We will notify you at launch.' });
      setEmail('');
    } catch (err) {
      toast({ title: 'Signup failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24" role="banner">
      {/* Enhanced Background with Responsive Particles */}
      <div className="absolute inset-0 bg-sunset">
        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-gradient-shift" />
        
        {/* Responsive Particle System */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: isMobile ? 15 : 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content Container - Enhanced Mobile Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh] lg:min-h-screen">
          
          {/* Left Column - Enhanced Mobile Typography */}
          <div className="text-center lg:text-left space-y-6 sm:space-y-8 lg:space-y-10 order-2 lg:order-1">
            {/* Logo - Responsive Sizing */}
            <div className="flex justify-center lg:justify-start mb-6 sm:mb-8">
              <AdaptiveLogo className="h-12 sm:h-16 lg:h-20 w-auto" />
            </div>

            {/* Main Headline - Enhanced Mobile Typography */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Discover Thailand with Local Companions
              </h1>
              
              {/* Rotating Vibes Text - Enhanced Mobile */}
              <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3">
                <span className="text-lg sm:text-xl lg:text-2xl text-contrast-secondary font-medium">
                  Find your
                </span>
                <div className="relative h-8 sm:h-10 lg:h-12 overflow-hidden">
                  <div 
                    className="absolute inset-0 transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateY(-${currentVibeIndex * 100}%)` }}
                  >
                    {vibes.map((vibe, index) => (
                      <div 
                        key={vibe}
                        className="h-8 sm:h-10 lg:h-12 flex items-center text-lg sm:text-xl lg:text-2xl font-bold gradient-text"
                      >
                        {vibe}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Subtitle - Enhanced Mobile */}
            <p className="text-base sm:text-lg lg:text-xl text-contrast-secondary font-inter leading-relaxed max-w-xl mx-auto lg:mx-0">
              Connect with verified local companions for authentic adventures, cultural immersion, and unforgettable memories across Thailand.
            </p>

            {/* Enhanced Mobile CTA Section */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Signup Form - Mobile Optimized */}
              <form onSubmit={handleQuickSignup} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 sm:h-14 text-base flex-1 glass-light"
                  required
                />
                <Button 
                  type="submit" 
                  className="btn-primary h-12 sm:h-14 px-6 sm:px-8 text-base font-semibold whitespace-nowrap"
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Waitlist'}
                </Button>
              </form>

              {/* Secondary Actions - Enhanced Mobile Layout */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-contrast-secondary">
                <Link 
                  to="/download" 
                  className="flex items-center space-x-2 hover:text-primary transition-colors duration-200"
                >
                  <span>📱</span>
                  <span>Download App</span>
                </Link>
                <Link 
                  to="#explore" 
                  className="flex items-center space-x-2 hover:text-primary transition-colors duration-200"
                >
                  <span>🗺️</span>
                  <span>Explore Experiences</span>
                </Link>
                <Link 
                  to="#companion-stories" 
                  className="flex items-center space-x-2 hover:text-primary transition-colors duration-200"
                >
                  <span>💬</span>
                  <span>Read Stories</span>
                </Link>
              </div>

              {/* Trust Indicators - Mobile Optimized */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-white/10 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">500+</div>
                  <div className="text-xs sm:text-sm text-contrast-secondary">Local Guides</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">50+</div>
                  <div className="text-xs sm:text-sm text-contrast-secondary">Thai Cities</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs sm:text-sm text-contrast-secondary">Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Enhanced Mobile Phone Mockup */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-64 sm:w-80 lg:w-96 h-auto">
              {/* Phone Container with Enhanced Mobile Responsiveness */}
              <div 
                ref={phoneRef}
                className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] sm:rounded-[3rem] p-2 sm:p-3 shadow-2xl will-change-transform hardware-accelerated"
                style={{ aspectRatio: '9/19.5' }}
              >
                {/* Screen Content - Mobile Optimized */}
                <div className="bg-gradient-to-br from-primary/90 to-secondary/90 rounded-[1.5rem] sm:rounded-[2.5rem] h-full overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 sm:px-6 py-2 sm:py-3 text-white text-xs sm:text-sm">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                      <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>

                  {/* App Content - Enhanced Mobile Preview */}
                  <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                    {/* Header */}
                    <div className="text-center text-white">
                      <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Tirak</h3>
                      <p className="text-xs sm:text-sm opacity-80">Your Thailand Adventure Awaits</p>
                    </div>

                    {/* Feature Cards - Mobile Optimized */}
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { icon: '🏛️', title: 'Cultural Tours', desc: 'Temple visits & traditions' },
                        { icon: '🏔️', title: 'Adventure Trips', desc: 'Hiking & water sports' },
                        { icon: '🧘', title: 'Wellness Retreats', desc: 'Spa & meditation' },
                      ].map((item, index) => (
                        <div 
                          key={index}
                          className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4 animate-drift-up"
                          style={{ animationDelay: `${index * 0.2}s` }}
                        >
                          <div className="text-xl sm:text-2xl">{item.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm sm:text-base truncate">{item.title}</h4>
                            <p className="text-white/70 text-xs sm:text-sm truncate">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button in Phone */}
                    <div className="pt-2 sm:pt-4">
                      <div className="bg-white text-primary rounded-lg sm:rounded-xl py-2 sm:py-3 px-4 sm:px-6 text-center">
                        <span className="font-semibold text-sm sm:text-base">Find Your Guide</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone Highlights */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-1 bg-gray-700 rounded-full"></div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 sm:w-16 h-1 bg-gray-700 rounded-full"></div>
              </div>

              {/* Floating Elements - Mobile Optimized */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-8 h-8 sm:w-12 sm:h-12 bg-primary/20 rounded-full animate-pulse-glow"></div>
              <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-6 w-6 h-6 sm:w-10 sm:h-10 bg-secondary/20 rounded-full animate-float"></div>
              <div className="absolute top-1/3 -left-6 sm:-left-8 w-4 h-4 sm:w-6 sm:h-6 bg-accent/20 rounded-full animate-drift-up"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Enhanced Mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 sm:w-8 sm:h-12 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 sm:w-1.5 sm:h-4 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default StreamlinedHero;