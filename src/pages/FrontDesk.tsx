import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeftIcon,
  BedDoubleIcon,
  CalendarDaysIcon,
  ClockIcon,
  DoorOpenIcon,
  LogInIcon,
  LogOutIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon
} from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { CheckInDialog } from '../components/workflows/CheckInDialog';
import { CheckOutDialog } from '../components/workflows/CheckOutDialog';
import { NewReservationDialog } from '../components/workflows/NewReservationDialog';
import { RoomPickerDialog } from '../components/workflows/RoomPickerDialog';
import { ChangeRoomDialog } from '../components/workflows/ChangeRoomDialog';
import { housekeepingLabel, housekeepingTone, paymentLabel, paymentTone } from '../utils/tone';
import { money, money0, nightsBetween, shortDate } from '../utils/format';
import { StatusPill } from '../components/ui';

export function FrontDesk() {
  const navigate = useNavigate();
  const { ops, rooms, reservations, guestName, getRoom, folio, assignRoom, getReservation, today } = useHotel();

  const [bookingMode, setBookingMode] = useState<'reservation' | 'walk-in' | null>(null);
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [checkOutId, setCheckOutId] = useState<string | null>(null);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [changeRoomId, setChangeRoomId] = useState<string | null>(null);
  const [arrivalTab, setArrivalTab] = useState<'all' | 'today' | 'upcoming'>('all');

  const assignTarget = assignId ? getReservation(assignId) : undefined;
  
  const readyRooms = useMemo(() => {
    return rooms
      .filter(
        (room) =>
          ops.statusByRoom[room.id] === 'available' &&
          (room.housekeeping === 'clean' || room.housekeeping === 'inspected')
      )
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [rooms, ops.statusByRoom]);

  const allArrivals = useMemo(() => {
    return reservations
      .filter((r) => r.status === 'confirmed' || r.status === 'tentative')
      .sort((a, b) => {
        if (a.arrival === today && b.arrival !== today) return -1;
        if (a.arrival !== today && b.arrival === today) return 1;
        return a.arrival.localeCompare(b.arrival);
      });
  }, [reservations, today]);

  const filteredArrivals = useMemo(() => {
    if (arrivalTab === 'today') {
      return allArrivals.filter((r) => r.arrival === today);
    }
    if (arrivalTab === 'upcoming') {
      return allArrivals.filter((r) => r.arrival > today);
    }
    return allArrivals;
  }, [allArrivals, arrivalTab, today]);

  const todayArrivalsCount = allArrivals.filter((r) => r.arrival === today).length;
  const upcomingArrivalsCount = allArrivals.filter((r) => r.arrival > today).length;

  // Total balance of departing guests
  const departingBalanceTotal = ops.departures.reduce((acc, dep) => acc + folio(dep.id).balance, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
              Front Desk Workspace
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#176938]">
              <span className="h-2 w-2 rounded-full bg-[#176938] animate-pulse" />
              LIVE DESK OPERATIONAL
            </span>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 font-normal">
            Real-time management for arrivals, express departures, walk-ins, and guest movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setBookingMode('walk-in')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#176938] to-[#2daf57] px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
          >
            <DoorOpenIcon className="h-4 w-4" />
            <span>Walk-in Check-in</span>
          </button>
          <button
            type="button"
            onClick={() => setBookingMode('reservation')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#176938] to-[#2daf57] px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all"
          >
            <PlusIcon className="h-4 w-4 text-white" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Due Arrivals */}
        <div className="glass-card-premium rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              DUE ARRIVALS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] shadow-xs">
              <LogInIcon className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 font-sans tabular-nums">
              {ops.arrivals.length}
            </span>
            <span className="text-[13px] font-bold text-slate-500">due today</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-200/60 pt-2.5">
            <span>Total Active: {allArrivals.length}</span>
            <span className="text-[#176938] font-bold">{todayArrivalsCount} Today</span>
          </div>
        </div>

        {/* Card 2: Due Departures */}
        <div className="glass-card-premium rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              DUE DEPARTURES
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fef3c7] text-[#b45309] shadow-xs">
              <LogOutIcon className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 font-sans tabular-nums">
              {ops.departures.length}
            </span>
            <span className="text-[13px] font-bold text-slate-500">checking out</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-200/60 pt-2.5">
            <span>Pending Balance</span>
            <span className="text-[#b45309] font-bold tabular-nums">{money(departingBalanceTotal)}</span>
          </div>
        </div>

        {/* Card 3: In-House Guests */}
        <div className="glass-card-premium rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              IN-HOUSE GUESTS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7] shadow-xs">
              <UsersIcon className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 font-sans tabular-nums">
              {ops.inHouse.length}
            </span>
            <span className="text-[13px] font-bold text-slate-500">occupied rooms</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-200/60 pt-2.5">
            <span>Stayovers: {ops.stayovers.length}</span>
            <span className="text-[#0284c7] font-bold">Active Roster</span>
          </div>
        </div>

        {/* Card 4: Vacant & Ready */}
        <div className="glass-card-premium rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              SELLABLE ROOMS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] shadow-xs">
              <BedDoubleIcon className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-[#176938] font-sans tabular-nums">
              {readyRooms.length}
            </span>
            <span className="text-[13px] font-bold text-slate-500">clean & ready</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-200/60 pt-2.5">
            <span>Walk-in Ready</span>
            <span className="text-[#176938] font-bold">100% Inspected</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid (Left Section 3/4, Right Section 1/4) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Primary Cards */}
        <div className="space-y-6 min-w-0">
          {/* Card 1: Arrivals & Reservations */}
          <div className="glass-card-premium overflow-hidden rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-3 border-b border-slate-200/60 bg-white/40 backdrop-blur-xs">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
                    Arrivals & Pending Check-ins
                  </h2>
                  <span className="rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-bold text-[#176938] border border-[#bbf7d0]">
                    {filteredArrivals.length} Guests
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  {todayArrivalsCount} due today • {upcomingArrivalsCount} upcoming bookings
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setArrivalTab('all')}
                  className={`rounded-lg px-3 py-1 transition-all ${
                    arrivalTab === 'all'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({allArrivals.length})
                </button>
                <button
                  type="button"
                  onClick={() => setArrivalTab('today')}
                  className={`rounded-lg px-3 py-1 transition-all ${
                    arrivalTab === 'today'
                      ? 'bg-[#176938] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today ({todayArrivalsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setArrivalTab('upcoming')}
                  className={`rounded-lg px-3 py-1 transition-all ${
                    arrivalTab === 'upcoming'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upcoming ({upcomingArrivalsCount})
                </button>
              </div>
            </div>

            {filteredArrivals.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-semibold text-slate-700">No matching arrivals found</p>
                <p className="mt-1 text-xs text-slate-400">Try switching tabs or creating a new reservation.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {filteredArrivals.map((reservation) => {
                  const room = getRoom(reservation.roomId);
                  const isToday = reservation.arrival === today;
                  const name = guestName(reservation.guestId);
                  const nights = nightsBetween(reservation.arrival, reservation.departure);
                  const initials = name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2);

                  return (
                    <div
                      key={reservation.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80"
                    >
                      {/* Left: Guest Name, Code Badge & Room Type */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-xs font-extrabold text-[#176938] shadow-xs mt-0.5">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/reservations/${reservation.id}`}
                              className="text-[15px] font-bold text-slate-900 hover:text-[#176938] transition-colors"
                            >
                              {name}
                            </Link>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold font-mono text-slate-700 border border-slate-200/60">
                              {reservation.code}
                            </span>
                            {isToday ? (
                              <span className="rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[10px] font-bold text-[#176938] uppercase tracking-wider border border-[#bbf7d0]">
                                Today
                              </span>
                            ) : (
                              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider border border-blue-100">
                                {shortDate(reservation.arrival)}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-2.5 text-[12px] font-medium text-slate-500">
                            <span className="font-semibold text-slate-700">{reservation.roomType} King</span>
                            <span>•</span>
                            <span>{reservation.adults} Guest{reservation.adults > 1 ? 's' : ''}{reservation.children > 0 ? `, ${reservation.children} Child` : ''}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Stay Period Box at Top Right & Room Badge + Check-in at Bottom Right */}
                      <div className="flex flex-col items-end gap-2.5 shrink-0 self-end sm:self-center ml-auto">
                        <div className="flex items-center gap-2 rounded-xl bg-slate-100/70 px-3.5 py-1.5 border border-slate-200/60">
                          <CalendarDaysIcon className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-700 font-mono">
                            {shortDate(reservation.arrival)} → {shortDate(reservation.departure)}
                          </span>
                          <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-600 border border-slate-200/60">
                            {nights}N
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 justify-end w-full">
                          {room ? (
                            <span className="rounded-xl bg-slate-100/90 px-3 py-1.5 text-xs font-bold text-slate-800 font-mono border border-slate-200/60 shadow-2xs">
                              Room {room.number}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAssignId(reservation.id)}
                              className="rounded-xl bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-[#b45309] border border-amber-200/60 hover:bg-amber-100 transition-all cursor-pointer"
                            >
                              Assign Room
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setCheckInId(reservation.id)}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#176938] to-[#2daf57] px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer"
                          >
                            <LogInIcon className="h-4 w-4" />
                            <span>Check in</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Departures */}
          <div className="glass-card-premium overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-white/40 backdrop-blur-xs">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
                  Scheduled Departures
                </h2>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  {ops.departures.length} guests checking out today (Checkout cutoff 11:00 AM)
                </p>
              </div>
              <span className="rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[11px] font-bold text-[#b45309] border border-amber-200/60">
                {ops.departures.length} Pending
              </span>
            </div>

            {ops.departures.length === 0 ? (
              <div className="px-6 py-10 text-center text-xs text-slate-400 font-medium">
                No in-house guests scheduled to depart today.
              </div>
            ) : (
              <div className="divide-y divide-slate-100/80">
                {ops.departures.map((reservation) => {
                  const room = getRoom(reservation.roomId);
                  const balance = folio(reservation.id).balance;
                  const name = guestName(reservation.guestId);
                  const initials = name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2);

                  return (
                    <div
                      key={reservation.id}
                      className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80"
                    >
                      <div className="flex items-center gap-3.5 min-w-[200px] flex-1">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fef3c7] text-xs font-extrabold text-[#b45309] shadow-xs">
                          {initials}
                        </span>
                        <div>
                          <Link
                            to={`/reservations/${reservation.id}`}
                            className="text-[14px] font-bold text-slate-900 hover:text-[#176938] transition-colors"
                          >
                            {name}
                          </Link>
                          <p className="mt-0.5 text-[12px] font-medium text-slate-500">
                            <span className="font-mono text-slate-700 font-bold">{reservation.code}</span> • Room {room?.number ?? '—'} • Source: {reservation.source}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-[13px] font-extrabold text-slate-900 font-mono tabular-nums">
                            {money(balance)}
                          </span>
                          <StatusPill tone={paymentTone[reservation.paymentStatus]}>
                            {paymentLabel[reservation.paymentStatus]}
                          </StatusPill>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCheckOutId(reservation.id)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          <LogOutIcon className="h-4 w-4 text-[#b45309]" />
                          <span>Check out</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: In-House Guests Table */}
          <div className="glass-card-premium overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-white/40 backdrop-blur-xs">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
                  In-House Guest Roster
                </h2>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  {ops.inHouse.length} occupied rooms • {ops.stayovers.length} stayovers
                </p>
              </div>
              <span className="rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-[11px] font-bold text-[#0284c7] border border-sky-200/60">
                {ops.inHouse.length} Active
              </span>
            </div>

            {ops.inHouse.length === 0 ? (
              <div className="px-6 py-10 text-center text-xs text-slate-400 font-medium">
                No active guests in house.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200/60 bg-slate-50/50 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-[#176938]">
                      <th scope="col" className="py-3 pl-5 pr-3">
                        Guest
                      </th>
                      <th scope="col" className="px-3 py-3">
                        Room
                      </th>
                      <th scope="col" className="px-3 py-3">
                        Departure
                      </th>
                      <th scope="col" className="px-3 py-3">
                        Balance
                      </th>
                      <th scope="col" className="px-3 py-3 pr-5 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/70">
                    {ops.inHouse.map((reservation) => {
                      const room = getRoom(reservation.roomId);
                      const balance = folio(reservation.id).balance;
                      const name = guestName(reservation.guestId);
                      const initials = name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2);

                      return (
                        <tr key={reservation.id} className="transition-colors hover:bg-[#176938]/[0.04]">
                          <td className="py-3.5 pl-5 pr-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 shadow-xs">
                                {initials}
                              </span>
                              <div>
                                <Link
                                  to={`/reservations/${reservation.id}`}
                                  className="block text-[13px] font-bold text-slate-900 leading-tight hover:text-[#176938]"
                                >
                                  {name}
                                </Link>
                                <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
                                  {reservation.code}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3.5">
                            <span className="rounded-md bg-slate-100/90 px-2.5 py-1 text-xs font-bold text-slate-900 font-mono border border-slate-200/60">
                              {room?.number ?? '—'}
                            </span>
                          </td>

                          <td className="px-3 py-3.5 text-xs font-semibold text-slate-700 font-mono">
                            {shortDate(reservation.departure)}
                          </td>

                          <td className="px-3 py-3.5 text-xs font-extrabold text-slate-900 font-mono tabular-nums">
                            {money(balance)}
                          </td>

                          <td className="px-3 py-3.5 pr-5 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setChangeRoomId(reservation.id)}
                                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-all"
                              >
                                <ArrowRightLeftIcon className="h-3.5 w-3.5 text-[#176938]" />
                                <span>Move</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCheckOutId(reservation.id)}
                                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-all"
                              >
                                Check out
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Desk Shortcuts & Live Vacant Rooms */}
        <div className="space-y-6">
          {/* Card 1: Desk Quick Shortcuts */}
          <div className="glass-card-premium rounded-2xl p-5">
            <h2 className="text-[16px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-[#176938]" />
              <span>Desk Quick Tools</span>
            </h2>
            <div className="mt-3.5 grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => setBookingMode('walk-in')}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-left shadow-xs hover:border-[#176938] hover:bg-white transition-all group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] group-hover:scale-105 transition-transform">
                  <DoorOpenIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Walk-in Check-in</p>
                  <p className="text-[11px] text-slate-500">Fast-track direct room assignment</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBookingMode('reservation')}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-left shadow-xs hover:border-[#176938] hover:bg-white transition-all group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] group-hover:scale-105 transition-transform">
                  <PlusIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">New Booking</p>
                  <p className="text-[11px] text-slate-500">Reserve rooms & manage rates</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/guests')}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-left shadow-xs hover:border-[#176938] hover:bg-white transition-all group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:scale-105 transition-transform">
                  <SearchIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Search Guest Directory</p>
                  <p className="text-[11px] text-slate-500">Find profiles, history & folios</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/rooms')}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-left shadow-xs hover:border-[#176938] hover:bg-white transition-all group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:scale-105 transition-transform">
                  <BedDoubleIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Room Availability Grid</p>
                  <p className="text-[11px] text-slate-500">Check clean status & floor plans</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/guests')}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-left shadow-xs hover:border-[#176938] hover:bg-white transition-all group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:scale-105 transition-transform">
                  <UserPlusIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900">Create Guest Profile</p>
                  <p className="text-[11px] text-slate-500">Register new guest & VIP tiers</p>
                </div>
              </button>
            </div>
          </div>

          {/* Card 2: Vacant & Ready Feed */}
          <div className="glass-card-premium overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 bg-white/40 backdrop-blur-xs">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
                  Vacant & Ready
                </h2>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  {readyRooms.length} sellable rooms available now
                </p>
              </div>
              <span className="rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-bold text-[#176938] border border-[#bbf7d0]">
                Clean
              </span>
            </div>

            {readyRooms.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-slate-400 font-medium">
                No clean vacant rooms — check housekeeping module.
              </div>
            ) : (
              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100/80">
                {readyRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                  >
                    <div>
                      <span className="font-mono text-[14px] font-extrabold text-slate-900 block leading-tight">
                        Room {room.number}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                        {room.type} • {money0(room.rate)}/night
                      </span>
                    </div>

                    <StatusPill tone={housekeepingTone[room.housekeeping]}>
                      {housekeepingLabel[room.housekeeping]}
                    </StatusPill>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Shift Notes Widget */}
          <div className="glass-navy rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-emerald-400" />
                <h3 className="text-[15px] font-bold text-white">Shift Operational Log</h3>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Active Log
              </span>
            </div>
            <div className="mt-3.5 space-y-2.5 text-xs text-slate-300">
              <div className="glass-navy-tile rounded-xl p-3">
                <p className="font-bold text-white">VIP Arrival Scheduled • 15:00</p>
                <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                  Amara Okafor arriving in Room 203. Welcome amenities prepared by housekeeping.
                </p>
              </div>
              <div className="glass-navy-tile rounded-xl p-3">
                <p className="font-bold text-white">Late Checkout Approval</p>
                <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                  Room 101 granted extension until 13:00 EST. Folio balance verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Workflow Dialogs */}
      <NewReservationDialog
        open={bookingMode !== null}
        mode={bookingMode ?? 'reservation'}
        onClose={() => setBookingMode(null)}
        onCreated={(id) => navigate(`/reservations/${id}`)}
      />

      <CheckInDialog open={checkInId !== null} reservationId={checkInId} onClose={() => setCheckInId(null)} />
      <CheckOutDialog
        open={checkOutId !== null}
        reservationId={checkOutId}
        onClose={() => setCheckOutId(null)}
      />

      <ChangeRoomDialog
        open={changeRoomId !== null}
        reservationId={changeRoomId}
        onClose={() => setChangeRoomId(null)}
      />

      <RoomPickerDialog
        open={assignId !== null}
        onClose={() => setAssignId(null)}
        preferredType={assignTarget?.roomType}
        subtitle={
          assignTarget
            ? `${guestName(assignTarget.guestId)} • ${assignTarget.code} • prefers ${assignTarget.roomType}`
            : undefined
        }
        onConfirm={(roomId) => {
          if (assignId) assignRoom(assignId, roomId);
        }}
      />
    </div>
  );
}