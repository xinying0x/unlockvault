import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  quality?: number;
  priority?: boolean;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
  fill?: boolean;
  sizes?: string;
  blurDataURL?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = '/images/placeholder.png',
  quality = 75,
  priority = false,
  onClick,
  onLoad,
  onError,
  fill = false,
  sizes,
  blurDataURL
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current || priority) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  const generateBlurDataURL = (width: number, height: number) => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple gradient blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = width || 40;
    canvas.height = height || 40;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#6366f1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    return canvas.toDataURL();
  };

  const containerClasses = `
    relative overflow-hidden transition-all duration-300
    ${!isLoaded ? 'animate-pulse' : ''}
    ${className}
  `;

  return (
    <div ref={imgRef} className={containerClasses} onClick={onClick}>
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-gray-700/20 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Image failed to load</span>
          </div>
        </div>
      )}

      {/* Main image */}
      {isVisible && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder="blur"
          blurDataURL={generateBlurDataURL(width || 400, height || 300)}
          className={`
            transition-opacity duration-500
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
          `}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      )}

      {/* Loading indicator */}
      {!isLoaded && !hasError && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Success overlay */}
      {isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );
};

// Custom CSS for shimmer effect (add to globals.css)
export const shimmerCSS = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;

export default LazyImage; 