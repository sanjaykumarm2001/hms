import React from 'react';
import { twMerge } from 'tailwind-merge';

const base =
'h-9 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink placeholder:text-ink-faint transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none';

export function Field({
  label,
  hint,
  required,
  children,
  className






}: {label: string;hint?: string;required?: boolean;children: React.ReactNode;className?: string;}) {
  return (
    <label className={twMerge('block', className)}>
      <span className="mb-1.5 block text-[12px] font-medium text-ink-muted">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-faint">{hint}</span>}
    </label>);

}

export function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={twMerge(base, className)} />;
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={twMerge(base, 'pr-8', className)}>
      {children}
    </select>);

}

export function Textarea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={twMerge(base, 'h-auto min-h-[80px] py-2 leading-relaxed', className)} />);


}