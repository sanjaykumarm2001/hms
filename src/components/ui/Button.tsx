import React from 'react';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
  'bg-brand-600 text-white hover:bg-brand-700 border border-transparent shadow-card',
  secondary:
  'bg-white text-ink border border-line hover:bg-slate-50 shadow-card',
  ghost: 'bg-transparent text-ink-muted hover:bg-slate-100 border border-transparent',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-9 px-3.5 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-xl'
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={twMerge(
        'inline-flex items-center justify-center font-medium transition-colors duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}>
      
      {children}
    </button>);

}