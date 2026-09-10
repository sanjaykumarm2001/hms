import { Room } from '../types';

export const rooms: Room[] = [
{ number: '101', floor: 1, type: 'Standard King', status: 'occupied', guest: 'SMITH, J.', nights: 2 },
{ number: '102', floor: 1, type: 'Standard King', status: 'available', note: 'Vacant Ready' },
{ number: '103', floor: 1, type: 'Double Queen', status: 'dirty', note: 'Needs Cleaning' },
{ number: '104', floor: 1, type: 'Executive Suite', status: 'reserved', guest: 'DOE, A.', eta: 'ETA: 14:00' },
{ number: '105', floor: 1, type: 'Standard King', status: 'ooo', note: 'HVAC Repair' },
{ number: '106', floor: 1, type: 'Standard King', status: 'occupied', guest: 'GARCIA, M.', nights: 1 },
{ number: '201', floor: 2, type: 'Double Queen', status: 'available', note: 'Vacant Ready' },
{ number: '202', floor: 2, type: 'Double Queen', status: 'available', note: 'Vacant Ready' }];


export const roomLegend = [
{ code: 'VC', label: 'Vacant Clean', color: '#25b84f' },
{ code: 'VD', label: 'Vacant Dirty', color: '#f0a72a' },
{ code: 'OCC', label: 'Occupied', color: '#e0453c' },
{ code: 'RSV', label: 'Reserved', color: '#2f74e0' },
{ code: 'OOO', label: 'Out of Order', color: '#6b7280' }];