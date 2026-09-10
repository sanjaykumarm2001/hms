import { Attendant, HousekeepingTask } from '../types';

export const housekeepingTasks: HousekeepingTask[] = [
{ room: '402', floor: 4, type: 'Deluxe King', state: 'dirty', attendant: 'Maria G.', minutes: 0, priority: 'high' },
{ room: '204', floor: 2, type: 'Standard Queen', state: 'cleaning', attendant: 'Maria G.', minutes: 12, priority: 'high' },
{ room: '103', floor: 1, type: 'Double Queen', state: 'dirty', attendant: 'David P.', minutes: 0, priority: 'normal' },
{ room: '318', floor: 3, type: 'Standard King', state: 'clean', attendant: 'David P.', minutes: 26, priority: 'normal' },
{ room: '812', floor: 8, type: 'Executive Suite', state: 'inspected', attendant: 'Maria G.', minutes: 31, priority: 'normal' },
{ room: '105', floor: 1, type: 'Standard King', state: 'maintenance', attendant: 'Engineering', minutes: 0, priority: 'low' },
{ room: '501', floor: 5, type: 'Deluxe Twin', state: 'cleaning', attendant: 'David P.', minutes: 8, priority: 'normal' },
{ room: '620', floor: 6, type: 'Standard King', state: 'clean', attendant: 'Maria G.', minutes: 22, priority: 'low' }];


export const attendants: Attendant[] = [
{ name: 'Maria G.', zone: 'Floor 2 & 3', done: 14, total: 15 },
{ name: 'David P.', zone: 'Floor 4 & 5', done: 18, total: 27 }];