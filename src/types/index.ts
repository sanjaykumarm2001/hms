export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'reserved' | 'ooo';

export type BookingStatus = 'expected' | 'in-house' | 'departing' | 'checked-out';

export type PaymentState = 'prepaid' | 'settled' | 'balance';

export interface Booking {
  id: string;
  confirmation: string;
  guestName: string;
  guestTag: string;
  avatar?: string;
  arrival: string;
  departure: string;
  nights: number;
  roomType: string;
  roomNumber: string;
  roomReady?: boolean;
  source: string;
  status: BookingStatus;
  total: number;
  payment: PaymentState;
  balance?: number;
}

export interface Room {
  number: string;
  floor: number;
  type: string;
  status: RoomStatus;
  guest?: string;
  note?: string;
  nights?: number;
  eta?: string;
}

export interface ActivityEvent {
  id: string;
  location: string;
  access: 'granted' | 'denied' | 'info';
  detail?: string;
  guest: string;
  room: string;
  time: string;
  icon: 'door' | 'spa' | 'pos' | 'elevator';
  camera?: string;
}

export type HousekeepingState = 'dirty' | 'cleaning' | 'clean' | 'inspected' | 'maintenance';

export interface HousekeepingTask {
  room: string;
  floor: number;
  type: string;
  state: HousekeepingState;
  attendant: string;
  minutes: number;
  priority: 'high' | 'normal' | 'low';
}

export interface Attendant {
  name: string;
  zone: string;
  done: number;
  total: number;
}

export interface Movement {
  id: string;
  guest: string;
  segment: string;
  room: string;
  direction: 'Arrival' | 'Departure';
  time: string;
  initials: string;
}