import { Booking } from '../types';

export const bookings: Booking[] = [
{
  id: 'b1',
  confirmation: '#BKG-8892A',
  guestName: 'Eleanor Vance',
  guestTag: 'VIP Guest',
  avatar: "/4a71eed8-9ad8-48aa-8e5a-1d782c41928e.jpg",
  arrival: 'Today',
  departure: 'Oct 28',
  nights: 3,
  roomType: 'Deluxe King',
  roomNumber: 'Room 402',
  roomReady: true,
  source: 'DIRECT',
  status: 'expected',
  total: 840,
  payment: 'prepaid'
},
{
  id: 'b2',
  confirmation: '#BKG-7741C',
  guestName: 'Marcus Chen',
  guestTag: 'Corporate Rate',
  arrival: 'Oct 22',
  departure: 'Oct 26',
  nights: 4,
  roomType: 'Executive Suite',
  roomNumber: 'Room 812',
  source: 'BOOKING.COM',
  status: 'in-house',
  total: 1420.5,
  payment: 'balance',
  balance: 140.5
},
{
  id: 'b3',
  confirmation: '#BKG-9921D',
  guestName: 'Sophia Rossi',
  guestTag: 'Leisure',
  avatar: "/02f80df6-69ed-42f7-aff2-51e18c4a7d37.jpg",
  arrival: 'Oct 20',
  departure: 'Today',
  nights: 5,
  roomType: 'Standard Queen',
  roomNumber: 'Room 204',
  source: 'AGODA',
  status: 'departing',
  total: 650,
  payment: 'settled'
}];


export const bookingTabs = [
{ id: 'all', label: 'All Bookings' },
{ id: 'arrivals', label: 'Arrivals' },
{ id: 'in-house', label: 'In-House' },
{ id: 'departures', label: 'Departures', count: 3 }] as
const;

export const bookingMetrics = [
{
  id: 'arrivals',
  label: 'ARRIVALS TODAY',
  value: '24',
  unit: '/ 30 Expected',
  footnote: '12% vs last week',
  trend: 'up' as const,
  icon: 'plane-landing' as const,
  accent: 'brand' as const
},
{
  id: 'inhouse',
  label: 'IN-HOUSE',
  value: '142',
  unit: 'Rooms',
  footnote: '78% Occupancy',
  progress: 78,
  icon: 'building' as const,
  accent: 'brand-strong' as const
},
{
  id: 'departures',
  label: 'DEPARTURES TODAY',
  value: '18',
  unit: 'Pending',
  footnote: '4 Checked out',
  icon: 'plane-takeoff' as const,
  accent: 'citrus' as const
}];