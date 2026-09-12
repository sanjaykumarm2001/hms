import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from 'lucide-react';

export function Card({
  children,
  className = ''
}: {children: React.ReactNode;className?: string;}) {
  return (
    <section className={`glass-card-premium relative overflow-hidden rounded-2xl border border-white/80 shadow-sm transition-all duration-200 hover:shadow-xl hover:shadow-[#176938]/10 hover:border-emerald-300/80 hover:-translate-y-0.5 ${className}`}>
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
        'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#176938] to-[#2daf57] px-4 py-2 text-xs font-bold text-white transition-all duration-150 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm cursor-pointer',
        className
      ].join(' ')}>
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
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#176938] to-[#2daf57] px-4 py-2 text-xs font-bold text-white transition-all duration-150 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm cursor-pointer',
        className
      ].join(' ')}>
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

export function SelectInput({
  value,
  onChange,
  children,
  className = '',
  'aria-label': ariaLabel,
  disabled = false
}: {
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const val = String(child.props.value ?? '');
        const label = String(child.props.children ?? val);
        list.push({ value: val, label });
      }
    });
    return list;
  }, [children]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = parsedOptions.find((opt) => String(opt.value) === String(value)) ?? parsedOptions[0];
  const displayLabel = selectedOption?.label ?? (value !== undefined ? String(value) : '');

  const handleSelect = (optValue: string) => {
    if (onChange) {
      onChange({ target: { value: optValue } } as any);
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-label={ariaLabel}
        className="flex w-full items-center justify-between gap-2.5 h-10 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-xs px-3.5 text-xs font-bold text-slate-800 shadow-xs hover:border-[#176938] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#176938]/20 transition-all cursor-pointer"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-[#176938]' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-xl p-1.5 space-y-0.5 min-w-[160px]">
          {parsedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`flex w-full items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                  isSelected
                    ? 'bg-emerald-50 text-[#176938] font-extrabold'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#176938]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
            isActive ? 'bg-[#176938] text-white shadow-sm' : 'text-ink-soft hover:bg-canvas hover:text-ink'].
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
  width = 'max-w-[560px]',
  hideHeader = false
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  hideHeader?: boolean;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <motion.div
            className="fixed inset-0 bg-[#0c1829]/50 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            className={`relative flex flex-col w-full ${width} max-h-[92vh] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-10`}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {!hideHeader && title ? (
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 shrink-0 bg-white">
                <div>
                  <h2 className="text-[17px] font-bold tracking-tight text-slate-900">{title}</h2>
                  {subtitle ? <p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                >
                  <XIcon aria-hidden="true" className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 no-scrollbar">{children}</div>

            {footer ? (
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 backdrop-blur-xs px-6 py-3.5 shrink-0">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
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
    </thead>
  );
}