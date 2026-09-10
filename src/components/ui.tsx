import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon, XIcon } from 'lucide-react';

export function Card({
  children,
  className = ''
}: {children: React.ReactNode;className?: string;}) {
  return (
    <section className={`relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-xl shadow-md transition-all duration-200 hover:shadow-xl hover:shadow-brand-900/10 hover:border-brand-300/90 hover:bg-brand-wash before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-brand-gradient-v before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200 ${className}`}>
      {children}
    </section>);

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
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
      gradient ? 'bg-brand-gradient hover:brightness-[1.06]' : 'bg-brand-600 hover:bg-brand-500',
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-line/80 bg-white/80 backdrop-blur-sm px-4 py-2.5 text-[13px] font-semibold text-ink-soft transition-all duration-150 hover:bg-white hover:text-ink hover:border-line disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
      
      {children}
    </button>);

}

export function DangerButton({
  children,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#f3ceca] bg-[#fdeceb] px-4 py-2.5 text-[13px] font-semibold text-[#b3312a] transition-colors duration-150 hover:bg-[#fbdedb] ${className}`}>
      
      {children}
    </button>);

}

export function LinkButton({
  children,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700 transition-colors duration-150 hover:text-brand-800 ${className}`}>
      
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
      
      {dot ?
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColors[tone] }} /> :
      null}
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
      aria-valuenow={Math.round(value)}
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
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {eyebrow}
          </p> :
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

export function Field({
  label,
  hint,
  children,
  className = ''





}: {label: string;hint?: string;children: React.ReactNode;className?: string;}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span> : null}
    </label>);

}

const controlClass =
'h-10 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return <input {...rest} className={`${controlClass} ${className}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props;
  return (
    <select {...rest} className={`${controlClass} pr-8 ${className}`}>
      {children}
    </select>);

}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none ${className}`} />);


}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className = ''





}: {value: string;onChange: (value: string) => void;placeholder: string;className?: string;}) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{placeholder}</span>
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none" />
      
    </label>);

}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange




}: {tabs: {id: T;label: string;count?: number;}[];active: T;onChange: (id: T) => void;}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-white p-1" role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={[
            'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150',
            isActive ? 'bg-brand-600 text-white' : 'text-ink-soft hover:bg-canvas hover:text-ink'].
            join(' ')}>
            
            {tab.label}
            {typeof tab.count === 'number' ?
            <span
              className={`tabular rounded-full px-1.5 text-[10px] font-bold ${
              isActive ? 'bg-white/20 text-white' : 'bg-canvas text-ink-muted'}`
              }>
              
                {tab.count}
              </span> :
            null}
          </button>);

      })}
    </div>);

}

export function EmptyState({
  title,
  detail,
  action




}: {title: string;detail: string;action?: React.ReactNode;}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <p className="max-w-[320px] text-[12px] text-ink-muted">{detail}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>);

}

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 'max-w-[560px]'








}: {open: boolean;title: string;subtitle?: string;onClose: () => void;children: React.ReactNode;footer?: React.ReactNode;width?: string;}) {
  return (
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
          <motion.div
          className="fixed inset-0 bg-[#0e1113]/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          onClick={onClose}
          aria-hidden="true" />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`relative w-full ${width} rounded-card border border-line bg-white shadow-panel`}
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
          
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-[16px] font-bold tracking-tight text-ink">{title}</h2>
                {subtitle ? <p className="mt-1 text-[12px] text-ink-muted">{subtitle}</p> : null}
              </div>
              <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-md p-1.5 text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
              
                <XIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
            {footer ?
          <div className="flex items-center justify-end gap-2 border-t border-line bg-[#fafbf8] px-5 py-4">
                {footer}
              </div> :
          null}
          </motion.div>
        </div> :
      null}
    </AnimatePresence>);

}

export function KeyValue({ label, value }: {label: string;value: React.ReactNode;}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
      <p className="mt-1 truncate text-[13px] font-semibold text-ink">{value}</p>
    </div>);

}

export function Avatar({ text, className = '' }: {text: string;className?: string;}) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800 ${className}`}>
      
      {text}
    </span>);

}

export function TableHead({ columns }: {columns: {key: string;label: string;align?: 'right';}[];}) {
  return (
    <thead>
      <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {columns.map((column, index) =>
        <th
          key={column.key}
          scope="col"
          className={[
          'py-2.5 font-semibold',
          index === 0 ? 'pl-5 pr-3' : 'px-3',
          index === columns.length - 1 ? 'pr-5' : '',
          column.align === 'right' ? 'text-right' : 'text-left'].
          join(' ')}>
          
            {column.label}
          </th>
        )}
      </tr>
    </thead>);

}