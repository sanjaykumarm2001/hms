export type RoomTypeId =
'standard_queen' |
'deluxe_king' |
'executive_suite' |
'penthouse';

export type HousekeepingStatus = 'dirty' | 'cleaning' | 'clean' | 'inspected';
export type HousekeepingPriority = 'high' | 'normal' | 'low';
export type RoomBaseStatus = 'in_service' | 'out_of_service';

/** Derived front-office status, never stored. */
export type FrontOfficeStatus =
'available' |
'reserved' |
'occupied' |
'maintenance' |
'out_of_service';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomTypeId;
  beds: string;
  maxOccupancy: number;
  rate: number;
  view: string;
  baseStatus: RoomBaseStatus;
  housekeeping: HousekeepingStatus;
  hkPriority: HousekeepingPriority;
  housekeeper: string | null;
}

export type GuestTier = 'standard' | 'silver' | 'gold' | 'vip';
export type GuestSegment = 'leisure' | 'corporate' | 'group' | 'ota';

export interface GuestNote {
  id: string;
  at: string;
  by: string;
  text: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  tier: GuestTier;
  segment: GuestSegment;
  idType: string | null;
  idNumber: string | null;
  preferences: string[];
  notes: GuestNote[];
  stays: number;
}

export type ReservationStatus =
'tentative' |
'confirmed' |
'in_house' |
'checked_out' |
'cancelled';

export type PaymentStatus = 'unpaid' | 'partial' | 'prepaid' | 'paid';

export interface HistoryEntry {
  id: string;
  at: string;
  by: string;
  text: string;
}

export interface Reservation {
  id: string;
  confirmation: string;
  guestId: string;
  roomId: string | null;
  roomType: RoomTypeId;
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  rate: number;
  source: string;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  requests: string;
  keyCards: number;
  accompanying: string[];
  history: HistoryEntry[];
}

export type ChargeCode =
'room' |
'tax' |
'restaurant' |
'bar' |
'minibar' |
'spa' |
'laundry' |
'parking' |
'transfer' |
'late_checkout' |
'adjustment';

export interface Charge {
  id: string;
  reservationId: string;
  code: ChargeCode;
  description: string;
  qty: number;
  unitPrice: number;
  postedAt: string;
  by: string;
}

export type PaymentMethod =
'visa' |
'mastercard' |
'amex' |
'cash' |
'bank_transfer' |
'city_ledger';

export type PaymentKind = 'payment' | 'deposit' | 'refund';

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  method: PaymentMethod;
  kind: PaymentKind;
  at: string;
  by: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'awaiting_parts' | 'resolved';
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface MaintenanceTicket {
  id: string;
  roomId: string;
  title: string;
  detail: string;
  priority: TicketPriority;
  status: TicketStatus;
  blocksSale: boolean;
  assignee: string | null;
  createdAt: string;
}

export type Department =
'front_office' |
'housekeeping' |
'maintenance' |
'fnb' |
'management';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: Department;
  shift: string;
  onDuty: boolean;
  phone: string;
  workload: number;
}

export type ActivityKind = 'door' | 'amenity' | 'pos' | 'security';
export type ActivityResult = 'granted' | 'denied' | 'info';

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  title: string;
  location: string;
  guestId: string | null;
  roomNumber: string | null;
  result: ActivityResult;
  detail: string;
  at: string;
}

export interface Folio {
  charges: Charge[];
  payments: Payment[];
  chargeTotal: number;
  paidTotal: number;
  balance: number;
}