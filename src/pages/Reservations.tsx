import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, DoorOpenIcon, LogOutIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { AvailabilityView } from '../components/reservations/AvailabilityView';
import { CalendarView } from '../components/reservations/CalendarView';
import {
  Card,
  EmptyState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SearchInput,
  SelectInput,
  StatusPill,
  Tabs
} from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { NewReservationDialog } from '../components/workflows/NewReservationDialog';
import type { ReservationStatus } from '../types/hotel';
import { money, nightsBetween, shortDate } from '../utils/format';
import { paymentLabel, paymentTone, reservationLabel, reservationTone } from '../utils/tone';

type View = 'list' | 'calendar' | 'availability';
type SortKey = 'arrival' | 'guest' | 'created' | 'value';

export function Reservations() {
  const navigate = useNavigate();
  const { reservations, guestName, getRoom, folio, ops } = useHotel();
  const [view, setView] = useState<View>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingMode, setBookingMode] = useState<'reservation' | 'walk-in'>('reservation');

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ReservationStatus>('all');
  const [sort, setSort] = useState<SortKey>('arrival');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations.
    filter((r) => status === 'all' ? true : r.status === status).
    filter((r) =>
    q ?
    [r.code, guestName(r.guestId), r.roomType, getRoom(r.roomId)?.number ?? '', r.source].
    join(' ').
    toLowerCase().
    includes(q) :
    true
    ).
    sort((a, b) => {
      if (sort === 'arrival') return a.arrival.localeCompare(b.arrival);
      if (sort === 'guest') return guestName(a.guestId).localeCompare(guestName(b.guestId));
      if (sort === 'created') return b.createdAt.localeCompare(a.createdAt);
      return (
        folio(b.id).chargeTotal - folio(a.id).chargeTotal ||
        b.rate * nightsBetween(b.arrival, b.departure) - a.rate * nightsBetween(b.arrival, b.departure));

    });
  }, [folio, getRoom, guestName, query, reservations, sort, status]);

  const statusCounts = useMemo(() => {
    return reservations.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [reservations]);

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
              Reservations & Bookings
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#176938]">
              <span className="h-2 w-2 rounded-full bg-[#176938] animate-pulse" />
              LIVE RESERVATIONS DESK
            </span>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 font-normal">
            {reservations.length} total reservations · {ops.arrivals.length} arriving today · {ops.inHouse.length} in-house
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <SecondaryButton onClick={() => { setBookingMode('walk-in'); setDialogOpen(true); }}>
            <DoorOpenIcon aria-hidden="true" className="h-4 w-4" />
            Walk-in Check-in
          </SecondaryButton>
          <PrimaryButton gradient onClick={() => { setBookingMode('reservation'); setDialogOpen(true); }}>
            <PlusIcon aria-hidden="true" className="h-4 w-4" />
            New reservation
          </PrimaryButton>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              TOTAL BOOKINGS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-xs">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {reservations.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">All Reservations</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              ARRIVING TODAY
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] shadow-xs">
              <DoorOpenIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {ops.arrivals.length}
            </span>
            <span className="text-xs font-semibold text-[#176938]">Expected Arrivals</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              IN-HOUSE GUESTS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7] shadow-xs">
              <UsersIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {ops.inHouse.length}
            </span>
            <span className="text-xs font-semibold text-[#0284c7]">Currently Checked-in</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              DEPARTURES TODAY
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fef3c7] text-[#b45309] shadow-xs">
              <LogOutIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {ops.departures.length}
            </span>
            <span className="text-xs font-semibold text-[#b45309]">Checking Out</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
          { id: 'list', label: 'List view', count: rows.length },
          { id: 'calendar', label: 'Calendar view' },
          { id: 'availability', label: 'Availability view' }]
          }
          active={view}
          onChange={(next) => setView(next as View)} />
        
        {view === 'list' ?
        <div className="flex flex-wrap items-center gap-2.5">
            <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search guest, code, room…"
            className="w-[240px]" />
          
            <SelectInput
            value={status}
            onChange={(event) => setStatus(event.target.value as 'all' | ReservationStatus)}
            className="w-[160px]"
            aria-label="Filter by status">
            
              <option value="all">All statuses</option>
              {(
            ['confirmed', 'tentative', 'in-house', 'checked-out', 'cancelled'] as ReservationStatus[]).
            map((value) =>
            <option key={value} value={value}>
                  {reservationLabel[value]} ({statusCounts[value] ?? 0})
                </option>
            )}
            </SelectInput>
            <SelectInput
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="w-[168px]"
            aria-label="Sort reservations">
            
              <option value="arrival">Sort: arrival date</option>
              <option value="guest">Sort: guest name</option>
              <option value="created">Sort: newest first</option>
              <option value="value">Sort: folio value</option>
            </SelectInput>
          </div> :
        null}
      </div>

      {view === 'list' ?
      <Card className="glass-card-premium p-0 border border-slate-200/80 shadow-md backdrop-blur-md rounded-2xl overflow-hidden">
          {rows.length === 0 ?
        <EmptyState
          title="No reservations match"
          detail="Adjust the search or status filter to see more reservations." /> :


        <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <th scope="col" className="py-3 pl-5 pr-3 font-semibold">Guest</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Code</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Stay Period</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Room</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Payment</th>
                    <th scope="col" className="px-3 py-3 pr-5 text-right font-semibold">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((reservation) => {
                const room = getRoom(reservation.roomId);
                const f = folio(reservation.id);
                return (
                  <tr
                    key={reservation.id}
                    onClick={() => navigate(`/reservations/${reservation.id}`)}
                    className="cursor-pointer transition-colors duration-150 hover:bg-emerald-50/50">
                    
                        <td className="py-3.5 pl-5 pr-3">
                          <p className="text-xs font-bold text-slate-900">
                            {guestName(reservation.guestId)}
                          </p>
                          <p className="text-[11px] text-slate-500">{reservation.source}</p>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {reservation.code}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <CalendarDaysIcon className="h-3.5 w-3.5 text-[#176938]" />
                            {shortDate(reservation.arrival)} → {shortDate(reservation.departure)}
                            <span className="text-slate-400 font-normal">
                              ({nightsBetween(reservation.arrival, reservation.departure)}N · {reservation.roomType})
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-xs font-bold text-slate-900">
                          {room?.number ? (
                            <span className="bg-emerald-50 text-[#176938] px-2 py-0.5 rounded border border-emerald-200">
                              Rm {room.number}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">Unassigned</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          <StatusPill tone={reservationTone[reservation.status]}>
                            {reservationLabel[reservation.status]}
                          </StatusPill>
                        </td>
                        <td className="px-3 py-3.5">
                          <StatusPill tone={paymentTone[reservation.paymentStatus]} dot={false}>
                            {paymentLabel[reservation.paymentStatus]}
                          </StatusPill>
                        </td>
                        <td className="px-3 py-3.5 pr-5 text-right text-xs font-bold text-slate-900">
                          {money(f.balance)}
                        </td>
                      </tr>);

              })}
                </tbody>
              </table>
            </div>
        }
        </Card> :
      null}

      {view === 'calendar' ? <CalendarView /> : null}
      {view === 'availability' ? <AvailabilityView /> : null}

      <NewReservationDialog
        open={dialogOpen}
        mode={bookingMode}
        onClose={() => setDialogOpen(false)}
        onCreated={(id) => navigate(`/reservations/${id}`)} />
      
    </div>);

}