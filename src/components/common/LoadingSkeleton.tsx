import React from 'react';

interface LoadingSkeletonProps {
  /** Number of skeleton rows/lines to render */
  lines?: number;
  /** Height variant */
  height?: 'sm' | 'md' | 'lg';
  /** Optional className */
  className?: string;
}

/**
 * LoadingSkeleton
 * 
 * Universal loading state primitive.
 * Uses subtle pulse + design tokens for premium feel.
 * Matches "Skeleton + subtle pulse" requirement from spec.
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 1,
  height = 'md',
  className = '',
}) => {
  const heightClass = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
  }[height];

  return (
    <div className={`space-y-2 ${className}`} aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`
            ${heightClass} 
            bg-slate-200 
            rounded-md 
            animate-pulse
            w-full
          `.trim().replace(/\s+/g, ' ')}
          role="progressbar"
          aria-busy="true"
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;