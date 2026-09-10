import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState } from
'react';
import { toast } from 'sonner';
import {
  seedActivity,
  seedCharges,
  seedGuests,
  seedPayments,
  seedReservations,
  seedRooms,
  seedStaff,
  seedTickets } from
'../data/seed';
import type {
  ActivityEvent,
  Charge,
  ChargeCode,
  Guest,
  HousekeepingPriority,
  HousekeepingStatus,
  MaintenanceTicket,
  Payment,
  PaymentKind,
  PaymentMethod,
  Reservation,
  Room,
  RoomTypeId,
  StaffMember,
  TicketStatus } from
'../types';
import { buildOperations, folioFor, type Operations } from '../utils/operations';
import { today as todayIso } from '../utils/format';
import { currentUser } from '../data/property';

const uid = (prefix: string): string =>
`${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const stamp = () => new Date().toISOString();

interface NewGuestInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  segment: Guest['segment'];
  tier: Guest['tier'];
}

interface NewReservationInput {
  guestId: string;
  roomId: string | null;
  roomType: RoomTypeId;
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  rate: number;
  source: string;
  requests: string;
  walkIn?: boolean;
}

interface CheckInInput {
  reservationId: string;
  roomId: string;
  keyCards: number;
  accompanying: string[];
  depositAmount: number;
  method: PaymentMethod;
  idType: string;
  idNumber: string;
}

interface CheckOutInput {
  reservationId: string;
  amount: number;
  method: PaymentMethod;
}

interface HotelContextValue {
  today: string;
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  charges: Charge[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  staff: StaffMember[];
  activity: ActivityEvent[];
  ops: Operations;
  guestById: (id: string) => Guest | undefined;
  roomById: (id: string | null) => Room | undefined;
  reservationById: (id: string) => Reservation | undefined;
  guestName: (id: string) => string;
  folio: (reservationId: string) => ReturnType<typeof folioFor>;
  createGuest: (input: NewGuestInput) => Guest;
  createReservation: (input: NewReservationInput) => Reservation;
  assignRoom: (reservationId: string, roomId: string) => void;
  checkIn: (input: CheckInInput) => void;
  checkOut: (input: CheckOutInput) => void;
  changeRoom: (reservationId: string, roomId: string, reason: string) => void;
  extendStay: (reservationId: string, departure: string) => void;
  cancelReservation: (reservationId: string, reason: string) => void;
  addCharge: (
  reservationId: string,
  code: ChargeCode,
  description: string,
  qty: number,
  unitPrice: number)
  => void;
  addPayment: (
  reservationId: string,
  amount: number,
  method: PaymentMethod,
  kind: PaymentKind)
  => void;
  updateHousekeeping: (
  roomId: string,
  patch: {
    housekeeping?: HousekeepingStatus;
    hkPriority?: HousekeepingPriority;
    housekeeper?: string | null;
  })
  => void;
  updateTicket: (
  ticketId: string,
  patch: {status?: TicketStatus;assignee?: string | null;})
  => void;
  addGuestNote: (guestId: string, text: string) => void;
}

const HotelContext = createContext<HotelContextValue | null>(null);

export function HotelProvider({ children }: {children: React.ReactNode;}) {
  const [rooms, setRooms] = useState<Room[]>(seedRooms);
  const [guests, setGuests] = useState<Guest[]>(seedGuests);
  const [reservations, setReservations] = useState<Reservation[]>(seedReservations);
  const [charges, setCharges] = useState<Charge[]>(seedCharges);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(seedTickets);
  const [staff] = useState<StaffMember[]>(seedStaff);
  const [activity, setActivity] = useState<ActivityEvent[]>(seedActivity);

  const today = todayIso();

  const ops = useMemo(
    () =>
    buildOperations(rooms, guests, reservations, charges, payments, tickets, today),
    [rooms, guests, reservations, charges, payments, tickets, today]
  );

  const guestById = useCallback(
    (id: string) => guests.find((g) => g.id === id),
    [guests]
  );
  const roomById = useCallback(
    (id: string | null) => id ? rooms.find((r) => r.id === id) : undefined,
    [rooms]
  );
  const reservationById = useCallback(
    (id: string) => reservations.find((r) => r.id === id),
    [reservations]
  );
  const guestName = useCallback(
    (id: string) => {
      const g = guests.find((x) => x.id === id);
      return g ? `${g.firstName} ${g.lastName}` : 'Unknown guest';
    },
    [guests]
  );
  const folio = useCallback(
    (reservationId: string) => folioFor(reservationId, charges, payments),
    [charges, payments]
  );

  const pushHistory = useCallback(
    (reservationId: string, text: string) =>
    setReservations((prev) =>
    prev.map((r) =>
    r.id === reservationId ?
    {
      ...r,
      history: [
      { id: uid('h'), at: stamp(), by: currentUser.name, text },
      ...r.history]

    } :
    r
    )
    ),
    []
  );

  const logActivity = useCallback((event: Omit<ActivityEvent, 'id' | 'at'>) => {
    setActivity((prev) => [{ ...event, id: uid('ac'), at: stamp() }, ...prev]);
  }, []);

  const createGuest = useCallback((input: NewGuestInput): Guest => {
    const guest: Guest = {
      id: uid('g'),
      ...input,
      idType: null,
      idNumber: null,
      preferences: [],
      notes: [],
      stays: 0
    };
    setGuests((prev) => [guest, ...prev]);
    toast.success(`Guest created — ${guest.firstName} ${guest.lastName}`);
    return guest;
  }, []);

  const createReservation = useCallback(
    (input: NewReservationInput): Reservation => {
      const walkIn = Boolean(input.walkIn);
      const reservation: Reservation = {
        id: uid('res'),
        confirmation: `BKG-${Math.floor(1000 + Math.random() * 8999)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        guestId: input.guestId,
        roomId: input.roomId,
        roomType: input.roomType,
        arrival: input.arrival,
        departure: input.departure,
        adults: input.adults,
        children: input.children,
        rate: input.rate,
        source: walkIn ? 'Walk-In' : input.source,
        status: walkIn ? 'in_house' : 'confirmed',
        paymentStatus: 'unpaid',
        requests: input.requests,
        keyCards: 1,
        accompanying: [],
        history: [
        {
          id: uid('h'),
          at: stamp(),
          by: currentUser.name,
          text: walkIn ?
          'Walk-in created and checked in at the front desk.' :
          'Reservation created at the front desk.'
        }]

      };
      setReservations((prev) => [reservation, ...prev]);

      if (walkIn && input.roomId) {
        const nights = Math.max(
          1,
          Math.round(
            (new Date(input.departure).getTime() -
            new Date(input.arrival).getTime()) /
            86400000
          )
        );
        setCharges((prev) => [
        {
          id: uid('ch'),
          reservationId: reservation.id,
          code: 'room',
          description: `Room & Tax — ${nights} night${nights > 1 ? 's' : ''}`,
          qty: nights,
          unitPrice: input.rate,
          postedAt: stamp(),
          by: currentUser.name
        },
        ...prev]
        );
        setRooms((prev) =>
        prev.map((r) =>
        r.id === input.roomId ? { ...r, housekeeping: 'inspected' } : r
        )
        );
      }
      toast.success(
        walkIn ?
        `Walk-in checked in — ${reservation.confirmation}` :
        `Reservation confirmed — ${reservation.confirmation}`
      );
      return reservation;
    },
    []
  );

  const assignRoom = useCallback(
    (reservationId: string, roomId: string) => {
      const room = rooms.find((r) => r.id === roomId);
      setReservations((prev) =>
      prev.map((r) => r.id === reservationId ? { ...r, roomId } : r)
      );
      pushHistory(reservationId, `Room ${room?.number ?? ''} assigned.`);
      toast.success(`Room ${room?.number ?? ''} assigned`);
    },
    [rooms, pushHistory]
  );

  const checkIn = useCallback(
    (input: CheckInInput) => {
      const room = rooms.find((r) => r.id === input.roomId);
      setReservations((prev) =>
      prev.map((r) =>
      r.id === input.reservationId ?
      {
        ...r,
        status: 'in_house',
        roomId: input.roomId,
        keyCards: input.keyCards,
        accompanying: input.accompanying,
        paymentStatus:
        input.depositAmount > 0 && r.paymentStatus === 'unpaid' ?
        'partial' :
        r.paymentStatus
      } :
      r
      )
      );
      setRooms((prev) =>
      prev.map((r) =>
      r.id === input.roomId ?
      { ...r, housekeeping: 'inspected', hkPriority: 'low' } :
      r
      )
      );
      const reservation = reservations.find((r) => r.id === input.reservationId);
      if (reservation) {
        setGuests((prev) =>
        prev.map((g) =>
        g.id === reservation.guestId ?
        {
          ...g,
          idType: input.idType || g.idType,
          idNumber: input.idNumber || g.idNumber,
          stays: g.stays + 1
        } :
        g
        )
        );
        if (input.depositAmount > 0) {
          setPayments((prev) => [
          {
            id: uid('pm'),
            reservationId: input.reservationId,
            amount: input.depositAmount,
            method: input.method,
            kind: 'deposit',
            at: stamp(),
            by: currentUser.name
          },
          ...prev]
          );
        }
        logActivity({
          kind: 'door',
          title: `Room ${room?.number ?? ''}`,
          location: `Floor ${room?.floor ?? ''}`,
          guestId: reservation.guestId,
          roomNumber: room?.number ?? null,
          result: 'granted',
          detail: `${input.keyCards} keycard${input.keyCards > 1 ? 's' : ''} encoded at check-in.`
        });
      }
      pushHistory(
        input.reservationId,
        `Checked in to room ${room?.number ?? ''}. ${input.keyCards} keycard(s) encoded.`
      );
      toast.success(`Checked in — room ${room?.number ?? ''} is now occupied`);
    },
    [rooms, reservations, pushHistory, logActivity]
  );

  const checkOut = useCallback(
    (input: CheckOutInput) => {
      const reservation = reservations.find((r) => r.id === input.reservationId);
      const room = rooms.find((r) => r.id === reservation?.roomId);
      if (input.amount > 0) {
        setPayments((prev) => [
        {
          id: uid('pm'),
          reservationId: input.reservationId,
          amount: input.amount,
          method: input.method,
          kind: 'payment',
          at: stamp(),
          by: currentUser.name
        },
        ...prev]
        );
      }
      const remaining =
      folioFor(input.reservationId, charges, payments).balance - input.amount;
      setReservations((prev) =>
      prev.map((r) =>
      r.id === input.reservationId ?
      {
        ...r,
        status: 'checked_out',
        paymentStatus: remaining > 1 ? 'partial' : 'paid',
        roomId: r.roomId
      } :
      r
      )
      );
      if (room) {
        setRooms((prev) =>
        prev.map((r) =>
        r.id === room.id ?
        { ...r, housekeeping: 'dirty', hkPriority: 'high', housekeeper: null } :
        r
        )
        );
      }
      pushHistory(
        input.reservationId,
        `Checked out. Settlement of ${input.amount.toFixed(2)} taken.`
      );
      toast.success(
        `Checked out — room ${room?.number ?? ''} sent to housekeeping`
      );
    },
    [reservations, rooms, charges, payments, pushHistory]
  );

  const changeRoom = useCallback(
    (reservationId: string, roomId: string, reason: string) => {
      const reservation = reservations.find((r) => r.id === reservationId);
      const oldRoom = rooms.find((r) => r.id === reservation?.roomId);
      const newRoom = rooms.find((r) => r.id === roomId);
      setReservations((prev) =>
      prev.map((r) => r.id === reservationId ? { ...r, roomId } : r)
      );
      setRooms((prev) =>
      prev.map((r) => {
        if (oldRoom && r.id === oldRoom.id)
        return { ...r, housekeeping: 'dirty', hkPriority: 'high', housekeeper: null };
        if (r.id === roomId) return { ...r, housekeeping: 'inspected' };
        return r;
      })
      );
      pushHistory(
        reservationId,
        `Room changed ${oldRoom ? `from ${oldRoom.number} ` : ''}to ${newRoom?.number ?? ''} — ${reason || 'no reason given'}.`
      );
      toast.success(`Moved to room ${newRoom?.number ?? ''}`);
    },
    [reservations, rooms, pushHistory]
  );

  const extendStay = useCallback(
    (reservationId: string, departure: string) => {
      setReservations((prev) =>
      prev.map((r) => r.id === reservationId ? { ...r, departure } : r)
      );
      pushHistory(reservationId, `Stay extended to ${departure}.`);
      toast.success(`Departure updated to ${departure}`);
    },
    [pushHistory]
  );

  const cancelReservation = useCallback(
    (reservationId: string, reason: string) => {
      setReservations((prev) =>
      prev.map((r) =>
      r.id === reservationId ? { ...r, status: 'cancelled' } : r
      )
      );
      pushHistory(reservationId, `Reservation cancelled — ${reason}.`);
      toast.success('Reservation cancelled');
    },
    [pushHistory]
  );

  const addCharge = useCallback(
    (
    reservationId: string,
    code: ChargeCode,
    description: string,
    qty: number,
    unitPrice: number) =>
    {
      setCharges((prev) => [
      {
        id: uid('ch'),
        reservationId,
        code,
        description,
        qty,
        unitPrice,
        postedAt: stamp(),
        by: currentUser.name
      },
      ...prev]
      );
      pushHistory(
        reservationId,
        `Charge posted — ${description} (${qty} × ${unitPrice.toFixed(2)}).`
      );
      toast.success('Charge posted to folio');
    },
    [pushHistory]
  );

  const addPayment = useCallback(
    (
    reservationId: string,
    amount: number,
    method: PaymentMethod,
    kind: PaymentKind) =>
    {
      setPayments((prev) => [
      {
        id: uid('pm'),
        reservationId,
        amount,
        method,
        kind,
        at: stamp(),
        by: currentUser.name
      },
      ...prev]
      );
      const remaining = folioFor(reservationId, charges, payments).balance - amount;
      setReservations((prev) =>
      prev.map((r) =>
      r.id === reservationId ?
      { ...r, paymentStatus: remaining > 1 ? 'partial' : 'paid' } :
      r
      )
      );
      pushHistory(reservationId, `${kind} of ${amount.toFixed(2)} recorded (${method}).`);
      toast.success('Payment recorded');
    },
    [charges, payments, pushHistory]
  );

  const updateHousekeeping = useCallback(
    (
    roomId: string,
    patch: {
      housekeeping?: HousekeepingStatus;
      hkPriority?: HousekeepingPriority;
      housekeeper?: string | null;
    }) =>
    {
      setRooms((prev) =>
      prev.map((r) => r.id === roomId ? { ...r, ...patch } : r)
      );
    },
    []
  );

  const updateTicket = useCallback(
    (
    ticketId: string,
    patch: {status?: TicketStatus;assignee?: string | null;}) =>
    {
      setTickets((prev) =>
      prev.map((t) => t.id === ticketId ? { ...t, ...patch } : t)
      );
      toast.success('Work order updated');
    },
    []
  );

  const addGuestNote = useCallback((guestId: string, text: string) => {
    setGuests((prev) =>
    prev.map((g) =>
    g.id === guestId ?
    {
      ...g,
      notes: [
      { id: uid('gn'), at: stamp(), by: currentUser.name, text },
      ...g.notes]

    } :
    g
    )
    );
    toast.success('Note added to guest record');
  }, []);

  const value: HotelContextValue = {
    today,
    rooms,
    guests,
    reservations,
    charges,
    payments,
    tickets,
    staff,
    activity,
    ops,
    guestById,
    roomById,
    reservationById,
    guestName,
    folio,
    createGuest,
    createReservation,
    assignRoom,
    checkIn,
    checkOut,
    changeRoom,
    extendStay,
    cancelReservation,
    addCharge,
    addPayment,
    updateHousekeeping,
    updateTicket,
    addGuestNote
  };

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel(): HotelContextValue {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used inside HotelProvider');
  return ctx;
}