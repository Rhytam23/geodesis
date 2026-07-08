import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant matching design system */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Optional icon on the left */
  leftIcon?: React.ReactNode;
  /** Optional icon on the right */
  rightIcon?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
}

/**
 * Button
 * 
 * Basic reusable button primitive.
 * 
 * Variants (exact from Design System v2.0):
 * - Primary:   bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-medium
 * - Secondary: border border-slate-300 hover:bg-slate-50
 * - Ghost:     subtle / transparent
 * 
 * Follows all design tokens.
 * Fully accessible, keyboard friendly.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium transition-all duration-[var(--transition-base)]
    disabled:opacity-60 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--geodesis-primary)]
    active:scale-[0.985]
  `;

  const variantClasses = {
    primary: `
      bg-[var(--geodesis-primary)] text-white 
      hover:bg-[var(--geodesis-primary-hover)]
      shadow-sm
    `,
    secondary: `
      bg-white text-[var(--geodesis-text-primary)] 
      border border-[var(--geodesis-border)] 
      hover:bg-slate-50
    `,
    ghost: `
      bg-transparent text-[var(--geodesis-text-secondary)] 
      hover:bg-slate-100 hover:text-[var(--geodesis-text-primary)]
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-xl',
    md: 'px-5 py-2.5 text-[15px] rounded-2xl',
    lg: 'px-6 py-3 text-base rounded-2xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/70 border-t-white rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      
      {children && <span>{children}</span>}
      
      {!loading && rightIcon}
    </button>
  );
};

export default Button;