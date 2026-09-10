import { differenceInCalendarDays, format, parseISO } from 'date-fns';

export const today = (): string => format(new Date(), 'yyyy-MM-dd');

export const money = (value: number): string =>
new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
}).format(value);

export const shortDate = (iso: string): string => format(parseISO(iso), 'MMM d');

export const longDate = (iso: string): string =>
format(parseISO(iso), 'EEE, MMM d yyyy');

export const nights = (arrival: string, departure: string): number =>
Math.max(1, differenceInCalendarDays(parseISO(departure), parseISO(arrival)));

export const timeAgo = (iso: string): string => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export const clockTime = (iso: string): string => format(new Date(iso), 'HH:mm');

export const initials = (first: string, last: string): string =>
`${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export const titleize = (value: string): string =>
value.
split('_').
map((part) => part.charAt(0).toUpperCase() + part.slice(1)).
join(' ');