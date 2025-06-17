import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface ProgressBarProps {
  height?: number;
  color?: string;
  showOnRouteChange?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  height = 3,
  color = 'bg-gradient-to-r from-purple-500 to-indigo-600',
  showOnRouteChange = true
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!showOnRouteChange) return;

    const handleStart = () => {
      setIsVisible(true);
      setProgress(10);
    };

    const handleComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
    };

    const handleError = () => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 200);
    };

    // Simulate progress during route change
    const progressInterval = (startProgress: number, endProgress: number, duration: number) => {
      const increment = (endProgress - startProgress) / (duration / 50);
      let currentProgress = startProgress;
      
      const interval = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= endProgress) {
          setProgress(endProgress);
          clearInterval(interval);
        } else {
          setProgress(currentProgress);
        }
      }, 50);
      
      return interval;
    };

    let progressTimer: NodeJS.Timeout;

    const handleRouteStart = () => {
      handleStart();
      // Simulate loading progress
      progressTimer = progressInterval(10, 70, 1000);
    };

    router.events.on('routeChangeStart', handleRouteStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);

    return () => {
      router.events.off('routeChangeStart', handleRouteStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
      if (progressTimer) clearTimeout(progressTimer);
    };
  }, [router, showOnRouteChange]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`h-${height} ${color} transition-all duration-300 ease-out shadow-lg`}
        style={{
          width: `${progress}%`,
          height: `${height}px`
        }}
      >
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
      </div>
    </div>
  );
};

export default ProgressBar; 