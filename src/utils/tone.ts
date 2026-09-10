import type {
  HousekeepingPriority,
  HousekeepingStatus,
  PaymentStatus,
  ReservationStatus,
  RoomFrontOfficeStatus,
  TicketPriority,
  TicketStatus } from
'../types/hotel';

export type Tone = 'green' | 'blue' | 'red' | 'amber' | 'gray' | 'citrus';

export const reservationTone: Record<ReservationStatus, Tone> = {
  tentative: 'citrus',
  confirmed: 'blue',
  'in-house': 'green',
  'checked-out': 'gray',
  cancelled: 'red',
  'no-show': 'red'
};

export const reservationLabel: Record<ReservationStatus, string> = {
  tentative: 'Tentative',
  confirmed: 'Confirmed',
  'in-house': 'In House',
  'checked-out': 'Checked Out',
  cancelled: 'Cancelled',
  'no-show': 'No Show'
};

export const roomStatusTone: Record<RoomFrontOfficeStatus, Tone> = {
  available: 'green',
  occupied: 'blue',
  reserved: 'citrus',
  maintenance: 'red',
  'out-of-service': 'gray'
};

export const roomStatusLabel: Record<RoomFrontOfficeStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  maintenance: 'Maintenance',
  'out-of-service': 'Out of Service'
};

export const housekeepingTone: Record<HousekeepingStatus, Tone> = {
  dirty: 'red',
  cleaning: 'amber',
  clean: 'blue',
  inspected: 'green'
};

export const housekeepingLabel: Record<HousekeepingStatus, string> = {
  dirty: 'Dirty',
  cleaning: 'Cleaning',
  clean: 'Clean',
  inspected: 'Inspected'
};

export const priorityTone: Record<HousekeepingPriority, Tone> = {
  high: 'red',
  normal: 'gray',
  low: 'blue'
};

export const ticketStatusTone: Record<TicketStatus, Tone> = {
  open: 'red',
  'in-progress': 'amber',
  'awaiting-parts': 'citrus',
  resolved: 'green'
};

export const ticketStatusLabel: Record<TicketStatus, string> = {
  open: 'Open',
  'in-progress': 'In Progress',
  'awaiting-parts': 'Awaiting Parts',
  resolved: 'Resolved'
};

export const ticketPriorityTone: Record<TicketPriority, Tone> = {
  urgent: 'red',
  high: 'amber',
  normal: 'gray',
  low: 'blue'
};

export const paymentTone: Record<PaymentStatus, Tone> = {
  unpaid: 'red',
  partial: 'amber',
  paid: 'green'
};

export const paymentLabel: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid'
};