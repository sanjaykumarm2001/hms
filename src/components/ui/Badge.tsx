import React from 'react';
import { twMerge } from 'tailwind-merge';
import type {
  FrontOfficeStatus,
  HousekeepingStatus,
  PaymentStatus,
  ReservationStatus,
  TicketPriority,
  TicketStatus } from
'../../types';

type Tone =
'neutral' |
'blue' |
'green' |
'amber' |
'red' |
'violet' |
'slate' |
'teal';

const tones: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  slate: 'bg-slate-900 text-white ring-slate-900',
  blue: 'bg-brand-50 text-brand-700 ring-brand-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  teal: 'bg-teal-50 text-teal-700 ring-teal-100'
};

export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children





}: {tone?: Tone;dot?: boolean;className?: string;children: React.ReactNode;}) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap',
        tones[tone],
        className
      )}>
      
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>);

}

const reservationTone: Record<ReservationStatus, Tone> = {
  tentative: 'amber',
  confirmed: 'blue',
  in_house: 'green',
  checked_out: 'neutral',
  cancelled: 'red'
};
const reservationLabel: Record<ReservationStatus, string> = {
  tentative: 'Tentative',
  confirmed: 'Expected',
  in_house: 'In-House',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled'
};

export function ReservationBadge({ status }: {status: ReservationStatus;}) {
  return (
    <Badge tone={reservationTone[status]} dot>
      {reservationLabel[status]}
    </Badge>);

}

const paymentTone: Record<PaymentStatus, Tone> = {
  unpaid: 'red',
  partial: 'amber',
  prepaid: 'teal',
  paid: 'green'
};
const paymentLabel: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partial: 'Balance due',
  prepaid: 'Prepaid',
  paid: 'Settled'
};

export function PaymentBadge({ status }: {status: PaymentStatus;}) {
  return <Badge tone={paymentTone[status]}>{paymentLabel[status]}</Badge>;
}

const roomTone: Record<FrontOfficeStatus, Tone> = {
  available: 'green',
  reserved: 'blue',
  occupied: 'violet',
  maintenance: 'red',
  out_of_service: 'neutral'
};
const roomLabel: Record<FrontOfficeStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  out_of_service: 'Out of Service'
};

export function RoomStatusBadge({ status }: {status: FrontOfficeStatus;}) {
  return (
    <Badge tone={roomTone[status]} dot>
      {roomLabel[status]}
    </Badge>);

}

const hkTone: Record<HousekeepingStatus, Tone> = {
  dirty: 'red',
  cleaning: 'amber',
  clean: 'blue',
  inspected: 'green'
};
const hkLabel: Record<HousekeepingStatus, string> = {
  dirty: 'Dirty',
  cleaning: 'Cleaning',
  clean: 'Clean',
  inspected: 'Inspected'
};

export function HousekeepingBadge({ status }: {status: HousekeepingStatus;}) {
  return <Badge tone={hkTone[status]}>{hkLabel[status]}</Badge>;
}

const ticketTone: Record<TicketStatus, Tone> = {
  open: 'red',
  in_progress: 'amber',
  awaiting_parts: 'violet',
  resolved: 'green'
};
const ticketLabel: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  awaiting_parts: 'Awaiting Parts',
  resolved: 'Resolved'
};

export function TicketBadge({ status }: {status: TicketStatus;}) {
  return <Badge tone={ticketTone[status]}>{ticketLabel[status]}</Badge>;
}

const priorityTone: Record<TicketPriority, Tone> = {
  urgent: 'red',
  high: 'amber',
  normal: 'neutral',
  low: 'neutral'
};

export function PriorityBadge({ priority }: {priority: TicketPriority;}) {
  return (
    <Badge tone={priorityTone[priority]}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>);

}