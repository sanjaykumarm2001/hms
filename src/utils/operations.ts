import type {
  Charge,
  Folio,
  FrontOfficeStatus,
  Guest,
  MaintenanceTicket,
  Payment,
  Reservation,
  Room } from
'../types';

export interface Alert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  to: string;
}

export interface Operations {
  arrivals: Reservation[];
  departures: Reservation[];
  inHouse: Reservation[];
  stayovers: Reservation[];
  statusOf: (roomId: string) => FrontOfficeStatus;
  reservationForRoom: (roomId: string) => Reservation | null;
  counts: {
    available: number;
    reserved: number;
    occupied: number;
    maintenance: number;
    outOfService: number;
    dirty: number;
    cleaning: number;
    clean: number;
    inspected: number;
  };
  vacantReady: Room[];
  occupancy: number;
  adr: number;
  revpar: number;
  revenueToday: number;
  outstanding: {reservation: Reservation;guest?: Guest;balance: number;}[];
  totalOutstanding: number;
  alerts: Alert[];
}

export const folioFor = (
reservationId: string,
charges: Charge[],
payments: Payment[])
: Folio => {
  const c = charges.filter((x) => x.reservationId === reservationId);
  const p = payments.filter((x) => x.reservationId === reservationId);
  const chargeTotal = c.reduce((sum, x) => sum + x.qty * x.unitPrice, 0);
  const paidTotal = p.reduce(
    (sum, x) => sum + (x.kind === 'refund' ? -x.amount : x.amount),
    0
  );
  return {
    charges: c,
    payments: p,
    chargeTotal,
    paidTotal,
    balance: chargeTotal - paidTotal
  };
};

export const buildOperations = (
rooms: Room[],
guests: Guest[],
reservations: Reservation[],
charges: Charge[],
payments: Payment[],
tickets: MaintenanceTicket[],
today: string)
: Operations => {
  const active = reservations.filter((r) => r.status !== 'cancelled');
  const arrivals = active.filter(
    (r) =>
    r.arrival === today && (
    r.status === 'confirmed' || r.status === 'tentative')
  );
  const inHouse = active.filter((r) => r.status === 'in_house');
  const departures = inHouse.filter((r) => r.departure <= today);
  const stayovers = inHouse.filter((r) => r.departure > today);

  const blockingTicket = (roomId: string) =>
  tickets.find(
    (t) => t.roomId === roomId && t.blocksSale && t.status !== 'resolved'
  );

  const reservationForRoom = (roomId: string): Reservation | null =>
  inHouse.find((r) => r.roomId === roomId) ??
  active.find(
    (r) =>
    r.roomId === roomId && (
    r.status === 'confirmed' || r.status === 'tentative') &&
    r.departure > today
  ) ??
  null;

  const statusOf = (roomId: string): FrontOfficeStatus => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return 'available';
    if (blockingTicket(roomId)) return 'maintenance';
    if (room.baseStatus === 'out_of_service') return 'out_of_service';
    if (inHouse.some((r) => r.roomId === roomId)) return 'occupied';
    if (
    active.some(
      (r) =>
      r.roomId === roomId && (
      r.status === 'confirmed' || r.status === 'tentative') &&
      r.departure > today
    ))

    return 'reserved';
    return 'available';
  };

  const statuses = rooms.map((r) => statusOf(r.id));
  const counts = {
    available: statuses.filter((s) => s === 'available').length,
    reserved: statuses.filter((s) => s === 'reserved').length,
    occupied: statuses.filter((s) => s === 'occupied').length,
    maintenance: statuses.filter((s) => s === 'maintenance').length,
    outOfService: statuses.filter((s) => s === 'out_of_service').length,
    dirty: rooms.filter((r) => r.housekeeping === 'dirty').length,
    cleaning: rooms.filter((r) => r.housekeeping === 'cleaning').length,
    clean: rooms.filter((r) => r.housekeeping === 'clean').length,
    inspected: rooms.filter((r) => r.housekeeping === 'inspected').length
  };

  const vacantReady = rooms.filter(
    (r) =>
    statusOf(r.id) === 'available' && (
    r.housekeeping === 'inspected' || r.housekeeping === 'clean')
  );

  const sellable = rooms.filter(
    (r) => r.baseStatus === 'in_service' && !blockingTicket(r.id)
  ).length;
  const occupancy = sellable ? Math.round(counts.occupied / sellable * 100) : 0;
  const roomRevenue = inHouse.reduce((sum, r) => sum + r.rate, 0);
  const adr = inHouse.length ? Math.round(roomRevenue / inHouse.length) : 0;
  const revpar = sellable ? Math.round(roomRevenue / sellable) : 0;
  const revenueToday = payments.
  filter((p) => p.at.slice(0, 10) === today && p.kind !== 'refund').
  reduce((sum, p) => sum + p.amount, 0);

  const outstanding = active.
  filter((r) => r.status === 'in_house' || r.status === 'checked_out').
  map((r) => ({
    reservation: r,
    guest: guests.find((g) => g.id === r.guestId),
    balance: folioFor(r.id, charges, payments).balance
  })).
  filter((row) => row.balance > 1).
  sort((a, b) => b.balance - a.balance);

  const totalOutstanding = outstanding.reduce((sum, r) => sum + r.balance, 0);

  const alerts: Alert[] = [];
  const urgentTickets = tickets.filter(
    (t) => t.priority === 'urgent' && t.status !== 'resolved'
  );
  urgentTickets.forEach((t) => {
    const room = rooms.find((r) => r.id === t.roomId);
    alerts.push({
      id: `alert-mt-${t.id}`,
      level: 'critical',
      title: `Urgent maintenance · Room ${room?.number ?? '—'}`,
      detail: t.title,
      to: '/maintenance'
    });
  });
  const overdue = outstanding.filter(
    (row) => row.reservation.status === 'checked_out'
  );
  if (overdue.length) {
    alerts.push({
      id: 'alert-overdue',
      level: 'critical',
      title: `${overdue.length} overdue folio${overdue.length > 1 ? 's' : ''}`,
      detail: 'Departed reservations still carrying a balance.',
      to: '/billing'
    });
  }
  const notReady = arrivals.filter((r) => {
    if (!r.roomId) return false;
    const room = rooms.find((x) => x.id === r.roomId);
    return room && room.housekeeping !== 'inspected' && room.housekeeping !== 'clean';
  });
  if (notReady.length) {
    alerts.push({
      id: 'alert-not-ready',
      level: 'warning',
      title: `${notReady.length} arrival room${notReady.length > 1 ? 's' : ''} not ready`,
      detail: 'Assigned rooms still need cleaning or inspection.',
      to: '/housekeeping'
    });
  }
  const unassigned = arrivals.filter((r) => !r.roomId);
  if (unassigned.length) {
    alerts.push({
      id: 'alert-unassigned',
      level: 'warning',
      title: `${unassigned.length} arrival${unassigned.length > 1 ? 's' : ''} without a room`,
      detail: 'Assign rooms before the check-in window opens.',
      to: '/front-desk'
    });
  }
  const late = inHouse.filter((r) => r.departure < today);
  if (late.length) {
    alerts.push({
      id: 'alert-late',
      level: 'info',
      title: `${late.length} late departure${late.length > 1 ? 's' : ''}`,
      detail: 'Guests past their scheduled departure date.',
      to: '/front-desk'
    });
  }

  return {
    arrivals,
    departures,
    inHouse,
    stayovers,
    statusOf,
    reservationForRoom,
    counts,
    vacantReady,
    occupancy,
    adr,
    revpar,
    revenueToday,
    outstanding,
    totalOutstanding,
    alerts
  };
};