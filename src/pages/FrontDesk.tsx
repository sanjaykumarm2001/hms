import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BedDoubleIcon,
  CheckCircle2Icon,
  DoorOpenIcon,
  LogInIcon,
  LogOutIcon,
  ReplaceIcon,
  SearchIcon,
  UserPlusIcon } from
'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import {
  Badge,
  HousekeepingBadge,
  PaymentBadge,
  ReservationBadge } from
'../components/ui/Badge';
import { BookingModal } from '../components/workflows/BookingModal';
import { AssignRoomModal, ChangeRoomModal } from '../components/workflows/RoomActionModals';
import { money, shortDate } from '../utils/format';
import { roomTypeName } from '../data/property';
import type { Reservation } from '../types';

export function FrontDesk() {
  const { ops, guestById, roomById, folio, today } = useHotel();
  const navigate = useNavigate();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Reservation | null>(null);
  const [moveTarget, setMoveTarget] = useState<Reservation | null>(null);

  const shortcuts = [
  {
    label: 'Walk-in',
    detail: 'Create and check in',
    icon: DoorOpenIcon,
    action: () => setWalkInOpen(true)
  },
  {
    label: 'New booking',
    detail: 'Future reservation',
    icon: UserPlusIcon,
    action: () => setBookingOpen(true)
  },
  {
    label: 'Change room',
    detail: 'Move an in-house guest',
    icon: ReplaceIcon,
    action: () => {
      const first = ops.inHouse[0];
      if (first) setMoveTarget(first);
    }
  },
  {
    label: 'Guest directory',
    detail: 'Search profiles',
    icon: SearchIcon,
    action: () => navigate('/guests')
  }];


  return (
    <Page>
      <PageHeader
        eyebrow="Front desk operations"
        title="Desk Console"
        subtitle={`${ops.arrivals.length} arrivals · ${ops.departures.length} departures · ${ops.vacantReady.length} rooms vacant and ready`}
        actions={
        <>
            <Button onClick={() => setWalkInOpen(true)}>
              <DoorOpenIcon className="h-4 w-4" /> Walk-in
            </Button>
            <Button variant="primary" onClick={() => setBookingOpen(true)}>
              <UserPlusIcon className="h-4 w-4" /> New booking
            </Button>
          </>
        } />
      

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card title={`Arrivals (${ops.arrivals.length})`} padded={false}>
            {ops.arrivals.length === 0 ?
            <EmptyState icon={LogInIcon} title="No arrivals left to process" /> :

            <ul className="divide-y divide-line">
                {ops.arrivals.map((res) => {
                const guest = guestById(res.guestId);
                const room = roomById(res.roomId);
                const ready =
                room && (
                room.housekeeping === 'inspected' || room.housekeeping === 'clean');
                return (
                  <li
                    key={res.id}
                    className="flex flex-wrap items-center gap-3 px-4 py-3">
                    
                      {guest &&
                    <Avatar firstName={guest.firstName} lastName={guest.lastName} />
                    }
                      <div className="min-w-[180px] flex-1">
                        <p className="text-[13px] font-medium text-ink">
                          {guest ? `${guest.firstName} ${guest.lastName}` : '—'}
                          {guest?.tier === 'vip' &&
                        <Badge tone="violet" className="ml-2">
                              VIP
                            </Badge>
                        }
                        </p>
                        <p className="text-[11px] text-ink-faint">
                          #{res.confirmation} · {roomTypeName(res.roomType)} ·{' '}
                          {res.adults + res.children} guests
                        </p>
                      </div>
                      <div className="min-w-[130px]">
                        {room ?
                      <div className="flex items-center gap-2">
                            <span className="tabular text-[13px] font-semibold text-ink">
                              {room.number}
                            </span>
                            <HousekeepingBadge status={room.housekeeping} />
                          </div> :

                      <Badge tone="amber">No room</Badge>
                      }
                      </div>
                      <PaymentBadge status={res.paymentStatus} />
                      <div className="ml-auto flex items-center gap-2">
                        {!res.roomId &&
                      <Button size="sm" onClick={() => setAssignTarget(res)}>
                            Assign
                          </Button>
                      }
                        <Link to={`/check-in/${res.id}`}>
                          <Button
                          size="sm"
                          variant={ready ? 'primary' : 'secondary'}>
                          
                            Check in
                          </Button>
                        </Link>
                      </div>
                    </li>);

              })}
              </ul>
            }
          </Card>

          <Card title={`Departures (${ops.departures.length})`} padded={false}>
            {ops.departures.length === 0 ?
            <EmptyState icon={LogOutIcon} title="No departures due today" /> :

            <ul className="divide-y divide-line">
                {ops.departures.map((res) => {
                const guest = guestById(res.guestId);
                const room = roomById(res.roomId);
                const balance = folio(res.id).balance;
                return (
                  <li key={res.id} className="flex items-center gap-3 px-4 py-3">
                      {guest &&
                    <Avatar firstName={guest.firstName} lastName={guest.lastName} />
                    }
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink">
                          {guest ? `${guest.firstName} ${guest.lastName}` : '—'}
                        </p>
                        <p className="text-[11px] text-ink-faint">
                          Room {room?.number ?? '—'} · due{' '}
                          {shortDate(res.departure)}
                          {res.departure < today &&
                        <span className="text-amber-600"> · late</span>
                        }
                        </p>
                      </div>
                      <span className="tabular text-[13px] font-semibold text-ink">
                        {money(balance)}
                      </span>
                      <Link to={`/check-out/${res.id}`}>
                        <Button size="sm" variant="primary">
                          Check out
                        </Button>
                      </Link>
                    </li>);

              })}
              </ul>
            }
          </Card>

          <Card title={`In-house guests (${ops.inHouse.length})`} padded={false}>
            <ul className="divide-y divide-line">
              {ops.inHouse.map((res) => {
                const guest = guestById(res.guestId);
                const room = roomById(res.roomId);
                return (
                  <li key={res.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="tabular w-12 text-[13px] font-semibold text-ink">
                      {room?.number ?? '—'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/bookings/${res.id}`}
                        className="truncate text-[13px] font-medium text-ink hover:text-brand-600">
                        
                        {guest ? `${guest.firstName} ${guest.lastName}` : '—'}
                      </Link>
                      <p className="text-[11px] text-ink-faint">
                        {shortDate(res.arrival)} – {shortDate(res.departure)} ·{' '}
                        {res.source}
                      </p>
                    </div>
                    <ReservationBadge status={res.status} />
                    <Button size="sm" onClick={() => setMoveTarget(res)}>
                      Move
                    </Button>
                  </li>);

              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Desk shortcuts">
            <div className="grid grid-cols-2 gap-2">
              {shortcuts.map((s) =>
              <button
                key={s.label}
                type="button"
                onClick={s.action}
                className="rounded-lg border border-line px-3 py-3 text-left transition-colors duration-150 ease-out hover:bg-slate-50">
                
                  <s.icon className="mb-2 h-4 w-4 text-brand-600" />
                  <span className="block text-[12px] font-semibold text-ink">
                    {s.label}
                  </span>
                  <span className="block text-[11px] text-ink-faint">{s.detail}</span>
                </button>
              )}
            </div>
          </Card>

          <Card
            title={`Vacant & ready (${ops.vacantReady.length})`}
            padded={false}>
            
            {ops.vacantReady.length === 0 ?
            <EmptyState icon={BedDoubleIcon} title="No ready rooms" /> :

            <ul className="max-h-[260px] divide-y divide-line overflow-y-auto">
                {ops.vacantReady.map((room) =>
              <li
                key={room.id}
                className="flex items-center gap-3 px-4 py-2.5">
                
                    <span className="tabular w-12 text-[13px] font-semibold text-ink">
                      {room.number}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-ink-muted">
                      {roomTypeName(room.type)}
                    </span>
                    <HousekeepingBadge status={room.housekeeping} />
                  </li>
              )}
              </ul>
            }
          </Card>

          <Card title="Payment issues" padded={false}>
            {ops.outstanding.length === 0 ?
            <EmptyState icon={CheckCircle2Icon} title="No balances flagged" /> :

            <ul className="divide-y divide-line">
                {ops.outstanding.slice(0, 5).map((row) =>
              <li key={row.reservation.id} className="px-4 py-3">
                    <Link
                  to={`/bookings/${row.reservation.id}`}
                  className="flex items-center gap-3">
                  
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {row.guest ?
                      `${row.guest.firstName} ${row.guest.lastName}` :
                      '—'}
                        </span>
                        <span className="block text-[11px] text-ink-faint">
                          #{row.reservation.confirmation}
                        </span>
                      </span>
                      <span className="tabular text-[13px] font-semibold text-red-600">
                        {money(row.balance)}
                      </span>
                    </Link>
                  </li>
              )}
              </ul>
            }
          </Card>
        </div>
      </div>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <BookingModal open={walkInOpen} onClose={() => setWalkInOpen(false)} walkIn />
      {assignTarget &&
      <AssignRoomModal
        open
        reservation={assignTarget}
        onClose={() => setAssignTarget(null)} />

      }
      {moveTarget &&
      <ChangeRoomModal
        open
        reservation={moveTarget}
        onClose={() => setMoveTarget(null)} />

      }
    </Page>);

}