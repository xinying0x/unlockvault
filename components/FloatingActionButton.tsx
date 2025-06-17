import React, { useState } from 'react';
import Link from 'next/link';

interface FloatingAction {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  color: string;
}

interface FloatingActionButtonProps {
  actions?: FloatingAction[];
  mainIcon?: string;
  mainColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions = [
    {
      icon: '🔧',
      label: 'Browse Tools',
      href: '/tools',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: '📱',
      label: 'Explore Apps',
      href: '/apps',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: '🎮',
      label: 'Play Games',
      href: '/games',
      color: 'from-red-500 to-pink-600'
    }
  ],
  mainIcon = '✨',
  mainColor = 'from-purple-500 to-indigo-600',
  position = 'bottom-left'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-20 right-6';
      case 'top-left':
        return 'top-20 left-6';
      default:
        return 'bottom-6 left-6';
    }
  };

  const getActionPosition = (index: number) => {
    const spacing = 70;
    const baseOffset = spacing * (index + 1);
    
    switch (position) {
      case 'bottom-right':
      case 'bottom-left':
        return { bottom: `${baseOffset}px`, right: '0px' };
      case 'top-right':
      case 'top-left':
        return { top: `${baseOffset}px`, right: '0px' };
      default:
        return { bottom: `${baseOffset}px`, right: '0px' };
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-40`}>
      {/* Action Items */}
      {actions.map((action, index) => (
        <div
          key={index}
          className={`absolute transition-all duration-300 transform ${
            isOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-75 translate-y-4'
          }`}
          style={{
            ...getActionPosition(index),
            transitionDelay: `${index * 50}ms`
          }}
        >
          {action.href ? (
            <Link
              href={action.href}
              className={`group flex items-center gap-3 bg-gradient-to-r ${action.color} text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="font-medium whitespace-nowrap">{action.label}</span>
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className={`group flex items-center gap-3 bg-gradient-to-r ${action.color} text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="font-medium whitespace-nowrap">{action.label}</span>
            </button>
          )}
        </div>
      ))}

      {/* Main Button */}
      <button
        onClick={toggleMenu}
        className={`relative w-14 h-14 bg-gradient-to-r ${mainColor} text-white rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group`}
        aria-label="Quick actions menu"
      >
        <span 
          className={`text-xl transition-transform duration-300 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          {isOpen ? '✕' : mainIcon}
        </span>
        
        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton; 