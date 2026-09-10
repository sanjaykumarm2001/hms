import React from 'react';
import { twMerge } from 'tailwind-merge';
import { initials } from '../../utils/format';

const palette = [
'bg-brand-100 text-brand-700',
'bg-emerald-100 text-emerald-700',
'bg-amber-100 text-amber-700',
'bg-violet-100 text-violet-700',
'bg-teal-100 text-teal-700',
'bg-rose-100 text-rose-700'];


export function Avatar({
  firstName,
  lastName,
  size = 'md',
  className





}: {firstName: string;lastName: string;size?: 'sm' | 'md' | 'lg';className?: string;}) {
  const key = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % palette.length;
  const sizes = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-[11px]',
    lg: 'h-12 w-12 text-sm'
  };
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        palette[key],
        sizes[size],
        className
      )}>
      
      {initials(firstName, lastName)}
    </span>);

}