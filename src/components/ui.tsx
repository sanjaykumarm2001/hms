import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return <section className={`rounded-card border border-line bg-white shadow-card ${className}`}>{children}</section>;
}

export function CardHeader({
  title,
  subtitle,
  action




}: {title: string;subtitle?: string;action?: React.ReactNode;}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[12px] text-ink-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>);

}

export function PrimaryButton({
  children,
  gradient = false,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {gradient?: boolean;}) {
  return (
    <button
      type="button"
      {...rest}
      className={[
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150',
      gradient ?
      'bg-brand-gradient hover:brightness-[1.06]' :
      'bg-brand-600 hover:bg-brand-500',
      className].
      join(' ')}>
      
      {children}
    </button>);

}

export function SecondaryButton({
  children,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors duration-150 hover:bg-canvas ${className}`}>
      
      {children}
    </button>);

}

const statusStyles: Record<string, string> = {
  green: 'bg-brand-50 text-brand-800',
  blue: 'bg-[#eaf1fd] text-[#1e57ad]',
  red: 'bg-[#fdeceb] text-[#b3312a]',
  amber: 'bg-[#fdf3e2] text-[#8d5a10]',
  gray: 'bg-[#f1f2ef] text-ink-soft',
  citrus: 'bg-[#f7f9d9] text-[#6b7112]'
};

const dotColors: Record<string, string> = {
  green: '#25b84f',
  blue: '#2f74e0',
  red: '#e0453c',
  amber: '#f0a72a',
  gray: '#9ca3af',
  citrus: '#c3c72f'
};

export function StatusPill({
  tone,
  children,
  dot = true




}: {tone: keyof typeof statusStyles;children: React.ReactNode;dot?: boolean;}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[tone]}`}>
      
      {dot ? <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColors[tone] }} /> : null}
      {children}
    </span>);

}

export function ProgressBar({
  value,
  className = '',
  gradient = true,
  label





}: {value: number;className?: string;gradient?: boolean;label?: string;}) {
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-[#eceee8] ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}>
      
      <div
        className={`h-full rounded-full ${gradient ? 'bg-brand-gradient' : 'bg-brand-600'}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      
    </div>);

}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  actions






}: {eyebrow?: string;title: string;subtitle?: string;badge?: React.ReactNode;actions?: React.ReactNode;}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ?
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{eyebrow}</p> :
        null}
        <div className="flex items-center gap-3">
          <h1 className="text-[26px] font-bold leading-none tracking-tight text-ink">{title}</h1>
          {badge}
        </div>
        {subtitle ? <p className="mt-2 text-[13px] text-ink-soft">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>);

}