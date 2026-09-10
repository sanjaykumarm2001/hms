import { addDays, format, subDays } from 'date-fns';
import type {
  Charge,
  Guest,
  MaintenanceTicket,
  Payment,
  PropertySettings,
  Reservation,
  Room,
  RoomTypeName,
  StaffMember } from
'../types/hotel';
import { isoDate } from '../utils/format';

export interface HotelSeed {
  today: string;
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  charges: Charge[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  staff: StaffMember[];
  settings: PropertySettings;
}

const FLOOR_PLAN: {type: RoomTypeName;beds: string;occupancy: number;rate: number;view: string;}[] = [
{ type: 'Standard', beds: '1 Queen', occupancy: 2, rate: 189, view: 'Courtyard' },
{ type: 'Standard', beds: '2 Twin', occupancy: 2, rate: 189, view: 'Courtyard' },
{ type: 'Deluxe', beds: '1 King', occupancy: 2, rate: 249, view: 'City' },
{ type: 'Deluxe', beds: '1 King', occupancy: 3, rate: 249, view: 'City' },
{ type: 'Executive', beds: '1 King', occupancy: 3, rate: 319, view: 'Harbour' },
{ type: 'Executive', beds: '1 King + Sofa', occupancy: 4, rate: 319, view: 'Harbour' },
{ type: 'Suite', beds: '1 King + Living', occupancy: 4, rate: 459, view: 'Harbour' },
{ type: 'Accessible', beds: '1 Queen', occupancy: 2, rate: 199, view: 'Courtyard' }];


const GUEST_SOURCE = [
['Amara', 'Okafor', 'Gold', 'Corporate', 'Northwind Logistics', 'Nigeria'],
['Daniel', 'Brennan', 'Platinum', 'Corporate', 'Halcyon Partners', 'Ireland'],
['Sofia', 'Marchetti', 'Silver', 'Leisure', '', 'Italy'],
['Liam', 'Ferguson', 'Standard', 'OTA', '', 'Scotland'],
['Nina', 'Petrova', 'Gold', 'Leisure', '', 'Bulgaria'],
['Tomás', 'Rivera', 'Standard', 'Leisure', '', 'Mexico'],
['Hana', 'Sato', 'Platinum', 'Corporate', 'Kitsune Robotics', 'Japan'],
['Owen', 'Blackwood', 'Silver', 'Group', 'Blackwood Tours', 'Canada'],
['Priya', 'Raghavan', 'Gold', 'Corporate', 'Vellore Health', 'India'],
['Marcus', 'Lindqvist', 'Standard', 'OTA', '', 'Sweden'],
['Elena', 'Castellanos', 'Silver', 'Leisure', '', 'Spain'],
['Jonah', 'Whitfield', 'Standard', 'Group', 'Whitfield Choir', 'Australia'],
['Yara', 'Haddad', 'Gold', 'Leisure', '', 'Lebanon'],
['Peter', 'Nowak', 'Standard', 'Corporate', 'Baltic Freight', 'Poland'],
['Grace', 'Adeyemi', 'Platinum', 'Leisure', '', 'Nigeria'],
['Felix', 'Braun', 'Silver', 'OTA', '', 'Germany'],
['Mei', 'Chen', 'Gold', 'Corporate', 'Lantern Capital', 'Singapore'],
['Ruth', 'Callaghan', 'Standard', 'Leisure', '', 'Ireland'],
['Andre', 'Duval', 'Silver', 'Leisure', '', 'France'],
['Isla', 'Munro', 'Gold', 'Leisure', '', 'Scotland']] as
const;

const PREFERENCES = [
['High floor', 'Quiet room', 'Extra pillows'],
['Late checkout', 'Sparkling water'],
['Away from lift', 'Feather-free bedding'],
['Early breakfast', 'Airport transfer'],
['Twin beds', 'Non-smoking floor'],
['King bed', 'Harbour view']];


function makeRooms(): Room[] {
  const rooms: Room[] = [];
  for (let floor = 1; floor <= 5; floor += 1) {
    FLOOR_PLAN.forEach((plan, index) => {
      const number = `${floor}${String(index + 1).padStart(2, '0')}`;
      const seq = (floor - 1) * FLOOR_PLAN.length + index;
      const housekeeping =
      seq % 7 === 0 ? 'dirty' : seq % 7 === 1 ? 'cleaning' : seq % 7 === 2 ? 'clean' : 'inspected';
      rooms.push({
        id: `room-${number}`,
        number,
        floor,
        type: plan.type,
        beds: plan.beds,
        maxOccupancy: plan.occupancy,
        rate: plan.rate + (floor - 1) * 10,
        view: plan.view,
        outOfService: number === '502',
        housekeeping,
        housekeepingPriority: housekeeping === 'dirty' ? 'high' : 'normal',
        housekeeper: housekeeping === 'cleaning' ? 'Rosa Delgado' : null
      });
    });
  }
  return rooms;
}

function makeGuests(today: Date): Guest[] {
  return GUEST_SOURCE.map((row, index) => {
    const [firstName, lastName, tier, segment, company, country] = row;
    const slug = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z.]/g, '');
    return {
      id: `guest-${index + 1}`,
      firstName,
      lastName,
      email: `${slug}@example.com`,
      phone: `+1 (415) 55${String(index).padStart(2, '0')} ${100 + index * 7}`,
      country,
      company: company || undefined,
      tier: tier as Guest['tier'],
      segment: segment as Guest['segment'],
      idType: index % 3 === 0 ? 'National ID' : 'Passport',
      idNumber: `${index % 3 === 0 ? 'ID' : 'P'}${9200000 + index * 137}`,
      idVerified: index % 4 !== 0,
      preferences: PREFERENCES[index % PREFERENCES.length],
      notes:
      index % 5 === 0 ?
      [
      {
        id: `note-${index}-1`,
        date: isoDate(subDays(today, 12 + index)),
        staff: 'Alex Rivera',
        content: 'Returning guest — prefers a corner room and a late breakfast setup.'
      }] :

      [],
      documents:
      index % 4 === 0 ?
      [{ id: `doc-${index}`, name: 'Passport scan.pdf', uploadedAt: isoDate(subDays(today, 20)) }] :
      [],
      createdAt: isoDate(subDays(today, 30 + index * 9))
    };
  });
}

interface ResPlan {
  guest: number;
  room: string | null;
  type: RoomTypeName;
  arrivalOffset: number;
  nights: number;
  status: Reservation['status'];
  paymentStatus: Reservation['paymentStatus'];
  adults: number;
  children: number;
  source: Reservation['source'];
  requests: string;
}

const RES_PLANS: ResPlan[] = [
// Arrivals today — assigned
{ guest: 0, room: 'room-203', type: 'Deluxe', arrivalOffset: 0, nights: 3, status: 'confirmed', paymentStatus: 'partial', adults: 1, children: 0, source: 'Corporate', requests: 'Quiet room, high floor.' },
{ guest: 6, room: 'room-307', type: 'Suite', arrivalOffset: 0, nights: 4, status: 'confirmed', paymentStatus: 'partial', adults: 2, children: 1, source: 'Direct', requests: 'Cot for infant.' },
{ guest: 4, room: 'room-101', type: 'Standard', arrivalOffset: 0, nights: 2, status: 'confirmed', paymentStatus: 'unpaid', adults: 2, children: 0, source: 'Website', requests: '' },
// Arrivals today — unassigned
{ guest: 3, room: null, type: 'Standard', arrivalOffset: 0, nights: 1, status: 'confirmed', paymentStatus: 'unpaid', adults: 1, children: 0, source: 'Booking.com', requests: 'Late arrival, approx 23:00.' },
{ guest: 10, room: null, type: 'Deluxe', arrivalOffset: 0, nights: 5, status: 'confirmed', paymentStatus: 'unpaid', adults: 2, children: 0, source: 'Expedia', requests: 'Honeymoon — flowers if possible.' },
{ guest: 12, room: null, type: 'Executive', arrivalOffset: 0, nights: 2, status: 'tentative', paymentStatus: 'unpaid', adults: 1, children: 0, source: 'Travel Agent', requests: '' },
// In house — departing today
{ guest: 1, room: 'room-505', type: 'Executive', arrivalOffset: -3, nights: 3, status: 'in-house', paymentStatus: 'partial', adults: 1, children: 0, source: 'Corporate', requests: 'Invoice to company.' },
{ guest: 2, room: 'room-204', type: 'Deluxe', arrivalOffset: -2, nights: 2, status: 'in-house', paymentStatus: 'partial', adults: 2, children: 0, source: 'Website', requests: '' },
{ guest: 7, room: 'room-408', type: 'Accessible', arrivalOffset: -4, nights: 4, status: 'in-house', paymentStatus: 'unpaid', adults: 2, children: 2, source: 'Direct', requests: 'Group leader — 4 rooms.' },
// In house — stayovers
{ guest: 8, room: 'room-405', type: 'Executive', arrivalOffset: -1, nights: 4, status: 'in-house', paymentStatus: 'partial', adults: 1, children: 0, source: 'Corporate', requests: '' },
{ guest: 11, room: 'room-102', type: 'Standard', arrivalOffset: -2, nights: 5, status: 'in-house', paymentStatus: 'unpaid', adults: 2, children: 0, source: 'Booking.com', requests: 'Twin beds.' },
{ guest: 14, room: 'room-207', type: 'Suite', arrivalOffset: -1, nights: 6, status: 'in-house', paymentStatus: 'partial', adults: 2, children: 0, source: 'Direct', requests: 'Champagne on arrival.' },
{ guest: 16, room: 'room-303', type: 'Deluxe', arrivalOffset: -3, nights: 7, status: 'in-house', paymentStatus: 'partial', adults: 1, children: 0, source: 'Corporate', requests: 'Daily press delivery.' },
{ guest: 19, room: 'room-506', type: 'Executive', arrivalOffset: -2, nights: 3, status: 'in-house', paymentStatus: 'unpaid', adults: 2, children: 1, source: 'Website', requests: '' },
// Future
{ guest: 5, room: 'room-104', type: 'Deluxe', arrivalOffset: 1, nights: 2, status: 'confirmed', paymentStatus: 'partial', adults: 2, children: 0, source: 'Website', requests: '' },
{ guest: 9, room: null, type: 'Standard', arrivalOffset: 2, nights: 3, status: 'confirmed', paymentStatus: 'unpaid', adults: 1, children: 0, source: 'Expedia', requests: '' },
{ guest: 13, room: 'room-305', type: 'Executive', arrivalOffset: 3, nights: 2, status: 'confirmed', paymentStatus: 'unpaid', adults: 1, children: 0, source: 'Corporate', requests: 'Meeting room required.' },
{ guest: 15, room: null, type: 'Suite', arrivalOffset: 5, nights: 4, status: 'tentative', paymentStatus: 'unpaid', adults: 2, children: 2, source: 'Travel Agent', requests: 'Interconnecting if available.' },
{ guest: 17, room: null, type: 'Standard', arrivalOffset: 6, nights: 2, status: 'confirmed', paymentStatus: 'unpaid', adults: 1, children: 0, source: 'Phone', requests: '' },
// Past
{ guest: 18, room: 'room-201', type: 'Standard', arrivalOffset: -6, nights: 3, status: 'checked-out', paymentStatus: 'paid', adults: 1, children: 0, source: 'Direct', requests: '' },
{ guest: 2, room: 'room-403', type: 'Deluxe', arrivalOffset: -9, nights: 2, status: 'checked-out', paymentStatus: 'paid', adults: 2, children: 0, source: 'Website', requests: '' },
{ guest: 8, room: 'room-107', type: 'Suite', arrivalOffset: -12, nights: 4, status: 'checked-out', paymentStatus: 'partial', adults: 2, children: 1, source: 'Corporate', requests: 'City ledger settlement.' },
{ guest: 5, room: 'room-302', type: 'Standard', arrivalOffset: -15, nights: 1, status: 'checked-out', paymentStatus: 'paid', adults: 1, children: 0, source: 'Walk-In', requests: '' },
// Cancelled
{ guest: 3, room: null, type: 'Deluxe', arrivalOffset: 4, nights: 2, status: 'cancelled', paymentStatus: 'unpaid', adults: 2, children: 0, source: 'Booking.com', requests: '' },
{ guest: 11, room: null, type: 'Executive', arrivalOffset: -1, nights: 2, status: 'cancelled', paymentStatus: 'unpaid', adults: 1, children: 0, source: 'Expedia', requests: '' }];


const INCIDENTALS: {code: Charge['code'];description: string;price: number;}[] = [
{ code: 'Restaurant', description: 'Dinner — Lantern Grill', price: 86 },
{ code: 'Bar', description: 'Lobby bar tab', price: 42 },
{ code: 'Minibar', description: 'Minibar consumption', price: 24 },
{ code: 'Spa', description: 'Spa treatment — 60 min', price: 145 },
{ code: 'Laundry', description: 'Same-day laundry', price: 38 },
{ code: 'Parking', description: 'Valet parking', price: 32 }];


export function buildSeed(now: Date): HotelSeed {
  const today = isoDate(now);
  const rooms = makeRooms();
  const guests = makeGuests(now);
  const reservations: Reservation[] = [];
  const charges: Charge[] = [];
  const payments: Payment[] = [];

  RES_PLANS.forEach((plan, index) => {
    const guest = guests[plan.guest];
    const arrival = addDays(now, plan.arrivalOffset);
    const departure = addDays(arrival, plan.nights);
    const room = plan.room ? rooms.find((r) => r.id === plan.room) : undefined;
    const rate = room ? room.rate : 189 + index * 3;
    const id = `res-${index + 1}`;
    const code = `RSV-${4200 + index * 7}`;
    const createdAt = format(subDays(arrival, 14 + index), "yyyy-MM-dd'T'09:15:00");

    const history = [
    {
      id: `${id}-h1`,
      at: createdAt,
      actor: 'System',
      event: 'Reservation created',
      detail: `${plan.source} · ${plan.nights} night${plan.nights > 1 ? 's' : ''}`
    }];

    if (plan.room) {
      history.push({
        id: `${id}-h2`,
        at: format(subDays(arrival, 1), "yyyy-MM-dd'T'16:40:00"),
        actor: 'Alex Rivera',
        event: 'Room assigned',
        detail: `Room ${room?.number}`
      });
    }
    if (plan.status === 'in-house' || plan.status === 'checked-out') {
      history.push({
        id: `${id}-h3`,
        at: format(arrival, "yyyy-MM-dd'T'15:05:00"),
        actor: 'Front Desk',
        event: 'Checked in',
        detail: `Room ${room?.number} · 2 key cards`
      });
    }
    if (plan.status === 'checked-out') {
      history.push({
        id: `${id}-h4`,
        at: format(departure, "yyyy-MM-dd'T'10:20:00"),
        actor: 'Front Desk',
        event: 'Checked out',
        detail: 'Folio settled'
      });
    }
    if (plan.status === 'cancelled') {
      history.push({
        id: `${id}-h5`,
        at: format(subDays(arrival, 2), "yyyy-MM-dd'T'11:00:00"),
        actor: 'Reservations',
        event: 'Reservation cancelled',
        detail: 'Guest travel plans changed'
      });
    }

    reservations.push({
      id,
      code,
      guestId: guest.id,
      roomId: plan.room,
      roomType: plan.type,
      arrival: isoDate(arrival),
      departure: isoDate(departure),
      adults: plan.adults,
      children: plan.children,
      rate,
      source: plan.source,
      requests: plan.requests,
      status: plan.status,
      paymentStatus: plan.paymentStatus,
      accompanying: plan.adults > 1 ? ['Accompanying adult'] : [],
      keyCards: plan.status === 'in-house' || plan.status === 'checked-out' ? 2 : 0,
      cancellationReason: plan.status === 'cancelled' ? 'Guest travel plans changed' : undefined,
      createdAt,
      history
    });

    if (plan.status !== 'in-house' && plan.status !== 'checked-out') return;

    const postedNights =
    plan.status === 'checked-out' ? plan.nights : Math.max(1, -plan.arrivalOffset);

    for (let night = 0; night < postedNights; night += 1) {
      const nightDate = isoDate(addDays(arrival, night));
      charges.push({
        id: `${id}-room-${night}`,
        reservationId: id,
        code: 'Room',
        description: `Room ${room?.number ?? plan.type} — night ${night + 1}`,
        quantity: 1,
        unitPrice: rate,
        date: nightDate,
        postedBy: 'Night Audit'
      });
      charges.push({
        id: `${id}-tax-${night}`,
        reservationId: id,
        code: 'Tax',
        description: 'City & occupancy tax',
        quantity: 1,
        unitPrice: Math.round(rate * 0.12 * 100) / 100,
        date: nightDate,
        postedBy: 'Night Audit'
      });
    }

    const incidentalCount = index % 3 + 1;
    for (let i = 0; i < incidentalCount; i += 1) {
      const item = INCIDENTALS[(index + i) % INCIDENTALS.length];
      charges.push({
        id: `${id}-inc-${i}`,
        reservationId: id,
        code: item.code,
        description: item.description,
        quantity: 1,
        unitPrice: item.price,
        date: isoDate(addDays(arrival, Math.min(i, postedNights - 1))),
        postedBy: 'POS Interface'
      });
    }

    const folioTotal = charges.
    filter((c) => c.reservationId === id).
    reduce((sum, c) => sum + c.quantity * c.unitPrice, 0);

    if (plan.paymentStatus === 'paid') {
      payments.push({
        id: `${id}-pay-1`,
        reservationId: id,
        amount: Math.round(folioTotal * 100) / 100,
        method: index % 2 === 0 ? 'Visa' : 'Mastercard',
        kind: 'Payment',
        date: isoDate(departure),
        reference: `AUTH-${71000 + index * 13}`
      });
    } else if (plan.paymentStatus === 'partial') {
      payments.push({
        id: `${id}-pay-1`,
        reservationId: id,
        amount: Math.round(rate * 100) / 100,
        method: index % 2 === 0 ? 'Visa' : 'Amex',
        kind: 'Deposit',
        date: isoDate(subDays(arrival, 1)),
        reference: `DEP-${52000 + index * 11}`
      });
    }
  });

  const tickets: MaintenanceTicket[] = [
  {
    id: 'mt-1',
    code: 'WO-1041',
    roomId: 'room-304',
    title: 'Air conditioning not cooling',
    description: 'Unit runs but does not drop below 26°C. Guest moved out of the room.',
    priority: 'urgent',
    status: 'in-progress',
    blocksSale: true,
    assignee: 'Victor Alves',
    reportedBy: 'Alex Rivera',
    createdAt: isoDate(subDays(now, 1))
  },
  {
    id: 'mt-2',
    code: 'WO-1042',
    roomId: 'room-106',
    title: 'Bathroom leak under vanity',
    description: 'Slow leak, water pooling. Needs new seal.',
    priority: 'high',
    status: 'awaiting-parts',
    blocksSale: true,
    assignee: 'Victor Alves',
    reportedBy: 'Rosa Delgado',
    createdAt: isoDate(subDays(now, 3))
  },
  {
    id: 'mt-3',
    code: 'WO-1043',
    roomId: 'room-402',
    title: 'Balcony door sticking',
    description: 'Door hard to close, alignment issue.',
    priority: 'normal',
    status: 'open',
    blocksSale: false,
    assignee: null,
    reportedBy: 'Housekeeping',
    createdAt: isoDate(subDays(now, 2))
  },
  {
    id: 'mt-4',
    code: 'WO-1044',
    roomId: 'room-501',
    title: 'TV remote unresponsive',
    description: 'Replace remote and re-pair.',
    priority: 'low',
    status: 'open',
    blocksSale: false,
    assignee: null,
    reportedBy: 'Guest report',
    createdAt: isoDate(subDays(now, 4))
  },
  {
    id: 'mt-5',
    code: 'WO-1045',
    roomId: 'room-205',
    title: 'Corridor light flickering',
    description: 'Ballast replaced, monitoring.',
    priority: 'normal',
    status: 'resolved',
    blocksSale: false,
    assignee: 'Nils Berger',
    reportedBy: 'Night Audit',
    createdAt: isoDate(subDays(now, 6))
  }];


  const staff: StaffMember[] = [
  { id: 'st-1', name: 'Alex Rivera', role: 'Duty Manager', department: 'Front Office', shift: '07:00 – 15:00', status: 'On Duty', phone: '+1 415 550 0101', email: 'alex.rivera@meridian.com', workload: 62 },
  { id: 'st-2', name: 'Chloe Bennett', role: 'Front Desk Agent', department: 'Front Office', shift: '07:00 – 15:00', status: 'On Duty', phone: '+1 415 550 0102', email: 'chloe.bennett@meridian.com', workload: 78 },
  { id: 'st-3', name: 'Samuel Adeoye', role: 'Front Desk Agent', department: 'Front Office', shift: '15:00 – 23:00', status: 'Off Duty', phone: '+1 415 550 0103', email: 'samuel.adeoye@meridian.com', workload: 0 },
  { id: 'st-4', name: 'Rosa Delgado', role: 'Housekeeping Supervisor', department: 'Housekeeping', shift: '06:00 – 14:00', status: 'On Duty', phone: '+1 415 550 0104', email: 'rosa.delgado@meridian.com', workload: 84 },
  { id: 'st-5', name: 'Amina Yusuf', role: 'Room Attendant', department: 'Housekeeping', shift: '06:00 – 14:00', status: 'On Duty', phone: '+1 415 550 0105', email: 'amina.yusuf@meridian.com', workload: 71 },
  { id: 'st-6', name: 'Petra Kovač', role: 'Room Attendant', department: 'Housekeeping', shift: '08:00 – 16:00', status: 'On Break', phone: '+1 415 550 0106', email: 'petra.kovac@meridian.com', workload: 55 },
  { id: 'st-7', name: 'Victor Alves', role: 'Maintenance Technician', department: 'Maintenance', shift: '08:00 – 16:00', status: 'On Duty', phone: '+1 415 550 0107', email: 'victor.alves@meridian.com', workload: 66 },
  { id: 'st-8', name: 'Nils Berger', role: 'Maintenance Technician', department: 'Maintenance', shift: '14:00 – 22:00', status: 'Off Duty', phone: '+1 415 550 0108', email: 'nils.berger@meridian.com', workload: 20 },
  { id: 'st-9', name: 'Marta Silva', role: 'Restaurant Manager', department: 'F&B', shift: '10:00 – 18:00', status: 'On Duty', phone: '+1 415 550 0109', email: 'marta.silva@meridian.com', workload: 48 },
  { id: 'st-10', name: 'Dominic Hale', role: 'General Manager', department: 'Management', shift: '09:00 – 17:00', status: 'On Duty', phone: '+1 415 550 0110', email: 'dominic.hale@meridian.com', workload: 40 },
  { id: 'st-11', name: 'Iris Lund', role: 'Night Auditor', department: 'Front Office', shift: '23:00 – 07:00', status: 'Leave', phone: '+1 415 550 0111', email: 'iris.lund@meridian.com', workload: 0 }];


  const settings: PropertySettings = {
    propertyName: 'Meridian Harbour Hotel',
    propertyCode: 'PROP-04',
    address: '18 Quay Terrace, Harbour District',
    currency: 'USD',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    auditTime: '02:00',
    cancellationWindowHours: 48,
    cancellationFeePercent: 50,
    depositPercent: 25,
    depositRequired: true,
    confirmationEmail: true,
    preArrivalEmail: true,
    departureSurvey: false,
    roomTypes: [
    { name: 'Standard', baseRate: 189, maxOccupancy: 2, count: 10 },
    { name: 'Deluxe', baseRate: 249, maxOccupancy: 3, count: 10 },
    { name: 'Executive', baseRate: 319, maxOccupancy: 4, count: 10 },
    { name: 'Suite', baseRate: 459, maxOccupancy: 4, count: 5 },
    { name: 'Accessible', baseRate: 199, maxOccupancy: 2, count: 5 }]

  };

  return { today, rooms, guests, reservations, charges, payments, tickets, staff, settings };
}

export const HOUSEKEEPERS = ['Rosa Delgado', 'Amina Yusuf', 'Petra Kovač'];
export const TECHNICIANS = ['Victor Alves', 'Nils Berger'];