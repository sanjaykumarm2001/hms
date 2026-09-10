import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { buildSeed } from '../data/seed';
import type {
  Charge,
  ChargeCode,
  Folio,
  Guest,
  GuestSegment,
  GuestTier,
  HousekeepingPriority,
  HousekeepingStatus,
  MaintenanceTicket,
  Payment,
  PaymentKind,
  PaymentMethod,
  PropertySettings,
  Reservation,
  Room,
  RoomFrontOfficeStatus,
  RoomTypeName,
  StaffMember,
  BookingSource } from
'../types/hotel';
import { computeOperations, folioFor, type Operations } from '../utils/operations';
import { isoDate, nightsBetween } from '../utils/format';

export interface NewGuestInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  company?: string;
  tier?: GuestTier;
  segment?: GuestSegment;
  idType?: string;
  idNumber?: string;
}

export interface NewReservationInput {
  guestId: string;
  roomType: RoomTypeName;
  roomId: string | null;
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  rate: number;
  source: BookingSource;
  requests: string;
}

export interface CheckInInput {
  roomId: string;
  accompanying: string[];
  keyCards: number;
  depositAmount: number;
  method: PaymentMethod;
  idVerified: boolean;
  registrationSigned: boolean;
}

export interface NewTicketInput {
  roomId: string;
  category: 'HVAC' | 'Plumbing' | 'Electrical' | 'Carpentry' | 'Appliance' | 'Other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  description: string;
}

export interface NewStaffInput {
  name: string;
  role: string;
  shift: string;
  email: string;
  phone: string;
}

interface HotelContextValue {
  today: string;
  currentUser: StaffMember;
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  charges: Charge[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  staff: StaffMember[];
  settings: PropertySettings;
  ops: Operations;
  getRoom: (id: string | null) => Room | undefined;
  getGuest: (id: string) => Guest | undefined;
  getReservation: (id: string) => Reservation | undefined;
  guestName: (id: string) => string;
  folio: (reservationId: string) => Folio;
  roomStatus: (roomId: string) => RoomFrontOfficeStatus;
  createGuest: (input: NewGuestInput) => Guest;
  updateGuest: (id: string, patch: Partial<Guest>) => void;
  createReservation: (input: NewReservationInput) => Reservation;
  createWalkIn: (input: NewReservationInput) => Reservation;
  assignRoom: (reservationId: string, roomId: string) => void;
  checkIn: (reservationId: string, input: CheckInInput) => void;
  checkOut: (reservationId: string, input: {amount: number;method: PaymentMethod;}) => void;
  changeRoom: (reservationId: string, roomId: string, reason: string) => void;
  extendStay: (reservationId: string, departure: string) => void;
  cancelReservation: (reservationId: string, reason: string) => void;
  addCharge: (input: {
    reservationId: string;
    code: ChargeCode;
    description: string;
    quantity: number;
    unitPrice: number;
  }) => void;
  addPayment: (input: {
    reservationId: string;
    amount: number;
    method: PaymentMethod;
    kind: PaymentKind;
  }) => void;
  setHousekeeping: (roomId: string, status: HousekeepingStatus) => void;
  assignHousekeeper: (roomId: string, housekeeper: string) => void;
  setHousekeepingPriority: (roomId: string, priority: HousekeepingPriority) => void;
  updateTicket: (ticketId: string, patch: Partial<MaintenanceTicket>) => void;
  addTicket: (input: NewTicketInput) => MaintenanceTicket;
  addStaffMember: (input: NewStaffInput) => StaffMember;
  addGuestNote: (guestId: string, content: string) => void;
  updateSettings: (patch: Partial<PropertySettings>) => void;
}

const HotelContext = createContext<HotelContextValue | null>(null);

export function HotelProvider({ children }: {children: React.ReactNode;}) {
  const seed = useMemo(() => buildSeed(new Date()), []);
  const [rooms, setRooms] = useState<Room[]>(seed.rooms);
  const [guests, setGuests] = useState<Guest[]>(seed.guests);
  const [reservations, setReservations] = useState<Reservation[]>(seed.reservations);
  const [charges, setCharges] = useState<Charge[]>(seed.charges);
  const [payments, setPayments] = useState<Payment[]>(seed.payments);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(seed.tickets);
  const [staff, setStaff] = useState<StaffMember[]>(seed.staff);
  const [settings, setSettings] = useState<PropertySettings>(seed.settings);
  const counter = useRef(1000);

  const today = seed.today;
  const currentUser = staff[0];

  const nextId = useCallback((prefix: string) => {
    counter.current += 1;
    return `${prefix}-${counter.current}`;
  }, []);

  const stamp = useCallback(() => format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"), []);

  const ops = useMemo(
    () => computeOperations({ today, rooms, reservations, charges, payments, tickets }),
    [today, rooms, reservations, charges, payments, tickets]
  );

  const getRoom = useCallback(
    (id: string | null) => id ? rooms.find((r) => r.id === id) : undefined,
    [rooms]
  );
  const getGuest = useCallback((id: string) => guests.find((g) => g.id === id), [guests]);
  const getReservation = useCallback(
    (id: string) => reservations.find((r) => r.id === id),
    [reservations]
  );
  const guestName = useCallback(
    (id: string) => {
      const guest = guests.find((g) => g.id === id);
      return guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown guest';
    },
    [guests]
  );
  const folio = useCallback(
    (reservationId: string) => folioFor(reservationId, charges, payments),
    [charges, payments]
  );
  const roomStatus = useCallback(
    (roomId: string) => ops.statusByRoom[roomId] ?? 'available',
    [ops]
  );

  const pushHistory = useCallback(
    (reservationId: string, event: string, detail?: string) => {
      setReservations((prev) =>
      prev.map((r) =>
      r.id === reservationId ?
      {
        ...r,
        history: [
        ...r.history,
        { id: `${r.id}-h-${counter.current++}`, at: stamp(), actor: currentUser.name, event, detail }]

      } :
      r
      )
      );
    },
    [currentUser.name, stamp]
  );

  const syncPaymentStatus = useCallback(
    (reservationId: string, nextCharges: Charge[], nextPayments: Payment[]) => {
      const f = folioFor(reservationId, nextCharges, nextPayments);
      const status = f.balance <= 0.5 ? 'paid' : f.paidTotal > 0 ? 'partial' : 'unpaid';
      setReservations((prev) =>
      prev.map((r) => r.id === reservationId ? { ...r, paymentStatus: status } : r)
      );
    },
    []
  );

  const createGuest = useCallback(
    (input: NewGuestInput) => {
      const guest: Guest = {
        id: nextId('guest'),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        country: input.country.trim() || '—',
        company: input.company?.trim() || undefined,
        tier: input.tier ?? 'Standard',
        segment: input.segment ?? 'Leisure',
        idType: input.idType ?? 'Passport',
        idNumber: input.idNumber ?? '',
        idVerified: Boolean(input.idNumber),
        preferences: [],
        notes: [],
        documents: [],
        createdAt: today
      };
      setGuests((prev) => [guest, ...prev]);
      toast.success('Guest profile created', {
        description: `${guest.firstName} ${guest.lastName} added to the guest database.`
      });
      return guest;
    },
    [nextId, today]
  );

  const updateGuest = useCallback((id: string, patch: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }, []);

  const buildReservation = useCallback(
    (input: NewReservationInput, walkIn: boolean): Reservation => {
      const id = nextId('res');
      const history = [
      {
        id: `${id}-h1`,
        at: stamp(),
        actor: currentUser.name,
        event: walkIn ? 'Walk-in created' : 'Reservation created',
        detail: `${input.source} · ${nightsBetween(input.arrival, input.departure)} night(s)`
      }];

      if (input.roomId) {
        history.push({
          id: `${id}-h2`,
          at: stamp(),
          actor: currentUser.name,
          event: 'Room assigned',
          detail: `Room ${rooms.find((r) => r.id === input.roomId)?.number ?? ''}`
        });
      }
      if (walkIn) {
        history.push({
          id: `${id}-h3`,
          at: stamp(),
          actor: currentUser.name,
          event: 'Checked in',
          detail: 'Walk-in check-in completed'
        });
      }
      return {
        id,
        code: `RSV-${5000 + counter.current}`,
        guestId: input.guestId,
        roomId: input.roomId,
        roomType: input.roomType,
        arrival: input.arrival,
        departure: input.departure,
        adults: input.adults,
        children: input.children,
        rate: input.rate,
        source: walkIn ? 'Walk-In' : input.source,
        requests: input.requests,
        status: walkIn ? 'in-house' : 'confirmed',
        paymentStatus: 'unpaid',
        accompanying: [],
        keyCards: walkIn ? 2 : 0,
        createdAt: stamp(),
        history
      };
    },
    [currentUser.name, nextId, rooms, stamp]
  );

  const createReservation = useCallback(
    (input: NewReservationInput) => {
      const reservation = buildReservation(input, false);
      setReservations((prev) => [reservation, ...prev]);
      toast.success(`Reservation ${reservation.code} confirmed`, {
        description: `${guestName(input.guestId)} · ${input.arrival} → ${input.departure}`
      });
      return reservation;
    },
    [buildReservation, guestName]
  );

  const createWalkIn = useCallback(
    (input: NewReservationInput) => {
      const reservation = buildReservation(input, true);
      const nights = nightsBetween(input.arrival, input.departure);
      const roomCharge: Charge = {
        id: nextId('chg'),
        reservationId: reservation.id,
        code: 'Room',
        description: `Room charge — ${nights} night(s)`,
        quantity: nights,
        unitPrice: input.rate,
        date: today,
        postedBy: currentUser.name
      };
      setReservations((prev) => [reservation, ...prev]);
      setCharges((prev) => [...prev, roomCharge]);
      if (input.roomId) {
        setRooms((prev) =>
        prev.map((r) => r.id === input.roomId ? { ...r, housekeeping: 'inspected' } : r)
        );
      }
      toast.success('Walk-in checked in', {
        description: `${guestName(input.guestId)} is now in house.`
      });
      return reservation;
    },
    [buildReservation, currentUser.name, guestName, nextId, today]
  );

  const assignRoom = useCallback(
    (reservationId: string, roomId: string) => {
      const room = rooms.find((r) => r.id === roomId);
      setReservations((prev) =>
      prev.map((r) => r.id === reservationId ? { ...r, roomId } : r)
      );
      pushHistory(reservationId, 'Room assigned', `Room ${room?.number ?? ''}`);
      toast.success(`Room ${room?.number} assigned`);
    },
    [pushHistory, rooms]
  );

  const checkIn = useCallback(
    (reservationId: string, input: CheckInInput) => {
      const room = rooms.find((r) => r.id === input.roomId);
      setReservations((prev) =>
      prev.map((r) =>
      r.id === reservationId ?
      {
        ...r,
        status: 'in-house',
        roomId: input.roomId,
        accompanying: input.accompanying,
        keyCards: input.keyCards
      } :
      r
      )
      );
      setRooms((prev) =>
      prev.map((r) => r.id === input.roomId ? { ...r, housekeeping: 'inspected', housekeeper: null } : r)
      );
      if (input.depositAmount > 0) {
        const payment: Payment = {
          id: nextId('pay'),
          reservationId,
          amount: input.depositAmount,
          method: input.method,
          kind: 'Deposit',
          date: today,
          reference: `DEP-${counter.current}`
        };
        const nextPayments = [...payments, payment];
        setPayments(nextPayments);
        syncPaymentStatus(reservationId, charges, nextPayments);
      }
      pushHistory(
        reservationId,
        'Checked in',
        `Room ${room?.number ?? ''} · ${input.keyCards} key card(s)${
        input.depositAmount > 0 ? ` · deposit taken` : ''}`

      );
      toast.success('Check-in complete', {
        description: `Room ${room?.number} is now occupied.`
      });
    },
    [charges, nextId, payments, pushHistory, rooms, syncPaymentStatus, today]
  );

  const checkOut = useCallback(
    (reservationId: string, input: {amount: number;method: PaymentMethod;}) => {
      const reservation = reservations.find((r) => r.id === reservationId);
      const room = rooms.find((r) => r.id === reservation?.roomId);
      let nextPayments = payments;
      if (input.amount > 0) {
        const payment: Payment = {
          id: nextId('pay'),
          reservationId,
          amount: input.amount,
          method: input.method,
          kind: 'Payment',
          date: today,
          reference: `AUTH-${counter.current}`
        };
        nextPayments = [...payments, payment];
        setPayments(nextPayments);
      }
      const settled = folioFor(reservationId, charges, nextPayments).balance <= 0.5;
      setReservations((prev) =>
      prev.map((r) =>
      r.id === reservationId ?
      { ...r, status: 'checked-out', paymentStatus: settled ? 'paid' : 'partial' } :
      r
      )
      );
      if (room) {
        setRooms((prev) =>
        prev.map((r) =>
        r.id === room.id ?
        { ...r, housekeeping: 'dirty', housekeepingPriority: 'high', housekeeper: null } :
        r
        )
        );
      }
      pushHistory(
        reservationId,
        'Checked out',
        `${settled ? 'Folio settled' : 'Balance carried to city ledger'} · room sent to housekeeping`
      );
      toast.success('Check-out complete', {
        description: `Room ${room?.number ?? ''} released to housekeeping as dirty (high priority).`
      });
    },
    [charges, nextId, payments, pushHistory, reservations, rooms, today]
  );

  const changeRoom = useCallback(
    (reservationId: string, roomId: string, reason: string) => {
      const reservation = reservations.find((r) => r.id === reservationId);
      const oldRoom = rooms.find((r) => r.id === reservation?.roomId);
      const newRoom = rooms.find((r) => r.id === roomId);
      setReservations((prev) => prev.map((r) => r.id === reservationId ? { ...r, roomId } : r));
      setRooms((prev) =>
      prev.map((r) => {
        if (oldRoom && r.id === oldRoom.id) {
          return { ...r, housekeeping: 'dirty', housekeepingPriority: 'high', housekeeper: null };
        }
        if (r.id === roomId) return { ...r, housekeeping: 'inspected' };
        return r;
      })
      );
      pushHistory(
        reservationId,
        'Room changed',
        `${oldRoom ? `Room ${oldRoom.number} → ` : ''}Room ${newRoom?.number ?? ''} · ${reason}`
      );
      toast.success(`Moved to room ${newRoom?.number}`, {
        description: oldRoom ? `Room ${oldRoom.number} sent to housekeeping.` : undefined
      });
    },
    [pushHistory, reservations, rooms]
  );

  const extendStay = useCallback(
    (reservationId: string, departure: string) => {
      setReservations((prev) =>
      prev.map((r) => r.id === reservationId ? { ...r, departure } : r)
      );
      pushHistory(reservationId, 'Stay extended', `New departure ${departure}`);
      toast.success('Stay extended', { description: `Departure moved to ${departure}.` });
    },
    [pushHistory]
  );

  const cancelReservation = useCallback(
    (reservationId: string, reason: string) => {
      setReservations((prev) =>
      prev.map((r) =>
      r.id === reservationId ?
      { ...r, status: 'cancelled', roomId: null, cancellationReason: reason } :
      r
      )
      );
      pushHistory(reservationId, 'Reservation cancelled', reason);
      toast.success('Reservation cancelled', { description: reason });
    },
    [pushHistory]
  );

  const addCharge = useCallback(
    (input: {
      reservationId: string;
      code: ChargeCode;
      description: string;
      quantity: number;
      unitPrice: number;
    }) => {
      const charge: Charge = {
        id: nextId('chg'),
        reservationId: input.reservationId,
        code: input.code,
        description: input.description,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        date: today,
        postedBy: currentUser.name
      };
      const next = [...charges, charge];
      setCharges(next);
      syncPaymentStatus(input.reservationId, next, payments);
      pushHistory(
        input.reservationId,
        'Charge posted',
        `${input.code} · ${input.quantity} × ${input.unitPrice}`
      );
      toast.success('Charge posted to folio');
    },
    [charges, currentUser.name, nextId, payments, pushHistory, syncPaymentStatus, today]
  );

  const addPayment = useCallback(
    (input: {
      reservationId: string;
      amount: number;
      method: PaymentMethod;
      kind: PaymentKind;
    }) => {
      const payment: Payment = {
        id: nextId('pay'),
        reservationId: input.reservationId,
        amount: input.amount,
        method: input.method,
        kind: input.kind,
        date: today,
        reference: `${input.kind === 'Deposit' ? 'DEP' : input.kind === 'Refund' ? 'REF' : 'AUTH'}-${counter.current}`
      };
      const next = [...payments, payment];
      setPayments(next);
      syncPaymentStatus(input.reservationId, charges, next);
      pushHistory(
        input.reservationId,
        `${input.kind} recorded`,
        `${input.method} · ${input.amount}`
      );
      toast.success(`${input.kind} recorded`, { description: `${input.method}` });
    },
    [charges, nextId, payments, pushHistory, syncPaymentStatus, today]
  );

  const setHousekeeping = useCallback(
    (roomId: string, status: HousekeepingStatus) => {
      const room = rooms.find((r) => r.id === roomId);
      setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, housekeeping: status } : r));
      toast.success(`Room ${room?.number} · ${status}`);
    },
    [rooms]
  );

  const assignHousekeeper = useCallback(
    (roomId: string, housekeeper: string) => {
      setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, housekeeper } : r));
      toast.success('Housekeeper assigned', { description: housekeeper });
    },
    []
  );

  const setHousekeepingPriority = useCallback(
    (roomId: string, priority: HousekeepingPriority) => {
      setRooms((prev) =>
      prev.map((r) => r.id === roomId ? { ...r, housekeepingPriority: priority } : r)
      );
    },
    []
  );

  const updateTicket = useCallback(
    (ticketId: string, patch: Partial<MaintenanceTicket>) => {
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, ...patch } : t));
      toast.success('Work order updated');
    },
    []
  );

  const addGuestNote = useCallback(
    (guestId: string, content: string) => {
      setGuests((prev) =>
      prev.map((g) =>
      g.id === guestId ?
      {
        ...g,
        notes: [
        {
          id: `note-${counter.current++}`,
          date: today,
          staff: currentUser.name,
          content
        },
        ...g.notes]

      } :
      g
      )
      );
      toast.success('Internal note added', { description: 'Front office team notified.' });
    },
    [currentUser.name, today]
  );

  const addTicket = useCallback(
    (input: NewTicketInput) => {
      const newTicket: MaintenanceTicket = {
        id: nextId('MT'),
        code: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        roomId: input.roomId,
        category: input.category,
        priority: input.priority,
        status: 'open',
        description: input.description,
        reportedAt: stamp(),
        assignedTo: 'Unassigned'
      };
      setTickets((prev) => [newTicket, ...prev]);
      toast.success(`Maintenance ticket ${newTicket.code} created`);
      return newTicket;
    },
    [nextId, stamp]
  );

  const addStaffMember = useCallback(
    (input: NewStaffInput) => {
      const member: StaffMember = {
        id: nextId('STF'),
        name: input.name,
        role: input.role,
        shift: input.shift,
        email: input.email,
        phone: input.phone,
        status: 'On Duty'
      };
      setStaff((prev) => [member, ...prev]);
      toast.success(`Staff member ${member.name} added`);
      return member;
    },
    [nextId]
  );

  const updateSettings = useCallback((patch: Partial<PropertySettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    toast.success('Property settings saved');
  }, []);

  const value: HotelContextValue = {
    today,
    currentUser,
    rooms,
    guests,
    reservations,
    charges,
    payments,
    tickets,
    staff,
    settings,
    ops,
    getRoom,
    getGuest,
    getReservation,
    guestName,
    folio,
    roomStatus,
    createGuest,
    updateGuest,
    createReservation,
    createWalkIn,
    assignRoom,
    checkIn,
    checkOut,
    changeRoom,
    extendStay,
    cancelReservation,
    addCharge,
    addPayment,
    setHousekeeping,
    assignHousekeeper,
    setHousekeepingPriority,
    updateTicket,
    addTicket,
    addStaffMember,
    addGuestNote,
    updateSettings
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel(): HotelContextValue {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used inside HotelProvider');
  return ctx;
}

export function suggestDeparture(arrival: string, nights: number): string {
  return isoDate(addDays(parseISO(arrival), Math.max(1, nights)));
}