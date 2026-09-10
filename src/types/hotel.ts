export type RoomTypeName = 'Standard' | 'Deluxe' | 'Suite' | 'Executive' | 'Accessible';

export type HousekeepingStatus = 'dirty' | 'cleaning' | 'clean' | 'inspected';

export type HousekeepingPriority = 'high' | 'normal' | 'low';

export type RoomFrontOfficeStatus =
'available' |
'occupied' |
'reserved' |
'maintenance' |
'out-of-service';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomTypeName;
  beds: string;
  maxOccupancy: number;
  rate: number;
  view: string;
  outOfService: boolean;
  housekeeping: HousekeepingStatus;
  housekeepingPriority: HousekeepingPriority;
  housekeeper: string | null;
}

export type GuestTier = 'Standard' | 'Silver' | 'Gold' | 'Platinum';

export type GuestSegment = 'Leisure' | 'Corporate' | 'Group' | 'OTA';

export interface GuestNote {
  id: string;
  date: string;
  staff: string;
  content: string;
}

export interface GuestDocument {
  id: string;
  name: string;
  uploadedAt: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  company?: string;
  tier: GuestTier;
  segment: GuestSegment;
  idType: string;
  idNumber: string;
  idVerified: boolean;
  preferences: string[];
  notes: GuestNote[];
  documents: GuestDocument[];
  createdAt: string;
}

export type ReservationStatus =
'tentative' |
'confirmed' |
'in-house' |
'checked-out' |
'cancelled' |
'no-show';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export type BookingSource =
'Direct' |
'Website' |
'Phone' |
'Walk-In' |
'Booking.com' |
'Expedia' |
'Corporate' |
'Travel Agent';

export interface HistoryEntry {
  id: string;
  at: string;
  actor: string;
  event: string;
  detail?: string;
}

export interface Reservation {
  id: string;
  code: string;
  guestId: string;
  roomId: string | null;
  roomType: RoomTypeName;
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  rate: number;
  source: BookingSource;
  requests: string;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  accompanying: string[];
  keyCards: number;
  cancellationReason?: string;
  createdAt: string;
  history: HistoryEntry[];
}

export type ChargeCode =
'Room' |
'Tax' |
'Restaurant' |
'Bar' |
'Minibar' |
'Spa' |
'Laundry' |
'Parking' |
'Transfer' |
'Late Checkout' |
'Adjustment';

export interface Charge {
  id: string;
  reservationId: string;
  code: ChargeCode;
  description: string;
  quantity: number;
  unitPrice: number;
  date: string;
  postedBy: string;
}

export type PaymentMethod =
'Visa' |
'Mastercard' |
'Amex' |
'Cash' |
'Bank Transfer' |
'City Ledger';

export type PaymentKind = 'Payment' | 'Deposit' | 'Refund';

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  method: PaymentMethod;
  kind: PaymentKind;
  date: string;
  reference: string;
}

export type TicketStatus = 'open' | 'in-progress' | 'awaiting-parts' | 'resolved';

export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface MaintenanceTicket {
  id: string;
  code: string;
  roomId: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  blocksSale: boolean;
  assignee: string | null;
  reportedBy: string;
  createdAt: string;
}

export type Department = 'Front Office' | 'Housekeeping' | 'Maintenance' | 'F&B' | 'Management';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: Department;
  shift: string;
  status: 'On Duty' | 'Off Duty' | 'On Break' | 'Leave';
  phone: string;
  email: string;
  workload: number;
}

export interface RoomTypeConfig {
  name: RoomTypeName;
  baseRate: number;
  maxOccupancy: number;
  count: number;
}

export interface PropertySettings {
  propertyName: string;
  propertyCode: string;
  address: string;
  currency: string;
  checkInTime: string;
  checkOutTime: string;
  auditTime: string;
  cancellationWindowHours: number;
  cancellationFeePercent: number;
  depositPercent: number;
  depositRequired: boolean;
  confirmationEmail: boolean;
  preArrivalEmail: boolean;
  departureSurvey: boolean;
  roomTypes: RoomTypeConfig[];
}

export interface Folio {
  charges: Charge[];
  payments: Payment[];
  chargeTotal: number;
  paidTotal: number;
  balance: number;
}

export type AlertLevel = 'critical' | 'warning' | 'info';

export interface OperationalAlert {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  to: string;
}