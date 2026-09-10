import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightLeftIcon,
  BedDoubleIcon,
  DoorOpenIcon,
  LogInIcon,
  LogOutIcon,
  PlusIcon,
  SearchIcon,
  UserPlusIcon } from
'lucide-react';
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  StatusPill } from
'../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { CheckInDialog } from '../components/workflows/CheckInDialog';
import { CheckOutDialog } from '../components/workflows/CheckOutDialog';
import { NewReservationDialog } from '../components/workflows/NewReservationDialog';
import { RoomPickerDialog } from '../components/workflows/RoomPickerDialog';
import { ChangeRoomDialog } from '../components/workflows/ChangeRoomDialog';
import { housekeepingLabel, housekeepingTone, paymentLabel, paymentTone } from '../utils/tone';
import { money, money0, shortDate } from '../utils/format';

export function FrontDesk() {
  const navigate = useNavigate();
  const { ops, rooms, guestName, getRoom, folio, assignRoom, getReservation } = useHotel();

  const [bookingMode, setBookingMode] = useState<'reservation' | 'walk-in' | null>(null);
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [checkOutId, setCheckOutId] = useState<string | null>(null);
  const [assignId, setAssignId] = useState<string | null>(null);
  const [changeRoomId, setChangeRoomId] = useState<string | null>(null);

  const assignTarget = assignId ? getReservation(assignId) : undefined;
  const readyRooms = rooms.
  filter(
    (room) =>
    ops.statusByRoom[room.id] === 'available' && (
    room.housekeeping === 'clean' || room.housekeeping === 'inspected')
  ).
  sort((a, b) => a.number.localeCompare(b.number));

  const paymentIssues = ops.outstanding.filter((row) => row.reservation.status === 'in-house');

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Front Desk"
        subtitle="The desk workspace for arrivals, departures, walk-ins and in-house guests."
        actions={
        <>
            <SecondaryButton onClick={() => setBookingMode('walk-in')}>
              <DoorOpenIcon aria-hidden="true" className="h-4 w-4" />
              Walk-in
            </SecondaryButton>
            <PrimaryButton gradient onClick={() => setBookingMode('reservation')}>
              <PlusIcon aria-hidden="true" className="h-4 w-4" />
              New booking
            </PrimaryButton>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <CardHeader
              title="Arrivals"
              subtitle={`${ops.arrivals.length} expected · ${ops.unassignedArrivals.length} still need a room`} />
            
            {ops.arrivals.length === 0 ?
            <EmptyState title="No arrivals today" detail="Nothing is due to check in for this date." /> :

            <ul className="divide-y divide-line border-t border-line">
                {ops.arrivals.map((reservation) => {
                const room = getRoom(reservation.roomId);
                const ready =
                room && (room.housekeeping === 'clean' || room.housekeeping === 'inspected');
                return (
                  <li
                    key={reservation.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-[#fafbf8]">
                    
                      <div className="min-w-[180px] flex-1">
                        <Link
                        to={`/reservations/${reservation.id}`}
                        className="text-[13px] font-semibold text-ink hover:text-brand-700">
                        
                          {guestName(reservation.guestId)}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          {reservation.code} · {reservation.roomType} · {reservation.adults}A
                          {reservation.children > 0 ? ` ${reservation.children}C` : ''} ·{' '}
                          {shortDate(reservation.arrival)} → {shortDate(reservation.departure)}
                        </p>
                      </div>
                      <div className="tabular w-[92px] text-[13px] font-semibold text-ink">
                        {room ? `Room ${room.number}` : <span className="text-ink-muted">No room</span>}
                      </div>
                      <div className="w-[104px]">
                        {room ?
                      <StatusPill tone={housekeepingTone[room.housekeeping]}>
                            {housekeepingLabel[room.housekeeping]}
                          </StatusPill> :

                      <StatusPill tone="amber">Assign</StatusPill>
                      }
                      </div>
                      <div className="flex items-center gap-2">
                        {!room ?
                      <SecondaryButton className="px-3 py-2" onClick={() => setAssignId(reservation.id)}>
                            <BedDoubleIcon aria-hidden="true" className="h-4 w-4" />
                            Assign room
                          </SecondaryButton> :
                      null}
                        <PrimaryButton
                        className="px-3 py-2"
                        onClick={() => setCheckInId(reservation.id)}
                        disabled={!room}
                        title={!room ? 'Assign a room first' : ready ? undefined : 'Room not inspected yet'}>
                        
                          <LogInIcon aria-hidden="true" className="h-4 w-4" />
                          Check in
                        </PrimaryButton>
                      </div>
                    </li>);

              })}
              </ul>
            }
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Departures"
              subtitle={`${ops.departures.length} due to check out today`} />
            
            {ops.departures.length === 0 ?
            <EmptyState title="No departures today" detail="No in-house guest is due to depart." /> :

            <ul className="divide-y divide-line border-t border-line">
                {ops.departures.map((reservation) => {
                const room = getRoom(reservation.roomId);
                const balance = folio(reservation.id).balance;
                return (
                  <li
                    key={reservation.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-[#fafbf8]">
                    
                      <div className="min-w-[180px] flex-1">
                        <Link
                        to={`/reservations/${reservation.id}`}
                        className="text-[13px] font-semibold text-ink hover:text-brand-700">
                        
                          {guestName(reservation.guestId)}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          {reservation.code} · Room {room?.number ?? '—'} · {reservation.source}
                        </p>
                      </div>
                      <div className="tabular w-[110px] text-[13px] font-semibold text-ink">
                        {money(balance)}
                      </div>
                      <div className="w-[92px]">
                        <StatusPill tone={paymentTone[reservation.paymentStatus]}>
                          {paymentLabel[reservation.paymentStatus]}
                        </StatusPill>
                      </div>
                      <PrimaryButton className="px-3 py-2" onClick={() => setCheckOutId(reservation.id)}>
                        <LogOutIcon aria-hidden="true" className="h-4 w-4" />
                        Check out
                      </PrimaryButton>
                    </li>);

              })}
              </ul>
            }
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="In-house guests"
              subtitle={`${ops.inHouse.length} occupied rooms · ${ops.stayovers.length} stayovers`} />
            
            {ops.inHouse.length === 0 ?
            <EmptyState title="No guests in house" detail="Check in an arrival or create a walk-in." /> :

            <table className="w-full border-t border-line text-left">
                <thead>
                  <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Guest</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Room</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Departure</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Balance</th>
                    <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {ops.inHouse.map((reservation) => {
                  const room = getRoom(reservation.roomId);
                  return (
                    <tr key={reservation.id} className="transition-colors duration-150 hover:bg-[#fafbf8]">
                        <td className="py-3 pl-5 pr-3">
                          <Link
                          to={`/reservations/${reservation.id}`}
                          className="text-[13px] font-semibold text-ink hover:text-brand-700">
                          
                            {guestName(reservation.guestId)}
                          </Link>
                          <p className="text-[11px] text-ink-muted">{reservation.code}</p>
                        </td>
                        <td className="tabular px-3 py-3 text-[13px] font-semibold text-ink">
                          {room?.number ?? '—'}
                        </td>
                        <td className="tabular px-3 py-3 text-[13px] text-ink-soft">
                          {shortDate(reservation.departure)}
                        </td>
                        <td className="tabular px-3 py-3 text-[13px] text-ink-soft">
                          {money(folio(reservation.id).balance)}
                        </td>
                        <td className="px-3 py-3 pr-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <SecondaryButton
                            className="px-2.5 py-1.5"
                            onClick={() => setChangeRoomId(reservation.id)}>
                            
                              <ArrowRightLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
                              Move
                            </SecondaryButton>
                            <SecondaryButton
                            className="px-2.5 py-1.5"
                            onClick={() => setCheckOutId(reservation.id)}>
                            
                              Check out
                            </SecondaryButton>
                          </div>
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            }
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Desk shortcuts</h2>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <SecondaryButton className="justify-start" onClick={() => setBookingMode('walk-in')}>
                <DoorOpenIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                Walk-in check-in
              </SecondaryButton>
              <SecondaryButton className="justify-start" onClick={() => setBookingMode('reservation')}>
                <PlusIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                New booking
              </SecondaryButton>
              <SecondaryButton className="justify-start" onClick={() => navigate('/guests')}>
                <SearchIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                Search guest
              </SecondaryButton>
              <SecondaryButton className="justify-start" onClick={() => navigate('/rooms')}>
                <BedDoubleIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                Room availability
              </SecondaryButton>
              <SecondaryButton className="justify-start" onClick={() => navigate('/guests')}>
                <UserPlusIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                Create guest profile
              </SecondaryButton>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Vacant & ready" subtitle={`${readyRooms.length} rooms sellable now`} />
            {readyRooms.length === 0 ?
            <p className="border-t border-line px-5 py-8 text-center text-[12px] text-ink-muted">
                No clean vacant rooms — check housekeeping.
              </p> :

            <ul className="max-h-[260px] divide-y divide-line overflow-y-auto border-t border-line">
                {readyRooms.map((room) =>
              <li key={room.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <span>
                      <span className="tabular block text-[13px] font-semibold text-ink">
                        {room.number}
                      </span>
                      <span className="block text-[11px] text-ink-muted">
                        {room.type} · {money0(room.rate)}
                      </span>
                    </span>
                    <StatusPill tone={housekeepingTone[room.housekeeping]}>
                      {housekeepingLabel[room.housekeeping]}
                    </StatusPill>
                  </li>
              )}
              </ul>
            }
          </Card>

          <Card className="overflow-hidden">
            <CardHeader
              title="Payment issues"
              subtitle={`${paymentIssues.length} in-house folios with a balance`} />
            
            {paymentIssues.length === 0 ?
            <p className="border-t border-line px-5 py-8 text-center text-[12px] text-ink-muted">
                All in-house folios are current.
              </p> :

            <ul className="divide-y divide-line border-t border-line">
                {paymentIssues.slice(0, 6).map(({ reservation, balance }) =>
              <li key={reservation.id}>
                    <Link
                  to={`/billing/${reservation.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-2.5 transition-colors duration-150 hover:bg-[#fafbf8]">
                  
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-ink">
                          {guestName(reservation.guestId)}
                        </span>
                        <span className="block text-[11px] text-ink-muted">
                          Room {getRoom(reservation.roomId)?.number ?? '—'}
                        </span>
                      </span>
                      <span className="tabular text-[13px] font-bold text-ink">{money(balance)}</span>
                    </Link>
                  </li>
              )}
              </ul>
            }
          </Card>
        </div>
      </div>

      <NewReservationDialog
        open={bookingMode !== null}
        mode={bookingMode ?? 'reservation'}
        onClose={() => setBookingMode(null)}
        onCreated={(id) => navigate(`/reservations/${id}`)} />
      
      <CheckInDialog open={checkInId !== null} reservationId={checkInId} onClose={() => setCheckInId(null)} />
      <CheckOutDialog
        open={checkOutId !== null}
        reservationId={checkOutId}
        onClose={() => setCheckOutId(null)} />
      
      <ChangeRoomDialog
        open={changeRoomId !== null}
        reservationId={changeRoomId}
        onClose={() => setChangeRoomId(null)} />
      
      <RoomPickerDialog
        open={assignId !== null}
        onClose={() => setAssignId(null)}
        preferredType={assignTarget?.roomType}
        subtitle={
        assignTarget ?
        `${guestName(assignTarget.guestId)} · ${assignTarget.code} · prefers ${assignTarget.roomType}` :
        undefined
        }
        onConfirm={(roomId) => {
          if (assignId) assignRoom(assignId, roomId);
        }} />
      
    </div>);

}