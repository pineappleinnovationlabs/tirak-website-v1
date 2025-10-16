import React from 'react';
import tirakLogo from '../assets/logos/tirak-logo.png';

interface AdaptiveLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'contrast' | 'dark';
}

const AdaptiveLogo: React.FC<AdaptiveLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'contrast'
}) => {
  const sizeClasses = {
    sm: 'h-10 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };

  const variantClasses = {
    default: '',
    contrast: 'logo-contrast-backdrop',
    dark: 'logo-dark-backdrop'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Backdrop for better contrast */}
      {variant !== 'default' && (
        <div className={`absolute inset-0 rounded-lg ${variantClasses[variant]} -z-10`} />
      )}
      
      {/* Logo image */}
      <img
        src={tirakLogo}
        alt="Tirak Logo"
        className={`
          ${sizeClasses[size]} 
          object-contain 
          transition-all 
          duration-300 
          hover:scale-110 
          hover:rotate-3
          relative
          z-10
        `}
      />
    </div>
  );
};

export default AdaptiveLogo;