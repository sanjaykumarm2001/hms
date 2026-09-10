import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, DoorOpenIcon, PlusIcon } from 'lucide-react';
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
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Reservations"
        subtitle={`${reservations.length} reservations in the system · ${ops.arrivals.length} arriving today`}
        actions={
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={() => { setBookingMode('walk-in'); setDialogOpen(true); }}>
              <DoorOpenIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
              Walk-in
            </SecondaryButton>
            <PrimaryButton gradient onClick={() => { setBookingMode('reservation'); setDialogOpen(true); }}>
              <PlusIcon aria-hidden="true" className="h-4 w-4" />
              New reservation
            </PrimaryButton>
          </div>
        } />
      

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
      <Card className="overflow-hidden">
          {rows.length === 0 ?
        <EmptyState
          title="No reservations match"
          detail="Adjust the search or status filter to see more reservations." /> :


        <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead>
                  <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Guest</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Reservation</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Stay</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Room</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Folio</th>
                    <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((reservation) => {
                const room = getRoom(reservation.roomId);
                const f = folio(reservation.id);
                return (
                  <tr
                    key={reservation.id}
                    onClick={() => navigate(`/reservations/${reservation.id}`)}
                    className="cursor-pointer transition-colors duration-150 hover:bg-emerald-50/60">
                    
                        <td className="py-3 pl-5 pr-3">
                          <p className="text-[13px] font-semibold text-ink">
                            {guestName(reservation.guestId)}
                          </p>
                          <p className="text-[11px] text-ink-muted">{reservation.source}</p>
                        </td>
                        <td className="tabular px-3 py-3 text-[12px] font-semibold text-ink-soft">
                          {reservation.code}
                        </td>
                        <td className="tabular px-3 py-3 text-[12px] text-ink-soft">
                          {shortDate(reservation.arrival)} → {shortDate(reservation.departure)}
                          <span className="block text-[11px] text-ink-muted">
                            {nightsBetween(reservation.arrival, reservation.departure)} night(s) ·{' '}
                            {reservation.roomType}
                          </span>
                        </td>
                        <td className="tabular px-3 py-3 text-[13px] font-semibold text-ink">
                          {room?.number ?? <span className="text-ink-muted">—</span>}
                        </td>
                        <td className="px-3 py-3">
                          <StatusPill tone={reservationTone[reservation.status]}>
                            {reservationLabel[reservation.status]}
                          </StatusPill>
                        </td>
                        <td className="px-3 py-3">
                          <StatusPill tone={paymentTone[reservation.paymentStatus]} dot={false}>
                            {paymentLabel[reservation.paymentStatus]}
                          </StatusPill>
                        </td>
                        <td className="tabular px-3 py-3 pr-5 text-right text-[13px] font-semibold text-ink">
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
        mode="reservation"
        onClose={() => setDialogOpen(false)}
        onCreated={(id) => navigate(`/reservations/${id}`)} />
      
    </div>);

}