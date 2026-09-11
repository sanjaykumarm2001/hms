import { parseISO } from 'date-fns';
import { nightsBetween } from './format';
import type {
  Charge,
  Folio,
  MaintenanceTicket,
  OperationalAlert,
  Payment,
  Reservation,
  Room,
  RoomFrontOfficeStatus } from
'../types/hotel';

export interface OperationsInput {
  today: string;
  rooms: Room[];
  reservations: Reservation[];
  charges: Charge[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
}

export interface RoomCounts {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  outOfService: number;
  occupancyRate: number;
}

export interface Operations {
  today: string;
  arrivals: Reservation[];
  unassignedArrivals: Reservation[];
  departures: Reservation[];
  inHouse: Reservation[];
  stayovers: Reservation[];
  counts: RoomCounts;
  occupancy: number;
  adr: number;
  revpar: number;
  roomRevenue: number;
  outstanding: {reservation: Reservation;balance: number;}[];
  outstandingTotal: number;
  alerts: OperationalAlert[];
  statusByRoom: Record<string, RoomFrontOfficeStatus>;
}

export interface OperationalSummary extends OperationsInput {
  counts: RoomCounts;
  arrivals: Reservation[];
  departures: Reservation[];
  inHouse: Reservation[];
  stayovers: Reservation[];
  unassigned: Reservation[];
  dirtyRooms: Room[];
  urgentTickets: MaintenanceTicket[];
  outstanding: Reservation[];
  outstandingTotal: number;
  alerts: OperationalAlert[];
  statusByRoom: Record<string, RoomFrontOfficeStatus>;
}

const ACTIVE_TICKETS: MaintenanceTicket['status'][] = ['open', 'in-progress', 'awaiting-parts'];

export function isTicketActive(ticket: MaintenanceTicket): boolean {
  return ACTIVE_TICKETS.includes(ticket.status);
}

export function folioFor(
  reservationId: string,
  charges: Charge[],
  payments: Payment[],
  reservation?: Reservation
): Folio {
  const folioCharges = charges.filter((c) => c.reservationId === reservationId);
  const folioPayments = payments.filter((p) => p.reservationId === reservationId);
  let chargeTotal = folioCharges.reduce((sum, c) => sum + c.quantity * c.unitPrice, 0);

  if (folioCharges.length === 0 && reservation) {
    const nights = Math.max(1, nightsBetween(reservation.arrival, reservation.departure));
    chargeTotal = Math.round(nights * (reservation.rate || 0) * 100) / 100;
  }

  const paidTotal = folioPayments.reduce(
    (sum, p) => sum + (p.kind === 'Refund' ? -p.amount : p.amount),
    0
  );
  return {
    charges: folioCharges,
    payments: folioPayments,
    chargeTotal,
    paidTotal,
    balance: Math.round((chargeTotal - paidTotal) * 100) / 100
  };
}

/** Room front-office status is always derived, never stored. */
export function deriveRoomStatus(
room: Room,
reservations: Reservation[],
tickets: MaintenanceTicket[],
today: string)
: RoomFrontOfficeStatus {
  const blocking = tickets.some(
    (t) => t.roomId === room.id && isTicketActive(t) && t.blocksSale
  );
  if (blocking) return 'maintenance';
  if (room.outOfService) return 'out-of-service';

  const occupied = reservations.some((r) => r.roomId === room.id && r.status === 'in-house');
  if (occupied) return 'occupied';

  const reserved = reservations.some(
    (r) =>
    r.roomId === room.id && (
    r.status === 'confirmed' || r.status === 'tentative') &&
    r.departure > today
  );
  if (reserved) return 'reserved';

  return 'available';
}

export function computeOperations(input: OperationsInput): Operations {
  const { today, rooms, reservations, charges, payments, tickets } = input;

  const statusByRoom: Record<string, RoomFrontOfficeStatus> = {};
  rooms.forEach((room) => {
    statusByRoom[room.id] = deriveRoomStatus(room, reservations, tickets, today);
  });

  const arrivals = reservations.filter(
    (r) => r.arrival === today && (r.status === 'confirmed' || r.status === 'tentative')
  );
  const unassignedArrivals = arrivals.filter((r) => !r.roomId);
  const inHouse = reservations.filter((r) => r.status === 'in-house');
  const departures = inHouse.filter((r) => r.departure === today);
  const stayovers = inHouse.filter((r) => r.departure > today);

  const counts: RoomCounts = {
    total: rooms.length,
    available: 0,
    occupied: 0,
    reserved: 0,
    maintenance: 0,
    outOfService: 0,
    dirty: 0,
    cleaning: 0,
    clean: 0,
    inspected: 0,
    ready: 0,
    sellable: 0
  };

  rooms.forEach((room) => {
    const status = statusByRoom[room.id];
    if (status === 'available') counts.available += 1;
    if (status === 'occupied') counts.occupied += 1;
    if (status === 'reserved') counts.reserved += 1;
    if (status === 'maintenance') counts.maintenance += 1;
    if (status === 'out-of-service') counts.outOfService += 1;
    if (room.housekeeping === 'dirty') counts.dirty += 1;
    if (room.housekeeping === 'cleaning') counts.cleaning += 1;
    if (room.housekeeping === 'clean') counts.clean += 1;
    if (room.housekeeping === 'inspected') counts.inspected += 1;
    if (
    status === 'available' && (
    room.housekeeping === 'clean' || room.housekeeping === 'inspected'))
    {
      counts.ready += 1;
    }
    if (status !== 'maintenance' && status !== 'out-of-service') counts.sellable += 1;
  });

  const occupancy = counts.total ? counts.occupied / counts.total * 100 : 0;
  const roomRevenue = inHouse.reduce((sum, r) => sum + r.rate, 0);
  const adr = inHouse.length ? roomRevenue / inHouse.length : 0;
  const revpar = counts.total ? roomRevenue / counts.total : 0;

  const outstanding = reservations.
  filter((r) => r.status === 'in-house' || r.status === 'checked-out').
  map((reservation) => ({
    reservation,
    balance: folioFor(reservation.id, charges, payments).balance
  })).
  filter((row) => row.balance > 0.5).
  sort((a, b) => b.balance - a.balance);

  const outstandingTotal = outstanding.reduce((sum, row) => sum + row.balance, 0);

  const alerts: OperationalAlert[] = [];

  const urgentTickets = tickets.filter((t) => t.priority === 'urgent' && isTicketActive(t));
  urgentTickets.forEach((ticket) => {
    const room = rooms.find((r) => r.id === ticket.roomId);
    alerts.push({
      id: `alert-mt-${ticket.id}`,
      level: 'critical',
      title: `Urgent maintenance · Room ${room?.number ?? '—'}`,
      detail: ticket.title,
      to: '/maintenance'
    });
  });

  const overdue = outstanding.filter((row) => row.reservation.status === 'checked-out');
  if (overdue.length) {
    alerts.push({
      id: 'alert-overdue-payments',
      level: 'critical',
      title: `${overdue.length} folio${overdue.length > 1 ? 's' : ''} overdue`,
      detail: `Departed guests still carrying balances.`,
      to: '/billing'
    });
  }

  const notReady = arrivals.filter((r) => {
    if (!r.roomId) return false;
    const room = rooms.find((x) => x.id === r.roomId);
    return room ? room.housekeeping !== 'clean' && room.housekeeping !== 'inspected' : false;
  });
  if (notReady.length) {
    alerts.push({
      id: 'alert-rooms-not-ready',
      level: 'warning',
      title: `${notReady.length} arrival room${notReady.length > 1 ? 's' : ''} not ready`,
      detail: 'Assigned rooms still need cleaning or inspection.',
      to: '/housekeeping'
    });
  }

  if (unassignedArrivals.length) {
    alerts.push({
      id: 'alert-unassigned-arrivals',
      level: 'warning',
      title: `${unassignedArrivals.length} arrival${unassignedArrivals.length > 1 ? 's' : ''} without a room`,
      detail: 'Assign rooms before the desk gets busy.',
      to: '/front-desk'
    });
  }

  const lateDepartures = departures.filter(() => new Date().getHours() >= 12);
  if (lateDepartures.length) {
    alerts.push({
      id: 'alert-late-departures',
      level: 'info',
      title: `${lateDepartures.length} departure${lateDepartures.length > 1 ? 's' : ''} past checkout time`,
      detail: 'Follow up with in-house guests due to depart.',
      to: '/front-desk'
    });
  }

  return {
    today,
    arrivals,
    unassignedArrivals,
    departures,
    inHouse,
    stayovers,
    counts,
    occupancy,
    adr,
    revpar,
    roomRevenue,
    outstanding,
    outstandingTotal,
    alerts,
    statusByRoom
  };
}

export function dayIndex(iso: string): number {
  return Math.floor(parseISO(iso).getTime() / 86400000);
}