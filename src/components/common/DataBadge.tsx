import React from 'react';

interface DataBadgeProps {
  /** Source or data provider label (e.g. "NASA", "USDA", "Satellite") */
  source: string;
  /** Optional last updated timestamp or text */
  lastUpdated?: string;
  /** Optional className override */
  className?: string;
}

/**
 * DataBadge
 * 
 * Small reusable badge for data sources and provenance.
 * Follows exact Design System from GEODESIS_DESIGN_SPECIFICATION.md (Phase 4):
 * - text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium
 * - Uses design tokens for consistency
 * - Production quality, accessible
 */
export const DataBadge: React.FC<DataBadgeProps> = ({
  source,
  lastUpdated,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        text-[10px] font-medium tracking-wide
        px-2 py-0.5 
        rounded-full 
        bg-[var(--badge-data-bg)] 
        text-[var(--badge-data-text)]
        border border-[var(--geodesis-border-light)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="note"
      aria-label={`Data source: ${source}${lastUpdated ? `, last updated ${lastUpdated}` : ''}`}
    >
      <span>{source}</span>
      {lastUpdated && (
        <span className="text-[var(--geodesis-text-subtle)]">• {lastUpdated}</span>
      )}
    </span>
  );
};

export default DataBadge;