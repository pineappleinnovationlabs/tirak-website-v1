import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return Monitor;
    }
    return actualTheme === 'dark' ? Moon : Sun;
  };

  const getTooltipText = () => {
    if (theme === 'light') return 'Switch to dark mode';
    if (theme === 'dark') return 'Switch to system mode';
    return 'Switch to light mode';
  };

  const Icon = getIcon();

  return (
    <button
      onClick={cycleTheme}
      className="
        relative
        p-2
        rounded-full
        glass-card
        hover-lift
        hover-glow
        transition-all
        duration-300
        focus:outline-none
        focus:ring-2
        focus:ring-primary
        focus:ring-offset-2
        focus:ring-offset-transparent
        group
      "
      aria-label={getTooltipText()}
    >
      <div className="relative w-5 h-5">
        <Icon 
          className={`
            w-5 h-5 transition-all duration-300 transform
            ${theme === 'system' ? 'text-blue-500' : actualTheme === 'dark' ? 'text-blue-400' : 'text-amber-500'}
          `}
        />
      </div>
      
      {/* Tooltip */}
      <div className="
        absolute -bottom-10 left-1/2 transform -translate-x-1/2
        px-2 py-1 text-xs font-medium text-white bg-black rounded
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        pointer-events-none whitespace-nowrap z-50
      ">
        {getTooltipText()}
      </div>
    </button>
  );
};

export default ThemeToggle;