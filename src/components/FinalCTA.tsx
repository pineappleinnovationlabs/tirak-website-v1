import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const FinalCTA = () => {
  const [bounceAnimation, setBounceAnimation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounceAnimation(true);
      setTimeout(() => setBounceAnimation(false), 1000);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-background via-muted/10 to-background" aria-labelledby="final-cta-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-5xl mx-auto">
          {/* Enhanced Thai Pattern Background */}
          <div className="absolute inset-0 opacity-5 overflow-hidden rounded-3xl" aria-hidden="true">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                <pattern id="thai-pattern-bg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20,10 L30,20 L20,30 L10,20 Z M20,5 L35,20 L20,35 L5,20 Z" fill="currentColor" fillOpacity="0.3" />
                </pattern>
              </defs>
              <rect width="400" height="200" fill="url(#thai-pattern-bg)" />
            </svg>
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 sm:w-12 sm:h-12 glass-card rounded-full animate-pulse" aria-hidden="true" />
          <div className="absolute -top-2 -right-6 w-4 h-4 sm:w-6 sm:h-6 glass-card rounded-full animate-pulse delay-1000" aria-hidden="true" />
          <div className="absolute -bottom-6 -left-2 w-6 h-6 sm:w-8 sm:h-8 glass-card rounded-full animate-pulse delay-500" aria-hidden="true" />

          {/* Main CTA Card */}
          <div className="glass-card p-6 sm:p-8 lg:p-12 xl:p-16 text-center relative overflow-hidden rounded-2xl sm:rounded-3xl">
            {/* Enhanced Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 rounded-2xl sm:rounded-3xl" aria-hidden="true" />
            
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl" aria-hidden="true">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-float" />
              <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-secondary/20 rounded-full animate-float delay-1000" />
              <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-primary/30 rounded-full animate-float delay-500" />
            </div>
            
            <div className="relative z-10 space-y-6 sm:space-y-8 lg:space-y-10">
              {/* Header Section */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 mb-4">
                  <span className="text-xs sm:text-sm font-medium text-primary">🚀 Launch Ready</span>
                </div>
                <h2 id="final-cta-heading" className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-inter text-contrast leading-tight">
                  Ready to Start Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mt-2">
                    Tirak Journey?
                  </span>
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-contrast-secondary font-inter max-w-3xl mx-auto leading-relaxed">
                  Join thousands of travelers discovering authentic Thailand with local companions. 
                  <span className="block mt-2 text-sm sm:text-base text-primary font-medium">
                    Be among the first to experience the future of travel.
                  </span>
                </p>
              </div>

              {/* Enhanced Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center">
                <Link
                  to="/download"
                  className={`group glass-card hover-lift hover-glow transition-all duration-300 hover:scale-105 p-3 sm:p-4 rounded-2xl focus-ring will-change-transform hardware-accelerated ${
                    bounceAnimation ? 'animate-bounce' : ''
                  }`}
                  aria-label="Download Tirak app on the App Store"
                >
                  <div className="flex items-center space-x-3 px-2 sm:px-4 py-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-contrast-secondary">Download on the</div>
                      <div className="text-sm sm:text-base font-semibold text-contrast">App Store</div>
                    </div>
                  </div>
                </Link>
                
                <Link
                  to="/download"
                  className={`group glass-card hover-lift hover-glow transition-all duration-300 hover:scale-105 p-3 sm:p-4 rounded-2xl focus-ring will-change-transform hardware-accelerated ${
                    bounceAnimation ? 'animate-bounce' : ''
                  }`}
                  style={{ animationDelay: '0.1s' }}
                  aria-label="Get Tirak app on Google Play"
                >
                  <div className="flex items-center space-x-3 px-2 sm:px-4 py-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-contrast-secondary">Get it on</div>
                      <div className="text-sm sm:text-base font-semibold text-contrast">Google Play</div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
                <div className="glass-card p-3 sm:p-4 rounded-xl hover:scale-105 transition-transform duration-300">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-contrast-secondary">
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500 text-lg" aria-hidden="true">✓</span>
                      <span className="text-sm sm:text-base font-medium">1000+</span>
                    </div>
                    <span className="text-xs sm:text-sm text-center">Verified Guides</span>
                  </div>
                </div>
                
                <div className="glass-card p-3 sm:p-4 rounded-xl hover:scale-105 transition-transform duration-300">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-contrast-secondary">
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500 text-lg" aria-hidden="true">✓</span>
                      <span className="text-sm sm:text-base font-medium">50k+</span>
                    </div>
                    <span className="text-xs sm:text-sm text-center">Happy Travelers</span>
                  </div>
                </div>
                
                <div className="glass-card p-3 sm:p-4 rounded-xl hover:scale-105 transition-transform duration-300">
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 text-contrast-secondary">
                    <div className="flex items-center space-x-1">
                      <span className="text-green-500 text-lg" aria-hidden="true">✓</span>
                      <span className="text-sm sm:text-base font-medium">4.9★</span>
                    </div>
                    <span className="text-xs sm:text-sm text-center">App Store Rating</span>
                  </div>
                </div>
              </div>

              {/* Additional CTA for Early Access */}
              <div className="pt-4 sm:pt-6 lg:pt-8">
                <div className="glass-card p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                  <p className="text-sm sm:text-base text-contrast-secondary mb-3 sm:mb-4">
                    Can't wait for the app launch? 
                  </p>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:shadow-glow transition-all duration-300 hover:scale-105">
                    <span className="flex items-center justify-center space-x-2">
                      <span>Join Early Access</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;