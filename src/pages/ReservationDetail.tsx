import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  BanknoteIcon,
  CalendarPlusIcon,
  LogInIcon,
  LogOutIcon,
  PlusIcon,
  PrinterIcon,
  ReplaceIcon,
  XCircleIcon } from
'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge, PaymentBadge, ReservationBadge } from '../components/ui/Badge';
import { AddChargeModal } from '../components/workflows/AddChargeModal';
import { AddPaymentModal } from '../components/workflows/AddPaymentModal';
import {
  AssignRoomModal,
  CancelReservationModal,
  ChangeRoomModal,
  ExtendStayModal } from
'../components/workflows/RoomActionModals';
import { longDate, money, nights, timeAgo, titleize } from '../utils/format';
import { roomTypeName } from '../data/property';

export function ReservationDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { reservationById, guestById, roomById, folio } = useHotel();
  const [chargeOpen, setChargeOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const reservation = reservationById(id);
  if (!reservation) {
    return (
      <Page>
        <PageHeader title="Reservation not found" />
        <Link to="/bookings">
          <Button variant="primary">Back to bookings</Button>
        </Link>
      </Page>);

  }

  const guest = guestById(reservation.guestId);
  const room = roomById(reservation.roomId);
  const f = folio(reservation.id);
  const stay = nights(reservation.arrival, reservation.departure);
  const cancellable =
  reservation.status === 'confirmed' || reservation.status === 'tentative';

  return (
    <Page>
      <button
        type="button"
        onClick={() => navigate('/bookings')}
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted transition-colors duration-150 ease-out hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" /> All bookings
      </button>

      <PageHeader
        eyebrow={`Reservation · ${reservation.source}`}
        title={`#${reservation.confirmation}`}
        subtitle={`${guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown guest'} · ${longDate(reservation.arrival)} → ${longDate(reservation.departure)} · ${stay} night${stay > 1 ? 's' : ''}`}
        actions={
        <>
            <ReservationBadge status={reservation.status} />
            <PaymentBadge status={reservation.paymentStatus} />
          </>
        } />
      

      <div className="mb-4 flex flex-wrap gap-2">
        {reservation.status === 'confirmed' || reservation.status === 'tentative' ?
        <Link to={`/check-in/${reservation.id}`}>
            <Button variant="primary">
              <LogInIcon className="h-4 w-4" /> Check in
            </Button>
          </Link> :
        null}
        {reservation.status === 'in_house' &&
        <Link to={`/check-out/${reservation.id}`}>
            <Button variant="primary">
              <LogOutIcon className="h-4 w-4" /> Check out
            </Button>
          </Link>
        }
        <Button onClick={() => setPaymentOpen(true)}>
          <BanknoteIcon className="h-4 w-4" /> Record payment
        </Button>
        <Button onClick={() => setChargeOpen(true)}>
          <PlusIcon className="h-4 w-4" /> Add charge
        </Button>
        {reservation.roomId ?
        <Button onClick={() => setMoveOpen(true)}>
            <ReplaceIcon className="h-4 w-4" /> Change room
          </Button> :

        <Button onClick={() => setAssignOpen(true)}>
            <ReplaceIcon className="h-4 w-4" /> Assign room
          </Button>
        }
        <Button onClick={() => setExtendOpen(true)}>
          <CalendarPlusIcon className="h-4 w-4" /> Extend stay
        </Button>
        <Link to={`/billing/${reservation.id}`}>
          <Button>
            <PrinterIcon className="h-4 w-4" /> Invoice
          </Button>
        </Link>
        {cancellable &&
        <Button variant="danger" onClick={() => setCancelOpen(true)}>
            <XCircleIcon className="h-4 w-4" /> Cancel
          </Button>
        }
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Stay details">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {[
              { label: 'Room', value: room ? room.number : 'Unassigned' },
              { label: 'Room type', value: roomTypeName(reservation.roomType) },
              { label: 'Nightly rate', value: money(reservation.rate) },
              {
                label: 'Occupancy',
                value: `${reservation.adults} adults · ${reservation.children} children`
              },
              { label: 'Arrival', value: longDate(reservation.arrival) },
              { label: 'Departure', value: longDate(reservation.departure) },
              { label: 'Keycards', value: String(reservation.keyCards) },
              {
                label: 'Housekeeping',
                value: room ? titleize(room.housekeeping) : '—'
              }].
              map((item) =>
              <div key={item.label}>
                  <dt className="text-[11px] font-medium text-ink-faint">
                    {item.label}
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-medium text-ink">
                    {item.value}
                  </dd>
                </div>
              )}
            </dl>
            {reservation.requests &&
            <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  Guest requests
                </p>
                <p className="mt-0.5 text-[13px] text-amber-900">
                  {reservation.requests}
                </p>
              </div>
            }
            {reservation.accompanying.length > 0 &&
            <div className="mt-4">
                <p className="text-[11px] font-medium text-ink-faint">
                  Accompanying guests
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {reservation.accompanying.map((name) =>
                <Badge key={name} tone="neutral">
                      {name}
                    </Badge>
                )}
                </div>
              </div>
            }
          </Card>

          <Card title="Folio" padded={false}>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  <th className="px-4 py-2">Posted</th>
                  <th className="px-2 py-2">Description</th>
                  <th className="px-2 py-2 text-right">Qty</th>
                  <th className="px-2 py-2 text-right">Unit</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {f.charges.length === 0 &&
                <tr>
                    <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-[13px] text-ink-muted">
                    
                      No charges posted yet.
                    </td>
                  </tr>
                }
                {f.charges.map((charge) =>
                <tr key={charge.id}>
                    <td className="px-4 py-2.5 text-[12px] text-ink-faint">
                      {timeAgo(charge.postedAt)}
                    </td>
                    <td className="px-2 py-2.5">
                      <p className="text-[13px] text-ink">{charge.description}</p>
                      <p className="text-[11px] text-ink-faint">
                        {titleize(charge.code)} · posted by {charge.by}
                      </p>
                    </td>
                    <td className="tabular px-2 py-2.5 text-right text-[13px] text-ink-muted">
                      {charge.qty}
                    </td>
                    <td className="tabular px-2 py-2.5 text-right text-[13px] text-ink-muted">
                      {money(charge.unitPrice)}
                    </td>
                    <td className="tabular px-4 py-2.5 text-right text-[13px] font-semibold text-ink">
                      {money(charge.qty * charge.unitPrice)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-[12px] text-ink-muted">
                    Charges
                  </td>
                  <td className="tabular px-4 py-2 text-right text-[13px] font-semibold text-ink">
                    {money(f.chargeTotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-[12px] text-ink-muted">
                    Payments &amp; deposits
                  </td>
                  <td className="tabular px-4 py-2 text-right text-[13px] font-semibold text-emerald-700">
                    −{money(f.paidTotal)}
                  </td>
                </tr>
                <tr className="border-t border-line">
                  <td colSpan={4} className="px-4 py-2.5 text-[13px] font-semibold text-ink">
                    Outstanding balance
                  </td>
                  <td className="tabular px-4 py-2.5 text-right text-[15px] font-semibold text-ink">
                    {money(f.balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>

          <Card title="Payments" padded={false}>
            {f.payments.length === 0 ?
            <p className="px-4 py-6 text-center text-[13px] text-ink-muted">
                No payments recorded.
              </p> :

            <ul className="divide-y divide-line">
                {f.payments.map((payment) =>
              <li
                key={payment.id}
                className="flex items-center gap-3 px-4 py-2.5">
                
                    <Badge tone={payment.kind === 'refund' ? 'red' : 'green'}>
                      {titleize(payment.kind)}
                    </Badge>
                    <span className="min-w-0 flex-1 text-[13px] text-ink">
                      {titleize(payment.method)}
                      <span className="text-ink-faint"> · {payment.by}</span>
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      {timeAgo(payment.at)}
                    </span>
                    <span className="tabular text-[13px] font-semibold text-ink">
                      {money(payment.amount)}
                    </span>
                  </li>
              )}
              </ul>
            }
          </Card>
        </div>

        <div className="space-y-4">
          {guest &&
          <Card title="Guest">
              <div className="flex items-center gap-3">
                <Avatar
                firstName={guest.firstName}
                lastName={guest.lastName}
                size="lg" />
              
                <div className="min-w-0">
                  <Link
                  to={`/guests/${guest.id}`}
                  className="block truncate text-[15px] font-semibold text-ink hover:text-brand-600">
                  
                    {guest.firstName} {guest.lastName}
                  </Link>
                  <p className="text-[12px] text-ink-muted">
                    {titleize(guest.tier)} · {titleize(guest.segment)} ·{' '}
                    {guest.stays} stays
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-2.5 border-t border-line pt-4">
                {[
              { label: 'Email', value: guest.email },
              { label: 'Phone', value: guest.phone },
              { label: 'Country', value: guest.country },
              {
                label: 'ID document',
                value: guest.idNumber ?
                `${guest.idType} · ${guest.idNumber}` :
                'Not captured'
              }].
              map((row) =>
              <div key={row.label} className="flex justify-between gap-3">
                    <dt className="text-[12px] text-ink-faint">{row.label}</dt>
                    <dd className="truncate text-[12px] font-medium text-ink">
                      {row.value}
                    </dd>
                  </div>
              )}
              </dl>
            </Card>
          }

          <Card title="Reservation history" padded={false}>
            <ol className="divide-y divide-line">
              {reservation.history.map((entry) =>
              <li key={entry.id} className="px-4 py-3">
                  <p className="text-[13px] text-ink">{entry.text}</p>
                  <p className="mt-0.5 text-[11px] text-ink-faint">
                    {entry.by} · {timeAgo(entry.at)}
                  </p>
                </li>
              )}
            </ol>
          </Card>
        </div>
      </div>

      <AddChargeModal
        open={chargeOpen}
        onClose={() => setChargeOpen(false)}
        reservationId={reservation.id} />
      
      <AddPaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        reservationId={reservation.id} />
      
      <AssignRoomModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        reservation={reservation} />
      
      <ChangeRoomModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        reservation={reservation} />
      
      <ExtendStayModal
        open={extendOpen}
        onClose={() => setExtendOpen(false)}
        reservation={reservation} />
      
      <CancelReservationModal
        open={cancelOpen}
        onClose={() => {
          setCancelOpen(false);
          toast.dismiss();
        }}
        reservation={reservation} />
      
    </Page>);

}