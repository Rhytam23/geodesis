import React from 'react';

interface MetricCardProps {
  /** Primary label for the metric (e.g. "Current Yield") */
  label: string;
  /** The main value to display (string or number) */
  value: string | number;
  /** Optional unit (e.g. "t/ha", "%", "USD") */
  unit?: string;
  /** Optional delta value (e.g. "+12%", "-3.2") */
  delta?: string | number;
  /** Optional trend direction for delta coloring */
  trend?: 'up' | 'down' | 'neutral';
  /** Optional additional className for customization */
  className?: string;
}

/**
 * MetricCard
 * 
 * The most reusable data display primitive in the Geodesis system.
 * 
 * Renders a clean, premium metric card consistent with the v2.0 Design System.
 * - Follows exact spacing, typography, colors, radius, and shadows from design-tokens.css
 * - Supports label, value, unit, and optional delta with trend
 * - Hover state for interactivity
 * - Fully responsive (desktop + mobile)
 * - Accessible with proper semantic structure and ARIA
 * 
 * Usage:
 * <MetricCard label="Salinity" value={4.2} unit="dS/m" delta="+0.3" trend="up" />
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  delta,
  trend = 'neutral',
  className = '',
}) => {
  // Determine delta color based on trend
  const getDeltaClasses = (): string => {
    if (!delta) return '';
    
    switch (trend) {
      case 'up':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'down':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'neutral':
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const deltaColorClasses = getDeltaClasses();
  const hasDelta = delta !== undefined && delta !== null;

  return (
    <div
      className={`
        bg-white 
        border border-[var(--geodesis-border)] 
        rounded-[var(--radius-3xl)] 
        shadow-[var(--shadow-sm)] 
        p-[var(--space-6)] 
        transition-all 
        duration-[var(--transition-base)] 
        hover:shadow-[var(--shadow-md)] 
        hover:-translate-y-[1px]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="region"
      aria-label={`${label} metric`}
    >
      {/* Label */}
      <div className="text-[var(--font-size-sm)] font-medium text-[var(--geodesis-text-muted)] tracking-wide mb-[var(--space-2)]">
        {label}
      </div>

      {/* Value row */}
      <div className="flex items-baseline gap-[var(--space-2)]">
        <span 
          className="text-[var(--font-size-3xl)] font-semibold text-[var(--geodesis-text-primary)] tracking-tighter leading-none"
          aria-label={`Value: ${value}`}
        >
          {value}
        </span>
        
        {unit && (
          <span 
            className="text-[var(--font-size-base)] font-medium text-[var(--geodesis-text-secondary)]"
            aria-label={`Unit: ${unit}`}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Optional Delta */}
      {hasDelta && (
        <div className="mt-[var(--space-3)]">
          <span
            className={`
              inline-flex items-center 
              px-[var(--space-3)] py-[var(--space-1)] 
              text-[var(--font-size-xs)] font-semibold 
              rounded-[var(--radius-full)] 
              border 
              ${deltaColorClasses}
            `.trim().replace(/\s+/g, ' ')}
            aria-label={`Change: ${delta}`}
          >
            {delta}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
