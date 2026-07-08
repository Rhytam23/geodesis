import React from 'react';

interface ConfidenceBadgeProps {
  /** Confidence percentage or score (e.g. 94, 87) */
  confidence: number;
  /** Optional label override (defaults to "Confidence") */
  label?: string;
  /** Optional className */
  className?: string;
}

/**
 * ConfidenceBadge
 * 
 * Small reusable badge for confidence/trust signals.
 * Exact spec from Design System (Phase 4):
 *   bg-emerald-700 text-white px-3 py-0.5 rounded-full text-xs font-semibold
 * 
 * Uses design tokens.
 * Always shows high-trust visual treatment.
 */
export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  label = 'Confidence',
  className = '',
}) => {
  // Clamp to reasonable range
  const pct = Math.max(0, Math.min(100, Math.round(confidence)));

  return (
    <span
      className={`
        inline-flex items-center 
        px-3 py-0.5 
        text-xs font-semibold tracking-wider
        rounded-full 
        bg-[var(--geodesis-primary)] 
        text-white
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="status"
      aria-label={`${label}: ${pct}%`}
    >
      {label} {pct}%
    </span>
  );
};

export default ConfidenceBadge;