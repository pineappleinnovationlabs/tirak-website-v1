import React from 'react';

interface SkipToContentProps {
  targetId?: string;
  className?: string;
}

const SkipToContent: React.FC<SkipToContentProps> = ({ 
  targetId = 'main-content',
  className = ''
}) => {
  const handleSkip = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleSkip}
      className={`skip-link ${className}`}
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent;