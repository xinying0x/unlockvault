import React, { useState, useEffect } from 'react';
import { trackCPAClick } from '../lib/analytics';

interface EnhancedButtonProps {
  href: string;
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'cpa';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  countdown?: number;
  pulseEffect?: boolean;
  glowEffect?: boolean;
  offerId?: string;
  offerTitle?: string;
  cpaProvider?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  href,
  children,
  type = 'primary',
  size = 'md',
  icon,
  countdown,
  pulseEffect = false,
  glowEffect = false,
  offerId,
  offerTitle,
  cpaProvider,
  disabled = false,
  className = '',
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(countdown || 0);

  // Countdown timer
  useEffect(() => {
    if (countdown && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, countdown]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || (countdown && timeLeft > 0)) {
      e.preventDefault();
      return;
    }

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);

    // Track CPA click
    if (offerId && offerTitle && cpaProvider) {
      trackCPAClick(offerId, offerTitle, cpaProvider);
    }

    if (onClick) {
      onClick();
    }
  };

  const getButtonStyles = () => {
    const baseStyles = `
      relative inline-flex items-center justify-center gap-3 font-bold rounded-xl 
      transition-all duration-300 transform overflow-hidden group
      focus:outline-none focus:ring-4 focus:ring-purple-500/50
      disabled:opacity-50 disabled:cursor-not-allowed
      ${isClicked ? 'scale-95' : 'hover:scale-105'}
      ${pulseEffect ? 'animate-pulse' : ''}
      ${className}
    `;

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    const typeStyles = {
      primary: `
        bg-gradient-to-r from-purple-600 to-indigo-600 
        hover:from-purple-500 hover:to-indigo-500 text-white
        shadow-lg hover:shadow-xl
        ${glowEffect ? 'shadow-purple-500/25 hover:shadow-purple-500/50' : ''}
      `,
      secondary: `
        bg-gradient-to-r from-gray-600 to-gray-700 
        hover:from-gray-500 hover:to-gray-600 text-white
        shadow-lg hover:shadow-xl
      `,
      cpa: `
        bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500
        hover:from-green-400 hover:via-emerald-400 hover:to-teal-400
        text-white shadow-2xl hover:shadow-green-500/50
        ${glowEffect ? 'shadow-green-500/30 hover:shadow-green-500/60' : ''}
      `
    };

    return `${baseStyles} ${sizeStyles[size]} ${typeStyles[type]}`;
  };

  const isDisabled = disabled || (countdown && timeLeft > 0);

  return (
    <a
      href={isDisabled ? undefined : href}
      target="_blank"
      rel="noopener noreferrer"
      className={getButtonStyles()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Ripple effect */}
      {isClicked && (
        <div className="absolute inset-0 bg-white/30 rounded-xl animate-ping" />
      )}

      {/* Glow effect */}
      {glowEffect && !isDisabled && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 
                        rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        {icon && (
          <span className={`transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
            {icon}
          </span>
        )}
        
        {countdown && timeLeft > 0 ? (
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            Please wait {timeLeft}s
          </span>
        ) : (
          children
        )}

        {/* Arrow animation */}
        {!isDisabled && (
          <span className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
            →
          </span>
        )}
      </div>

      {/* Sparkle effect for CPA buttons */}
      {type === 'cpa' && !isDisabled && (
        <>
          <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-ping" 
               style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full animate-ping" 
               style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-ping" 
               style={{ animationDelay: '2s' }} />
        </>
      )}

      {/* Progress bar for countdown */}
      {countdown && timeLeft > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-full transition-all duration-1000"
             style={{ width: `${((countdown - timeLeft) / countdown) * 100}%` }} />
      )}
    </a>
  );
};

export default EnhancedButton; 