import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type?: 'spinner' | 'dots' | 'pulse' | 'bars';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  type = 'spinner', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-8 h-8';
      case 'lg': return 'w-12 h-12';
      case 'xl': return 'w-16 h-16';
      default: return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      default: return 'text-base';
    }
  };

  const renderSpinner = () => (
    <div className={`${getSizeClasses()} border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin`}></div>
  );

  const renderDots = () => (
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
      <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`${getSizeClasses()} bg-purple-500 rounded-full animate-pulse`}></div>
  );

  const renderBars = () => (
    <div className="flex space-x-1 items-end">
      <div className="w-2 h-6 bg-purple-500 animate-pulse"></div>
      <div className="w-2 h-8 bg-purple-500 animate-pulse delay-100"></div>
      <div className="w-2 h-4 bg-purple-500 animate-pulse delay-200"></div>
      <div className="w-2 h-7 bg-purple-500 animate-pulse delay-300"></div>
    </div>
  );

  const renderLoader = () => {
    switch (type) {
      case 'spinner': return renderSpinner();
      case 'dots': return renderDots();
      case 'pulse': return renderPulse();
      case 'bars': return renderBars();
      default: return renderSpinner();
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {renderLoader()}
      {text && (
        <p className={`${getTextSize()} text-gray-300 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#18122B] via-[#2D1B5A] to-[#1A1A2E] flex items-center justify-center z-50">
        <div className="text-center">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading; 