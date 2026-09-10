import { ActivityEvent } from '../types';

export const activityEvents: ActivityEvent[] = [
{
  id: 'e1',
  location: 'Main Entrance',
  access: 'granted',
  guest: 'Eleanor Vance',
  room: 'Room 402',
  time: 'Just now',
  icon: 'door',
  camera: 'CAM-01 · Lobby North'
},
{
  id: 'e2',
  location: 'Spa & Wellness',
  access: 'info',
  guest: 'Marcus Thorne',
  room: 'Room 1105',
  time: '12m ago',
  icon: 'spa',
  camera: 'CAM-14 · Spa Corridor'
},
{
  id: 'e3',
  location: 'Lobby Bar POS',
  access: 'info',
  detail: 'Folio charge added: $42.50',
  guest: 'Sarah Jenkins',
  room: 'Room 822',
  time: '45m ago',
  icon: 'pos',
  camera: 'CAM-08 · Lobby Bar'
},
{
  id: 'e4',
  location: 'Service Elevator B',
  access: 'denied',
  detail: 'Invalid keycard swipe detected.',
  guest: 'Unregistered Card',
  room: '',
  time: '1h ago',
  icon: 'elevator',
  camera: 'CAM-22 · Service Core'
}];