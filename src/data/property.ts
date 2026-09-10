import type {
  ChargeCode,
  PaymentKind,
  PaymentMethod,
  RoomTypeId } from
'../types';

export const property = {
  name: 'Harbor View Hotel',
  group: 'Meridian Hotel Management Group',
  system: 'Sentinel ProPMS',
  address: '18 Quayside Terrace, Harbor District',
  checkIn: '14:00',
  checkOut: '11:00',
  currency: 'USD',
  timezone: 'America/New_York',
  rooms: 20
};

export const roomTypes: {
  id: RoomTypeId;
  name: string;
  short: string;
  rate: number;
  beds: string;
  maxOccupancy: number;
}[] = [
{
  id: 'standard_queen',
  name: 'Standard Queen',
  short: 'STDQ',
  rate: 260,
  beds: '1 Queen',
  maxOccupancy: 2
},
{
  id: 'deluxe_king',
  name: 'Deluxe King',
  short: 'DLXK',
  rate: 284,
  beds: '1 King',
  maxOccupancy: 3
},
{
  id: 'executive_suite',
  name: 'Executive Suite',
  short: 'EXES',
  rate: 420,
  beds: '1 King + Sofa',
  maxOccupancy: 4
},
{
  id: 'penthouse',
  name: 'Penthouse',
  short: 'PENT',
  rate: 780,
  beds: '2 King',
  maxOccupancy: 5
}];


export const roomTypeName = (id: RoomTypeId): string =>
roomTypes.find((t) => t.id === id)?.name ?? id;

export const chargeCodes: {id: ChargeCode;label: string;unitPrice: number;}[] =
[
{ id: 'room', label: 'Room & Tax', unitPrice: 284 },
{ id: 'tax', label: 'Occupancy Tax', unitPrice: 34 },
{ id: 'restaurant', label: 'Restaurant', unitPrice: 68 },
{ id: 'bar', label: 'Lobby Bar', unitPrice: 42.5 },
{ id: 'minibar', label: 'Minibar', unitPrice: 24 },
{ id: 'spa', label: 'Spa & Wellness', unitPrice: 150 },
{ id: 'laundry', label: 'Laundry & Pressing', unitPrice: 35 },
{ id: 'parking', label: 'Valet Parking', unitPrice: 45 },
{ id: 'transfer', label: 'Airport Transfer', unitPrice: 95 },
{ id: 'late_checkout', label: 'Late Check-Out', unitPrice: 75 },
{ id: 'adjustment', label: 'Adjustment', unitPrice: 0 }];


export const paymentMethods: {id: PaymentMethod;label: string;}[] = [
{ id: 'visa', label: 'Visa' },
{ id: 'mastercard', label: 'Mastercard' },
{ id: 'amex', label: 'Amex' },
{ id: 'cash', label: 'Cash' },
{ id: 'bank_transfer', label: 'Bank Transfer' },
{ id: 'city_ledger', label: 'City Ledger' }];


export const paymentKinds: {id: PaymentKind;label: string;}[] = [
{ id: 'payment', label: 'Payment' },
{ id: 'deposit', label: 'Deposit' },
{ id: 'refund', label: 'Refund' }];


export const bookingSources = [
'Direct',
'Booking.com',
'Expedia',
'Agoda',
'Corporate',
'Walk-In',
'Travel Agent'];


export const cancellationRules = [
{ id: 'flex', label: 'Flexible', detail: 'Free cancellation until 18:00 on arrival day' },
{ id: 'std', label: 'Standard', detail: 'Free cancellation up to 48 hours before arrival' },
{ id: 'strict', label: 'Non-refundable', detail: 'First night charged on booking' }];


export const currentUser = {
  name: 'Alex Rivera',
  role: 'Duty Manager',
  email: 'alex.rivera@meridianhotels.com'
};