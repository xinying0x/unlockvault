import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  duration: number; // in seconds
  title?: string;
  subtitle?: string;
  type?: 'offer' | 'deal' | 'access' | 'download';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  onComplete?: () => void;
  className?: string;
  glowEffect?: boolean;
  pulseOnLowTime?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration,
  title = "Limited Time Offer",
  subtitle = "Act fast before it expires!",
  type = 'offer',
  size = 'md',
  showLabels = true,
  onComplete,
  className = '',
  glowEffect = true,
  pulseOnLowTime = true
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(duration);

  useEffect(() => {
    setTotalSeconds(duration);
  }, [duration]);

  useEffect(() => {
    if (totalSeconds <= 0) {
      setIsExpired(true);
      if (onComplete) onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTotalSeconds(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [totalSeconds, onComplete]);

  useEffect(() => {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    setTimeLeft({ days, hours, minutes, seconds });
  }, [totalSeconds]);

  const getTypeConfig = () => {
    const configs = {
      offer: {
        color: 'from-red-500 to-pink-500',
        bgColor: 'bg-red-500/10',
        icon: '🔥',
        urgencyText: 'Expires Soon!'
      },
      deal: {
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-500/10',
        icon: '💰',
        urgencyText: 'Save Now!'
      },
      access: {
        color: 'from-purple-500 to-violet-500',
        bgColor: 'bg-purple-500/10',
        icon: '🚀',
        urgencyText: 'Access Ending!'
      },
      download: {
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        icon: '⬇️',
        urgencyText: 'Download Now!'
      }
    };
    return configs[type];
  };

  const getSizeConfig = () => {
    const sizes = {
      sm: {
        container: 'p-4',
        title: 'text-lg',
        subtitle: 'text-sm',
        number: 'text-2xl',
        label: 'text-xs'
      },
      md: {
        container: 'p-6',
        title: 'text-xl',
        subtitle: 'text-base',
        number: 'text-3xl',
        label: 'text-sm'
      },
      lg: {
        container: 'p-8',
        title: 'text-2xl',
        subtitle: 'text-lg',
        number: 'text-4xl',
        label: 'text-base'
      }
    };
    return sizes[size];
  };

  const config = getTypeConfig();
  const sizeConfig = getSizeConfig();
  const isLowTime = totalSeconds <= 300; // 5 minutes
  const shouldPulse = pulseOnLowTime && isLowTime && !isExpired;

  const TimeUnit = ({ value, label }: { value: number, label: string }) => (
    <div className={`
      relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl 
      border border-white/20 shadow-lg min-w-[60px] text-center
      ${shouldPulse ? 'animate-pulse' : ''}
      ${glowEffect ? 'shadow-lg shadow-purple-500/25' : ''}
    `}>
      <div className={`${sizeConfig.number} font-bold bg-gradient-to-br ${config.color} bg-clip-text text-transparent py-2`}>
        {value.toString().padStart(2, '0')}
      </div>
      {showLabels && (
        <div className={`${sizeConfig.label} text-gray-600 dark:text-gray-400 font-medium pb-2 uppercase tracking-wide`}>
          {label}
        </div>
      )}
      
      {/* Glow effect */}
      {glowEffect && (
        <div className={`absolute -inset-1 bg-gradient-to-r ${config.color} rounded-xl blur opacity-20 -z-10`} />
      )}
    </div>
  );

  if (isExpired) {
    return (
      <div className={`
        ${sizeConfig.container} ${config.bgColor} rounded-2xl border border-red-200 dark:border-red-800 
        text-center animate-pulse ${className}
      `}>
        <div className="text-4xl mb-2">⏰</div>
        <div className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
          Offer Expired!
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Don't worry, check out our other amazing offers!
        </div>
      </div>
    );
  }

  return (
    <div className={`
      ${sizeConfig.container} ${config.bgColor} rounded-2xl border border-purple-200 dark:border-purple-800 
      backdrop-blur-sm relative overflow-hidden ${className}
      ${shouldPulse ? 'animate-pulse' : ''}
    `}>
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="text-3xl mb-2">{config.icon}</div>
        <h3 className={`${sizeConfig.title} font-bold text-gray-900 dark:text-white mb-1`}>
          {title}
        </h3>
        <p className={`${sizeConfig.subtitle} text-gray-600 dark:text-gray-400`}>
          {subtitle}
        </p>
        {isLowTime && (
          <div className="mt-2 inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 
                         text-red-800 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            {config.urgencyText}
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="flex justify-center items-center gap-3 mb-4 relative z-10">
        {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label="Days" />}
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <div className="text-2xl font-bold text-gray-400 animate-pulse">:</div>
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <div className="text-2xl font-bold text-gray-400 animate-pulse">:</div>
        <TimeUnit value={timeLeft.seconds} label="Seconds" />
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 relative z-10">
        <div 
          className={`h-2 bg-gradient-to-r ${config.color} rounded-full transition-all duration-1000 relative`}
          style={{ width: `${((duration - totalSeconds) / duration) * 100}%` }}
        >
          <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 relative z-10">
        {Math.floor(((duration - totalSeconds) / duration) * 100)}% of offer time has passed
      </div>
    </div>
  );
};

export default CountdownTimer; 