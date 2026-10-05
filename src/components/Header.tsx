import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AdaptiveLogo from './AdaptiveLogo';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Home', hash: 'home' },
  { label: 'Explore', hash: 'explore' },
  { label: 'About Tirak', hash: 'companion-stories' },
  { label: 'For Guides', hash: 'for-guides' },
] as const;

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnchorClick = useCallback((hash: string) => {
    if (location.pathname === '/') {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', `#${hash}`);
      }
    } else {
      navigate({ pathname: '/', hash });
    }
  }, [location.pathname, navigate]);

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
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleAnchorClick(item.hash)}
                className="magnetic text-contrast hover:text-primary font-medium transition-colors focus-ring relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/contact"
              className="magnetic text-contrast hover:text-primary font-medium transition-colors focus-ring relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              Contact
            </Link>
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
