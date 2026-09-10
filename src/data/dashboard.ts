import { Movement } from '../types';

export const movements: Movement[] = [
{ id: 'm1', guest: 'Sarah Mitchell', segment: 'VIP - Corporate', room: '412', direction: 'Arrival', time: '14:00', initials: 'SM' },
{ id: 'm2', guest: 'James Davis', segment: 'Leisure', room: '205', direction: 'Departure', time: '11:00', initials: 'JD' },
{ id: 'm3', guest: 'Amanda Lee', segment: 'Expedia', room: '318', direction: 'Arrival', time: '15:30', initials: 'AL' },
{ id: 'm4', guest: 'Robert King', segment: 'Group - Wedding', room: '502', direction: 'Arrival', time: '16:00', initials: 'RK' }];


export const kpis = [
{
  id: 'occupancy',
  label: 'Occupancy',
  value: '82%',
  delta: '+4%',
  caption: '',
  progress: 82,
  featured: true
},
{
  id: 'adr',
  label: 'ADR',
  value: '$245',
  delta: '+$12',
  caption: 'Avg Daily Rate',
  featured: false
},
{
  id: 'revpar',
  label: 'RevPAR',
  value: '$201',
  delta: '+$18',
  caption: 'Revenue Per Available Room',
  featured: false
}];


export const roomStatusSummary = {
  totalRooms: 120,
  breakdown: [
  { label: 'Available', value: 45, color: '#25b84f' },
  { label: 'Occupied', value: 62, color: '#e0453c' },
  { label: 'Dirty', value: 10, color: '#f0a72a' },
  { label: 'OOO', value: 3, color: '#9ca3af' }]

};