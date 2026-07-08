import React from 'react';

interface SliderControlProps {
  /** Label shown above the slider */
  label: string;
  /** Current numeric value */
  value: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
  /** Optional unit to display after value */
  unit?: string;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Optional helper text */
  helperText?: string;
  /** Optional className */
  className?: string;
}

/**
 * SliderControl
 * 
 * Reusable slider primitive for Scenario Builder and similar controls.
 * 
 * Follows Design System:
 * - Clean, calm interaction
 * - Value display + unit
 * - Uses native range with heavy styling via CSS variables
 * - Accessible (labels, keyboard)
 * - Production quality
 */
export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  helperText,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const displayValue = unit ? `${value}${unit}` : value;

  return (
    <div className={`w-full ${className}`}>
      {/* Header: Label + current value */}
      <div className="flex items-baseline justify-between mb-2">
        <label 
          className="text-sm font-medium text-[var(--geodesis-text-secondary)]"
          htmlFor={`slider-${label.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {label}
        </label>
        <span 
          className="font-mono text-base font-semibold text-[var(--geodesis-text-primary)] tabular-nums"
          aria-live="polite"
        >
          {displayValue}
        </span>
      </div>

      {/* Slider */}
      <input
        id={`slider-${label.replace(/\s+/g, '-').toLowerCase()}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={`
          w-full accent-[var(--geodesis-primary)] 
          cursor-pointer
          bg-[var(--timeline-track-bg)]
          rounded-full
          h-2
        `}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      />

      {/* Min / Max indicators */}
      <div className="flex justify-between text-[10px] text-[var(--geodesis-text-muted)] mt-1 font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>

      {helperText && (
        <p className="mt-1.5 text-[11px] text-[var(--geodesis-text-muted)]">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default SliderControl;