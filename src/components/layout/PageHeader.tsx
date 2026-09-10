import React from 'react';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions





}: {eyebrow?: string;title: string;subtitle?: string;actions?: React.ReactNode;}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
      <div className="min-w-0">
        {eyebrow &&
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-faint">
            {eyebrow}
          </p>
        }
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>);

}

export function Page({ children }: {children: React.ReactNode;}) {
  return <div className="mx-auto w-full max-w-[1400px] px-6 py-6">{children}</div>;
}

export function Card({
  title,
  action,
  padded = true,
  className = '',
  children






}: {title?: string;action?: React.ReactNode;padded?: boolean;className?: string;children: React.ReactNode;}) {
  return (
    <section
      className={`rounded-xl border border-line bg-white shadow-card ${className}`}>
      
      {title &&
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
          {action}
        </header>
      }
      <div className={padded ? 'p-4' : ''}>{children}</div>
    </section>);

}

export function EmptyState({
  icon: Icon,
  title,
  detail




}: {icon: React.ElementType;title: string;detail?: string;}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-ink-faint">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-[13px] font-semibold text-ink">{title}</p>
      {detail && <p className="max-w-[280px] text-[12px] text-ink-muted">{detail}</p>}
    </div>);

}