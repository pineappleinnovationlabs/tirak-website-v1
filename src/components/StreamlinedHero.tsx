import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AdaptiveLogo from '@/components/AdaptiveLogo';
import { useIsMobile } from '@/hooks/use-mobile';
import { startNewInterestAttempt, submitInterest } from '@/lib/core-intake';

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
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: 'Email required', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const result = await submitInterest({
        email: email.trim(),
        source: 'hero_quick_signup',
      });

      if (result.ok === false) {
        if (result.code === 'payload_mismatch') {
          startNewInterestAttempt();
          const retryResult = await submitInterest({
            email: email.trim(),
            source: 'hero_quick_signup',
          });
          if (retryResult.ok === false) {
            throw new Error(retryResult.error);
          }

          toast({ title: "You're on the list!", description: 'We will notify you at launch.' });
          setEmail('');
          return;
        }
        throw new Error(result.error);
      }

      toast({ title: "You're on the list!", description: 'We will notify you at launch.' });
      setEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Please try again.';
      toast({ title: 'Signup failed', description: msg, variant: 'destructive' });
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
                Experience Thailand with Local Guides
              </h1>
              <p className="text-contrast-secondary text-lg sm:text-xl max-w-xl">
                Discover genuine cultural insights, curated adventures, and unforgettable experiences across Thailand with trusted local companions.
              </p>
            </div>

            {/* Vibe Rotator */}
            <div className="flex items-center justify-center lg:justify-start space-x-3 text-sm font-semibold tracking-wider text-primary">
              <span className="text-muted-foreground uppercase text-xs">Explore by vibe:</span>
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                {vibes[currentVibeIndex]}
              </span>
            </div>

            {/* Quick Email Signup Form */}
            <form onSubmit={handleQuickSignup} className="space-y-3 max-w-md mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for early access"
                  className="bg-background/80 backdrop-blur-sm"
                  required
                />
                <Button type="submit" disabled={loading} className="shrink-0">
                  {loading ? 'Joining...' : 'Get Early Access'}
                </Button>
              </div>
            </form>

            {/* Direct Links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/apply">Become a Guide</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/download">Get Mobile App</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Phone Preview */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative w-64 sm:w-80 lg:w-96 h-auto">
              <div 
                ref={phoneRef}
                className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-[2rem] sm:rounded-[3rem] p-2 sm:p-3 shadow-2xl will-change-transform"
                style={{ aspectRatio: '9/19.5' }}
              >
                <div className="bg-gradient-to-br from-primary/90 to-secondary/90 rounded-[1.5rem] sm:rounded-[2.5rem] h-full overflow-hidden relative">
                  <div className="flex justify-between items-center px-4 sm:px-6 py-2 sm:py-3 text-white text-xs sm:text-sm">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                      <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                      <div className="w-4 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                    <div className="text-center text-white">
                      <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Tirak</h3>
                      <p className="text-xs sm:text-sm opacity-80">Your Thailand Adventure Awaits</p>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { icon: '🏛️', title: 'Cultural Tours', desc: 'Temple visits & traditions' },
                        { icon: '🏔️', title: 'Adventure Trips', desc: 'Hiking & water sports' },
                        { icon: '🧘', title: 'Wellness Retreats', desc: 'Spa & meditation' },
                      ].map((item, index) => (
                        <div 
                          key={index}
                          className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center space-x-3 sm:space-x-4"
                        >
                          <div className="text-xl sm:text-2xl">{item.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-sm sm:text-base truncate">{item.title}</h4>
                            <p className="text-white/70 text-xs sm:text-sm truncate">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 sm:pt-4">
                      <Link to="/download" className="block bg-white text-primary rounded-lg sm:rounded-xl py-2 sm:py-3 px-4 sm:px-6 text-center font-semibold text-sm sm:text-base">
                        Find Your Guide
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamlinedHero;
