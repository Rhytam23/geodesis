import React from 'react';
import { MapPin } from 'lucide-react';

interface EmptyStateProps {
  /** Main message (e.g. "No location selected") */
  title: string;
  /** Helpful description */
  description?: string;
  /** Primary action label (optional CTA) */
  actionLabel?: string;
  /** Callback for primary action */
  onAction?: () => void;
  /** Optional icon override */
  icon?: React.ReactNode;
  /** Optional className */
  className?: string;
}

/**
 * EmptyState
 * 
 * Beautiful, calm empty state for the Geodesis workspace.
 * Follows spec: "Beautiful illustration + clear CTA"
 * 
 * Reusable across workspace when no data / location is present.
 * Uses design tokens.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  const defaultIcon = <MapPin className="w-8 h-8 text-slate-300" />;

  return (
    <div 
      className={`
        flex flex-col items-center justify-center 
        text-center py-10 px-6 
        bg-white 
        border border-[var(--geodesis-border)] 
        rounded-[var(--radius-3xl)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="status"
    >
      <div className="mb-4 text-slate-300">
        {icon || defaultIcon}
      </div>

      <h3 className="text-[var(--font-size-lg)] font-semibold text-[var(--geodesis-text-primary)] mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="text-[var(--font-size-sm)] text-[var(--geodesis-text-muted)] max-w-[260px] mb-5">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-2xl bg-[var(--geodesis-primary)] text-white hover:bg-[var(--geodesis-primary-hover)] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;