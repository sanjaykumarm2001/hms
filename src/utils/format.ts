import { differenceInCalendarDays, format, parseISO } from 'date-fns';

export function money(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
}

export function money0(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
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