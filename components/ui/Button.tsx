import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleOptions & {
    loading?: boolean;
  };

const variantClassMap: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md active:bg-primary-active',
  secondary:
    'bg-secondary text-white shadow-sm hover:bg-secondary-hover hover:shadow-md active:bg-secondary-active',
  outline:
    'border border-border bg-surface text-text-primary hover:border-secondary/35 hover:bg-surface-muted active:bg-background-muted',
  ghost: 'text-text-secondary hover:bg-surface-muted hover:text-text-primary active:bg-background-muted',
  danger: 'bg-error text-white shadow-sm hover:bg-red-700 hover:shadow-md active:bg-red-900',
};

const sizeClassMap: Record<ButtonSize, string> = {
  small: 'px-3 py-1.5 text-xs',
  medium: 'px-4 py-2.5 text-sm',
  large: 'px-5 py-3 text-sm',
};

function cn(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ');
}

export function buttonClassName({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-55',
    variantClassMap[variant],
    sizeClassMap[size],
    fullWidth && 'w-full',
    className
  );
}

export default function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={buttonClassName({ variant, size, fullWidth, className })}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}
