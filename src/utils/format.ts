import { differenceInCalendarDays, format, parseISO } from 'date-fns';

let activeCurrency = 'USD';

export function setGlobalCurrency(code: string) {
  if (code) activeCurrency = code;
}

export function getGlobalCurrency(): string {
  return activeCurrency;
}

export function money(value: number, currencyCode?: string): string {
  const code = currencyCode || activeCurrency;
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  } catch {
    return `${code === 'INR' ? '₹' : '$'}${value.toFixed(2)}`;
  }
}

export function money0(value: number, currencyCode?: string): string {
  const code = currencyCode || activeCurrency;
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `${code === 'INR' ? '₹' : '$'}${Math.round(value)}`;
  }
}

export function isoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function shortDate(iso: string): string {
  return format(parseISO(iso), 'dd MMM');
}

export function longDate(iso: string): string {
  return format(parseISO(iso), 'EEE dd MMM yyyy');
}

export function dateTime(iso: string): string {
  return format(new Date(iso), 'dd MMM · HH:mm');
}

export function nightsBetween(arrival: string, departure: string): number {
  return Math.max(1, differenceInCalendarDays(parseISO(departure), parseISO(arrival)));
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function percent(value: number): string {
  return `${Math.round(value)}%`;
}

export function titleCase(value: string): string {
  return value.
  split('-').
  map((part) => part.charAt(0).toUpperCase() + part.slice(1)).
  join(' ');
}