import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AdaptiveLogo from './AdaptiveLogo';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'py-4' : 'py-6'
      }`}
    >
      <nav className="container mx-auto px-6">
        <div className={`glass-nav flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-4'
        }`}>
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <AdaptiveLogo 
              size="md" 
              variant="contrast"
              className="transition-transform duration-300 hover:scale-105 hover:rotate-3"
            />
            <span className="text-2xl font-bold font-inter text-contrast">
              Tirak
            </span>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { label: 'Home', href: '#home' },
              { label: 'Explore', href: '#explore' },
              { label: 'Stories', href: '#companion-stories' },
              { label: 'For Guides', href: '#for-guides' },
              { label: 'Contact', href: '/contact' }
            ].map((item) => (
              item.href.startsWith('#') ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="magnetic text-contrast hover:text-primary font-medium transition-colors focus-ring relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="magnetic text-contrast hover:text-primary font-medium transition-colors focus-ring relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  {item.label}
                </Link>
              )
            ))}
            <ThemeToggle />
          </div>

          {/* Download App Button */}
          <Link to="/download" className="inline-flex">
            <Button 
              className="btn-primary animate-pulse-glow focus-ring will-change-transform hardware-accelerated"
            >
              Download the App
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;