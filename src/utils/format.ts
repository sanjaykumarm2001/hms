import { differenceInCalendarDays, format, parseISO } from 'date-fns';

let activeCurrency = 'INR';

export function setGlobalCurrency(code: string) {
  if (code) activeCurrency = code;
}

export function getGlobalCurrency(): string {
  return activeCurrency;
}

export function money(value: number, currencyCode?: string): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  const code = currencyCode || activeCurrency;
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num);
  } catch {
    return `${code === 'INR' ? '₹' : '$'}${num.toFixed(2)}`;
  }
}

export function money0(value: number, currencyCode?: string): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  const code = currencyCode || activeCurrency;
  try {
    return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 0
    }).format(num);
  } catch {
    return `${code === 'INR' ? '₹' : '$'}${Math.round(num)}`;
  }
}

export function isoDate(date?: Date | string | null): string {
  if (!date) return format(new Date(), 'yyyy-MM-dd');
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) return format(new Date(), 'yyyy-MM-dd');
    return format(d, 'yyyy-MM-dd');
  } catch {
    return format(new Date(), 'yyyy-MM-dd');
  }
}

export function shortDate(iso: string): string {
  if (!iso) return '—';
  try {
    const parsed = parseISO(iso);
    if (isNaN(parsed.getTime())) return iso;
    return format(parsed, 'dd MMM');
  } catch {
    return iso;
  }
}

export function longDate(iso: string): string {
  if (!iso) return '—';
  try {
    const parsed = parseISO(iso);
    if (isNaN(parsed.getTime())) return iso;
    return format(parsed, 'EEE dd MMM yyyy');
  } catch {
    return iso;
  }
}

export function dateTime(iso: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return format(d, 'dd MMM · HH:mm');
  } catch {
    return iso;
  }
}

export function nightsBetween(arrival: string, departure: string): number {
  if (!arrival || !departure) return 1;
  try {
    const arr = parseISO(arrival);
    const dep = parseISO(departure);
    if (isNaN(arr.getTime()) || isNaN(dep.getTime())) return 1;
    return Math.max(1, differenceInCalendarDays(dep, arr));
  } catch {
    return 1;
  }
}

export function initials(first?: string, last?: string): string {
  const f = (first || '').charAt(0);
  const l = (last || '').charAt(0);
  return `${f}${l}`.toUpperCase() || 'G';
}

export function percent(value: number): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return `${Math.round(num)}%`;
}

export function titleCase(value: string): string {
  return value.
  split('-').
  map((part) => part.charAt(0).toUpperCase() + part.slice(1)).
  join(' ');
}