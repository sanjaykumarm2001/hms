import { addDays, format, subHours, subMinutes } from 'date-fns';
import type {
  ActivityEvent,
  Charge,
  Guest,
  MaintenanceTicket,
  Payment,
  Reservation,
  Room,
  StaffMember } from
'../types';

/** Dates are seeded relative to the current operating day. */
const d = (offset: number): string => format(addDays(new Date(), offset), 'yyyy-MM-dd');
const hoursAgo = (h: number): string => subHours(new Date(), h).toISOString();
const minsAgo = (m: number): string => subMinutes(new Date(), m).toISOString();

export const seedRooms: Room[] = [
{ id: 'rm-201', number: '201', floor: 2, type: 'standard_queen', beds: '1 Queen', maxOccupancy: 2, rate: 260, view: 'City', baseStatus: 'in_service', housekeeping: 'inspected', hkPriority: 'low', housekeeper: null },
{ id: 'rm-202', number: '202', floor: 2, type: 'standard_queen', beds: '1 Queen', maxOccupancy: 2, rate: 260, view: 'City', baseStatus: 'in_service', housekeeping: 'dirty', hkPriority: 'normal', housekeeper: null },
{ id: 'rm-203', number: '203', floor: 2, type: 'standard_queen', beds: '1 Queen', maxOccupancy: 2, rate: 260, view: 'Courtyard', baseStatus: 'in_service', housekeeping: 'clean', hkPriority: 'low', housekeeper: 'Rosa Mendes' },
{ id: 'rm-204', number: '204', floor: 2, type: 'standard_queen', beds: '1 Queen', maxOccupancy: 2, rate: 260, view: 'Harbor', baseStatus: 'in_service', housekeeping: 'clean', hkPriority: 'normal', housekeeper: 'Rosa Mendes' },
{ id: 'rm-205', number: '205', floor: 2, type: 'standard_queen', beds: '1 Queen', maxOccupancy: 2, rate: 260, view: 'City', baseStatus: 'in_service', housekeeping: 'dirty', hkPriority: 'high', housekeeper: null },
{ id: 'rm-401', number: '401', floor: 4, type: 'deluxe_king', beds: '1 King', maxOccupancy: 3, rate: 284, view: 'Harbor', baseStatus: 'in_service', housekeeping: 'inspected', hkPriority: 'low', housekeeper: null },
{ id: 'rm-402', number: '402', floor: 4, type: 'deluxe_king', beds: '1 King', maxOccupancy: 3, rate: 284, view: 'Harbor', baseStatus: 'in_service', housekeeping: 'inspected', hkPriority: 'low', housekeeper: null },
{ id: 'rm-403', number: '403', floor: 4, type: 'deluxe_king', beds: '1 King', maxOccupancy: 3, rate: 284, view: 'City', baseStatus: 'in_service', housekeeping: 'cleaning', hkPriority: 'high', housekeeper: 'Ana Duarte' },
{ id: 'rm-404', number: '404', floor: 4, type: 'deluxe_king', beds: '1 King', maxOccupancy: 3, rate: 284, view: 'Courtyard', baseStatus: 'in_service', housekeeping: 'clean', hkPriority: 'normal', housekeeper: 'Ana Duarte' },
{ id: 'rm-405', number: '405', floor: 4, type: 'deluxe_king', beds: '1 King', maxOccupancy: 3, rate: 284, view: 'Harbor', baseStatus: 'out_of_service', housekeeping: 'dirty', hkPriority: 'low', housekeeper: null },
{ id: 'rm-801', number: '801', floor: 8, type: 'executive_suite', beds: '1 King + Sofa', maxOccupancy: 4, rate: 420, view: 'Harbor', baseStatus: 'in_service', housekeeping: 'inspected', hkPriority: 'low', housekeeper: null },
{ id: 'rm-802', number: '802', floor: 8, type: 'executive_suite', beds: '1 King + Sofa', maxOccupancy: 4, rate: 420, view: 'Harbor', baseStatus: 'in_service', housekeeping: 'clean', hkPriority: 'normal', housekeeper: 'Ana Duarte' },
{ id: 'rm-803', number: '803', floor: 8, type: 'executive_suite', beds: '1 King + Sofa', maxOccupancy: 4, rate: 420, view: 'City', baseStatus: 'in_service', housekeeping: 'dirty', hkPriority: 'normal', housekeeper: null },
{ id: 'rm-804', number: '804', floor: 8, type: 'executive_suite', beds: '1 King + Sofa', maxOccupancy: 4, rate: 420, view: 'City', baseStatus: 'in_service', housekeeping: 'inspected', hkPriority: 'low', housekeeper: null },
{ id: 'rm-805', number: '805', floor: 8, type: 'executive_suite', beds: '1 King + Sofa', maxOccupancy: 4, rate: 420, view: 'Harbor', baseStatus: 'in_service', housekeeping: 'clean', hkPriority: 'low', housekeeper: 'Rosa Mendes' },
{ id: 'rm-812', number: '812', floor: 8, type: 'executive_suite', beds: '1 King + Sofa', maxOccupancy: 4, rate: 420, view: 'Harbor', baseStatus: 'in_service', housekeeping: 'clean', hkPriority: 'normal', housekeeper: null },
{ id: 'rm-1101', number: '1101', floor: 11, type: 'penthouse', beds: '2 King', maxOccupancy: 5, rate: 780, view: 'Panoramic', baseStatus: 'in_service', housekeeping: 'inspected', hkPriority: 'low', housekeeper: null },
{ id: 'rm-1102', number: '1102', floor: 11, type: 'penthouse', beds: '2 King', maxOccupancy: 5, rate: 780, view: 'Panoramic', baseStatus: 'in_service', housekeeping: 'dirty', hkPriority: 'high', housekeeper: 'Ivan Petrov' },
{ id: 'rm-1103', number: '1103', floor: 11, type: 'penthouse', beds: '2 King', maxOccupancy: 5, rate: 780, view: 'Harbor', baseStatus: 'in_service', housekeeping: 'inspected', hkPriority: 'low', housekeeper: null },
{ id: 'rm-1105', number: '1105', floor: 11, type: 'penthouse', beds: '2 King', maxOccupancy: 5, rate: 780, view: 'Panoramic', baseStatus: 'in_service', housekeeping: 'clean', hkPriority: 'normal', housekeeper: null }];


export const seedGuests: Guest[] = [
{ id: 'g-1', firstName: 'Eleanor', lastName: 'Vance', email: 'e.vance@example.com', phone: '+1 (555) 019-8233', country: 'United States', tier: 'vip', segment: 'leisure', idType: 'Passport', idNumber: null, preferences: ['High floor', 'Harbor view', 'Feather-free bedding'], notes: [{ id: 'gn-1', at: hoursAgo(30), by: 'Alex Rivera', text: 'Anniversary stay — arrange champagne on arrival.' }], stays: 12 },
{ id: 'g-2', firstName: 'Marcus', lastName: 'Chen', email: 'm.chen@northbridge.co', phone: '+1 (555) 402-7781', country: 'Singapore', tier: 'gold', segment: 'corporate', idType: 'Passport', idNumber: 'K8823117', preferences: ['Late check-out', 'Quiet room'], notes: [], stays: 27 },
{ id: 'g-3', firstName: 'Sophia', lastName: 'Rossi', email: 's.rossi@example.it', phone: '+39 340 118 2290', country: 'Italy', tier: 'silver', segment: 'leisure', idType: 'National ID', idNumber: 'IT9920881', preferences: ['Extra pillows'], notes: [], stays: 4 },
{ id: 'g-4', firstName: 'Marcus', lastName: 'Thorne', email: 'm.thorne@thornecap.com', phone: '+1 (555) 771-0044', country: 'United States', tier: 'vip', segment: 'corporate', idType: "Driver's License", idNumber: 'D4471902', preferences: ['Penthouse', 'Daily press'], notes: [{ id: 'gn-2', at: hoursAgo(70), by: 'Nadia Fischer', text: 'Prefers no housekeeping entry before 11:00.' }], stays: 41 },
{ id: 'g-5', firstName: 'Sarah', lastName: 'Jenkins', email: 's.jenkins@example.com', phone: '+44 7700 118822', country: 'United Kingdom', tier: 'standard', segment: 'ota', idType: 'Passport', idNumber: 'GB7712004', preferences: [], notes: [], stays: 1 },
{ id: 'g-6', firstName: 'David', lastName: 'Okafor', email: 'd.okafor@example.com', phone: '+234 802 119 8877', country: 'Nigeria', tier: 'gold', segment: 'corporate', idType: 'Passport', idNumber: 'A0091882', preferences: ['Airport transfer'], notes: [], stays: 9 },
{ id: 'g-7', firstName: 'Priya', lastName: 'Nair', email: 'p.nair@example.in', phone: '+91 98200 41188', country: 'India', tier: 'standard', segment: 'leisure', idType: null, idNumber: null, preferences: ['Vegetarian breakfast'], notes: [], stays: 2 },
{ id: 'g-8', firstName: 'Liam', lastName: "O'Connor", email: 'l.oconnor@example.ie', phone: '+353 87 220 1188', country: 'Ireland', tier: 'silver', segment: 'group', idType: 'Passport', idNumber: 'IE2201884', preferences: [], notes: [], stays: 6 },
{ id: 'g-9', firstName: 'Yuki', lastName: 'Tanaka', email: 'y.tanaka@example.jp', phone: '+81 90 1188 2044', country: 'Japan', tier: 'gold', segment: 'leisure', idType: 'Passport', idNumber: 'JP8811902', preferences: ['Non-smoking floor'], notes: [], stays: 15 },
{ id: 'g-10', firstName: 'Hannah', lastName: 'Weber', email: 'h.weber@example.de', phone: '+49 171 220 8811', country: 'Germany', tier: 'standard', segment: 'corporate', idType: 'National ID', idNumber: 'DE4410028', preferences: [], notes: [], stays: 3 }];


export const seedReservations: Reservation[] = [
{ id: 'res-1', confirmation: 'BKG-8892A', guestId: 'g-1', roomId: 'rm-402', roomType: 'deluxe_king', arrival: d(0), departure: d(3), adults: 2, children: 0, rate: 280, source: 'Direct', status: 'confirmed', paymentStatus: 'prepaid', requests: 'Champagne on arrival, high floor.', keyCards: 2, accompanying: [], history: [{ id: 'h-1', at: hoursAgo(72), by: 'System', text: 'Reservation created via Direct booking.' }] },
{ id: 'res-2', confirmation: 'BKG-7741C', guestId: 'g-2', roomId: 'rm-812', roomType: 'executive_suite', arrival: d(-2), departure: d(2), adults: 1, children: 0, rate: 420, source: 'Booking.com', status: 'in_house', paymentStatus: 'partial', requests: 'Corporate rate, late check-out requested.', keyCards: 1, accompanying: [], history: [{ id: 'h-2', at: hoursAgo(50), by: 'Nadia Fischer', text: 'Checked in to room 812.' }] },
{ id: 'res-3', confirmation: 'BKG-9921D', guestId: 'g-3', roomId: 'rm-204', roomType: 'standard_queen', arrival: d(-5), departure: d(0), adults: 2, children: 1, rate: 260, source: 'Agoda', status: 'in_house', paymentStatus: 'paid', requests: 'Cot for infant.', keyCards: 2, accompanying: ['Luca Rossi'], history: [{ id: 'h-3', at: hoursAgo(120), by: 'Tom Alvarez', text: 'Checked in to room 204.' }] },
{ id: 'res-4', confirmation: 'BKG-4410F', guestId: 'g-7', roomId: null, roomType: 'standard_queen', arrival: d(0), departure: d(2), adults: 1, children: 0, rate: 255, source: 'Expedia', status: 'confirmed', paymentStatus: 'unpaid', requests: 'Vegetarian breakfast.', keyCards: 1, accompanying: [], history: [{ id: 'h-4', at: hoursAgo(20), by: 'System', text: 'Reservation created via Expedia.' }] },
{ id: 'res-5', confirmation: 'BKG-1188P', guestId: 'g-4', roomId: 'rm-1105', roomType: 'penthouse', arrival: d(-1), departure: d(4), adults: 2, children: 0, rate: 780, source: 'Corporate', status: 'in_house', paymentStatus: 'partial', requests: 'No housekeeping before 11:00.', keyCards: 2, accompanying: ['Claire Thorne'], history: [{ id: 'h-5', at: hoursAgo(26), by: 'Alex Rivera', text: 'Checked in to room 1105.' }] },
{ id: 'res-6', confirmation: 'BKG-3320S', guestId: 'g-5', roomId: 'rm-802', roomType: 'executive_suite', arrival: d(-3), departure: d(1), adults: 2, children: 0, rate: 405, source: 'Booking.com', status: 'in_house', paymentStatus: 'unpaid', requests: '', keyCards: 2, accompanying: [], history: [{ id: 'h-6', at: hoursAgo(74), by: 'Tom Alvarez', text: 'Checked in to room 802.' }] },
{ id: 'res-7', confirmation: 'BKG-5590K', guestId: 'g-6', roomId: 'rm-205', roomType: 'standard_queen', arrival: d(0), departure: d(1), adults: 1, children: 0, rate: 265, source: 'Corporate', status: 'confirmed', paymentStatus: 'unpaid', requests: 'Airport transfer at 16:00.', keyCards: 1, accompanying: [], history: [{ id: 'h-7', at: hoursAgo(40), by: 'System', text: 'Reservation created via Corporate portal.' }] },
{ id: 'res-8', confirmation: 'BKG-7781T', guestId: 'g-8', roomId: 'rm-203', roomType: 'standard_queen', arrival: d(2), departure: d(5), adults: 2, children: 0, rate: 260, source: 'Travel Agent', status: 'tentative', paymentStatus: 'unpaid', requests: 'Group of four, adjoining rooms if possible.', keyCards: 2, accompanying: [], history: [{ id: 'h-8', at: hoursAgo(12), by: 'System', text: 'Tentative hold created.' }] },
{ id: 'res-9', confirmation: 'BKG-2204Y', guestId: 'g-9', roomId: 'rm-401', roomType: 'deluxe_king', arrival: d(1), departure: d(4), adults: 2, children: 0, rate: 290, source: 'Direct', status: 'confirmed', paymentStatus: 'prepaid', requests: 'Non-smoking floor.', keyCards: 2, accompanying: [], history: [{ id: 'h-9', at: hoursAgo(96), by: 'System', text: 'Reservation created via Direct booking.' }] },
{ id: 'res-10', confirmation: 'BKG-9080W', guestId: 'g-10', roomId: 'rm-803', roomType: 'executive_suite', arrival: d(-8), departure: d(-5), adults: 1, children: 0, rate: 410, source: 'Direct', status: 'checked_out', paymentStatus: 'paid', requests: '', keyCards: 1, accompanying: [], history: [{ id: 'h-10', at: hoursAgo(120), by: 'Tom Alvarez', text: 'Checked out. Folio settled.' }] },
{ id: 'res-11', confirmation: 'BKG-6612R', guestId: 'g-3', roomId: null, roomType: 'deluxe_king', arrival: d(6), departure: d(8), adults: 2, children: 0, rate: 284, source: 'Direct', status: 'cancelled', paymentStatus: 'unpaid', requests: '', keyCards: 0, accompanying: [], history: [{ id: 'h-11', at: hoursAgo(8), by: 'Alex Rivera', text: 'Cancelled — guest changed travel plans.' }] }];


export const seedCharges: Charge[] = [
{ id: 'ch-1', reservationId: 'res-2', code: 'room', description: 'Room & Tax — 2 nights', qty: 2, unitPrice: 420, postedAt: hoursAgo(48), by: 'System' },
{ id: 'ch-2', reservationId: 'res-2', code: 'bar', description: 'Lobby Bar', qty: 1, unitPrice: 149.5, postedAt: hoursAgo(6), by: 'F&B POS' },
{ id: 'ch-3', reservationId: 'res-3', code: 'room', description: 'Room & Tax — 5 nights', qty: 5, unitPrice: 260, postedAt: hoursAgo(118), by: 'System' },
{ id: 'ch-4', reservationId: 'res-3', code: 'restaurant', description: 'Restaurant — dinner', qty: 2, unitPrice: 68, postedAt: hoursAgo(28), by: 'F&B POS' },
{ id: 'ch-5', reservationId: 'res-5', code: 'room', description: 'Room & Tax — 1 night', qty: 1, unitPrice: 780, postedAt: hoursAgo(24), by: 'System' },
{ id: 'ch-6', reservationId: 'res-5', code: 'spa', description: 'Spa & Wellness', qty: 2, unitPrice: 150, postedAt: hoursAgo(3), by: 'Spa Desk' },
{ id: 'ch-7', reservationId: 'res-6', code: 'room', description: 'Room & Tax — 3 nights', qty: 3, unitPrice: 405, postedAt: hoursAgo(70), by: 'System' },
{ id: 'ch-8', reservationId: 'res-6', code: 'minibar', description: 'Minibar', qty: 3, unitPrice: 24, postedAt: hoursAgo(10), by: 'Housekeeping' },
{ id: 'ch-9', reservationId: 'res-10', code: 'room', description: 'Room & Tax — 3 nights', qty: 3, unitPrice: 410, postedAt: hoursAgo(190), by: 'System' }];


export const seedPayments: Payment[] = [
{ id: 'pm-1', reservationId: 'res-1', amount: 840, method: 'visa', kind: 'deposit', at: hoursAgo(70), by: 'System' },
{ id: 'pm-2', reservationId: 'res-2', amount: 840, method: 'mastercard', kind: 'deposit', at: hoursAgo(49), by: 'Nadia Fischer' },
{ id: 'pm-3', reservationId: 'res-3', amount: 1436, method: 'visa', kind: 'payment', at: hoursAgo(26), by: 'Tom Alvarez' },
{ id: 'pm-4', reservationId: 'res-5', amount: 500, method: 'amex', kind: 'deposit', at: hoursAgo(25), by: 'Alex Rivera' },
{ id: 'pm-5', reservationId: 'res-9', amount: 870, method: 'visa', kind: 'deposit', at: hoursAgo(94), by: 'System' },
{ id: 'pm-6', reservationId: 'res-10', amount: 1230, method: 'bank_transfer', kind: 'payment', at: hoursAgo(120), by: 'Tom Alvarez' }];


export const seedTickets: MaintenanceTicket[] = [
{ id: 'mt-1', roomId: 'rm-405', title: 'Bathroom leak under vanity', detail: 'Water pooling, room removed from sale until plumbing is repaired.', priority: 'urgent', status: 'in_progress', blocksSale: true, assignee: 'Ivan Petrov', createdAt: hoursAgo(20) },
{ id: 'mt-2', roomId: 'rm-1102', title: 'Balcony door alignment', detail: 'Door sticks and does not seal fully.', priority: 'high', status: 'awaiting_parts', blocksSale: false, assignee: 'Ivan Petrov', createdAt: hoursAgo(46) },
{ id: 'mt-3', roomId: 'rm-203', title: 'TV remote unresponsive', detail: 'Replace remote and pair with in-room system.', priority: 'low', status: 'open', blocksSale: false, assignee: null, createdAt: hoursAgo(8) },
{ id: 'mt-4', roomId: 'rm-802', title: 'AC unit noisy at night', detail: 'Guest reported rattling from vent.', priority: 'normal', status: 'open', blocksSale: false, assignee: null, createdAt: hoursAgo(4) },
{ id: 'mt-5', roomId: 'rm-801', title: 'Replace bedside lamp shade', detail: 'Cosmetic damage noted at inspection.', priority: 'low', status: 'resolved', blocksSale: false, assignee: 'Ivan Petrov', createdAt: hoursAgo(90) }];


export const seedStaff: StaffMember[] = [
{ id: 'st-1', name: 'Alex Rivera', role: 'Duty Manager', department: 'management', shift: '07:00 – 15:00', onDuty: true, phone: 'Ext. 100', workload: 4 },
{ id: 'st-2', name: 'Nadia Fischer', role: 'Front Desk Agent', department: 'front_office', shift: '07:00 – 15:00', onDuty: true, phone: 'Ext. 101', workload: 7 },
{ id: 'st-3', name: 'Tom Alvarez', role: 'Front Desk Agent', department: 'front_office', shift: '15:00 – 23:00', onDuty: false, phone: 'Ext. 102', workload: 3 },
{ id: 'st-4', name: 'Rosa Mendes', role: 'Room Attendant', department: 'housekeeping', shift: '08:00 – 16:00', onDuty: true, phone: 'Ext. 210', workload: 9 },
{ id: 'st-5', name: 'Ana Duarte', role: 'Room Attendant', department: 'housekeeping', shift: '08:00 – 16:00', onDuty: true, phone: 'Ext. 211', workload: 8 },
{ id: 'st-6', name: 'Grace Lim', role: 'Housekeeping Supervisor', department: 'housekeeping', shift: '08:00 – 16:00', onDuty: true, phone: 'Ext. 212', workload: 5 },
{ id: 'st-7', name: 'Ivan Petrov', role: 'Maintenance Technician', department: 'maintenance', shift: '06:00 – 14:00', onDuty: true, phone: 'Ext. 310', workload: 6 },
{ id: 'st-8', name: 'Ben Okoro', role: 'F&B Supervisor', department: 'fnb', shift: '11:00 – 19:00', onDuty: true, phone: 'Ext. 410', workload: 4 }];


export const seedActivity: ActivityEvent[] = [
{ id: 'ac-1', kind: 'door', title: 'Main Entrance', location: 'Lobby · Door 1', guestId: 'g-1', roomNumber: '402', result: 'granted', detail: 'Keycard swipe accepted. Encoder session 8821.', at: minsAgo(1) },
{ id: 'ac-2', kind: 'amenity', title: 'Spa & Wellness', location: 'Level 3 · Spa', guestId: 'g-4', roomNumber: '1105', result: 'granted', detail: 'Access granted for treatment booking 44-B.', at: minsAgo(12) },
{ id: 'ac-3', kind: 'pos', title: 'Lobby Bar POS', location: 'Lobby · Bar', guestId: 'g-5', roomNumber: '802', result: 'info', detail: 'Folio charge added: $42.50 — signed by guest.', at: minsAgo(45) },
{ id: 'ac-4', kind: 'security', title: 'Service Elevator B', location: 'Back of house', guestId: null, roomNumber: null, result: 'denied', detail: 'Invalid keycard swipe detected. Unregistered card.', at: minsAgo(60) },
{ id: 'ac-5', kind: 'door', title: 'Room 812', location: 'Floor 8', guestId: 'g-2', roomNumber: '812', result: 'granted', detail: 'Room door opened with primary keycard.', at: minsAgo(95) },
{ id: 'ac-6', kind: 'amenity', title: 'Fitness Centre', location: 'Level 2 · Gym', guestId: 'g-3', roomNumber: '204', result: 'granted', detail: 'Access granted 06:41.', at: minsAgo(150) },
{ id: 'ac-7', kind: 'pos', title: 'Harbor Restaurant', location: 'Level 1', guestId: 'g-3', roomNumber: '204', result: 'info', detail: 'Folio charge added: $136.00 — dinner for two.', at: minsAgo(210) },
{ id: 'ac-8', kind: 'security', title: 'Room 405', location: 'Floor 4', guestId: null, roomNumber: '405', result: 'denied', detail: 'Out-of-service room access attempt blocked.', at: minsAgo(280) }];