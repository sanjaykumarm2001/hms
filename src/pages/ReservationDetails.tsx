import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightLeftIcon,
  BedDoubleIcon,
  CalendarPlusIcon,
  CreditCardIcon,
  LogInIcon,
  LogOutIcon,
  PlusIcon,
  PrinterIcon,
  XCircleIcon } from
'lucide-react';
import {
  Card,
  CardHeader,
  DangerButton,
  KeyValue,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  StatusPill } from
'../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { CheckInDialog } from '../components/workflows/CheckInDialog';
import { CheckOutDialog } from '../components/workflows/CheckOutDialog';
import { AddChargeDialog } from '../components/workflows/AddChargeDialog';
import { RecordPaymentDialog } from '../components/workflows/RecordPaymentDialog';
import { ExtendStayDialog } from '../components/workflows/ExtendStayDialog';
import { ChangeRoomDialog } from '../components/workflows/ChangeRoomDialog';
import { CancelReservationDialog } from '../components/workflows/CancelReservationDialog';
import { RoomPickerDialog } from '../components/workflows/RoomPickerDialog';
import {
  housekeepingLabel,
  housekeepingTone,
  paymentLabel,
  paymentTone,
  reservationLabel,
  reservationTone,
  roomStatusLabel,
  roomStatusTone } from
'../utils/tone';
import { dateTime, longDate, money, money0, nightsBetween, shortDate } from '../utils/format';

export function ReservationDetails() {
  const { reservationId = '' } = useParams();
  const navigate = useNavigate();
  const { getReservation, getGuest, getRoom, folio, roomStatus, assignRoom } = useHotel();

  const [dialog, setDialog] = useState<
    'check-in' | 'check-out' | 'charge' | 'payment' | 'extend' | 'change-room' | 'assign' | 'cancel' | null>(
    null);

  const reservation = getReservation(reservationId);

  if (!reservation) {
    return (
      <Card className="p-10 text-center">
        <p className="text-[14px] font-semibold text-ink">Reservation not found</p>
        <p className="mt-1 text-[12px] text-ink-muted">
          It may have been removed. Return to the reservation list to continue.
        </p>
        <div className="mt-4 flex justify-center">
          <SecondaryButton onClick={() => navigate('/reservations')}>
            Back to reservations
          </SecondaryButton>
        </div>
      </Card>);

  }

  const guest = getGuest(reservation.guestId);
  const room = getRoom(reservation.roomId);
  const f = folio(reservation.id);
  const nights = nightsBetween(reservation.arrival, reservation.departure);
  const isActive = reservation.status !== 'cancelled' && reservation.status !== 'checked-out';

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/reservations')}
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft transition-colors duration-150 hover:text-ink">
        
        <ArrowLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
        All reservations
      </button>

      <PageHeader
        eyebrow={reservation.code}
        title={guest ? `${guest.firstName} ${guest.lastName}` : 'Reservation'}
        subtitle={`${longDate(reservation.arrival)} → ${longDate(reservation.departure)} · ${nights} night(s) · ${
        reservation.adults} adult(s)${
        reservation.children ? `, ${reservation.children} child(ren)` : ''}`}
        badge={
        <div className="flex items-center gap-2">
            <StatusPill tone={reservationTone[reservation.status]}>
              {reservationLabel[reservation.status]}
            </StatusPill>
            <StatusPill tone={paymentTone[reservation.paymentStatus]} dot={false}>
              {paymentLabel[reservation.paymentStatus]}
            </StatusPill>
          </div>
        }
        actions={
        <>
            {reservation.status === 'confirmed' || reservation.status === 'tentative' ?
          <PrimaryButton gradient onClick={() => setDialog('check-in')}>
                <LogInIcon aria-hidden="true" className="h-4 w-4" />
                Check in
              </PrimaryButton> :
          null}
            {reservation.status === 'in-house' ?
          <PrimaryButton gradient onClick={() => setDialog('check-out')}>
                <LogOutIcon aria-hidden="true" className="h-4 w-4" />
                Check out
              </PrimaryButton> :
          null}
            <SecondaryButton onClick={() => navigate(`/billing/${reservation.id}`)}>
              <PrinterIcon aria-hidden="true" className="h-4 w-4" />
              Invoice
            </SecondaryButton>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KeyValue label="Room type" value={reservation.roomType} />
              <KeyValue label="Room" value={room ? `Room ${room.number}` : 'Not assigned'} />
              <KeyValue label="Rate / night" value={money0(reservation.rate)} />
              <KeyValue label="Stay value" value={money0(reservation.rate * nights)} />
              <KeyValue label="Booking source" value={reservation.source} />
              <KeyValue label="Key cards" value={reservation.keyCards || '—'} />
              <KeyValue label="Created" value={shortDate(reservation.createdAt.slice(0, 10))} />
              <KeyValue
                label="Accompanying"
                value={reservation.accompanying.length ? reservation.accompanying.join(', ') : '—'} />
              
            </div>
            {reservation.requests ?
            <p className="mt-4 rounded-lg bg-canvas px-3 py-2.5 text-[12px] text-ink-soft">
                <span className="font-semibold text-ink">Guest requests:</span> {reservation.requests}
              </p> :
            null}
            {reservation.cancellationReason ?
            <p className="mt-4 rounded-lg bg-[#fdeceb] px-3 py-2.5 text-[12px] font-semibold text-[#b3312a]">
                Cancelled: {reservation.cancellationReason}
              </p> :
            null}
          </Card>

          {isActive ?
          <Card className="p-5">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Actions</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <SecondaryButton onClick={() => setDialog('payment')}>
                  <CreditCardIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                  Record payment
                </SecondaryButton>
                <SecondaryButton onClick={() => setDialog('charge')}>
                  <PlusIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                  Add charge
                </SecondaryButton>
                {reservation.status === 'in-house' ?
              <SecondaryButton onClick={() => setDialog('change-room')}>
                    <ArrowRightLeftIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                    Change room
                  </SecondaryButton> :

              <SecondaryButton onClick={() => setDialog('assign')}>
                    <BedDoubleIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                    {room ? 'Reassign room' : 'Assign room'}
                  </SecondaryButton>
              }
                <SecondaryButton onClick={() => setDialog('extend')}>
                  <CalendarPlusIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                  Extend stay
                </SecondaryButton>
                <DangerButton onClick={() => setDialog('cancel')}>
                  <XCircleIcon aria-hidden="true" className="h-4 w-4" />
                  Cancel reservation
                </DangerButton>
              </div>
            </Card> :
          null}

          <Card className="overflow-hidden">
            <CardHeader
              title="Folio"
              subtitle={`${f.charges.length} charges · ${f.payments.length} payments`}
              action={
              <span className="tabular text-[13px] font-bold text-ink">Balance {money(f.balance)}</span>
              } />
            
            {f.charges.length === 0 && f.payments.length === 0 ?
            <p className="border-t border-line px-5 py-8 text-center text-[12px] text-ink-muted">
                No financial activity posted yet.
              </p> :

            <div className="overflow-x-auto border-t border-line">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Date</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Item</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Qty</th>
                      <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {f.charges.map((charge) =>
                  <tr key={charge.id}>
                        <td className="tabular py-2.5 pl-5 pr-3 text-[12px] text-ink-muted">
                          {shortDate(charge.date)}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-[13px] font-semibold text-ink">{charge.description}</p>
                          <p className="text-[11px] text-ink-muted">
                            {charge.code} · posted by {charge.postedBy}
                          </p>
                        </td>
                        <td className="tabular px-3 py-2.5 text-[12px] text-ink-soft">{charge.quantity}</td>
                        <td className="tabular px-3 py-2.5 pr-5 text-right text-[13px] font-semibold text-ink">
                          {money(charge.quantity * charge.unitPrice)}
                        </td>
                      </tr>
                  )}
                    {f.payments.map((payment) =>
                  <tr key={payment.id} className="bg-brand-50/40">
                        <td className="tabular py-2.5 pl-5 pr-3 text-[12px] text-ink-muted">
                          {shortDate(payment.date)}
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-[13px] font-semibold text-brand-800">
                            {payment.kind} · {payment.method}
                          </p>
                          <p className="text-[11px] text-ink-muted">{payment.reference}</p>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-ink-soft">—</td>
                        <td className="tabular px-3 py-2.5 pr-5 text-right text-[13px] font-semibold text-brand-700">
                          {payment.kind === 'Refund' ? '' : '−'}
                          {money(payment.amount)}
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            }
            <div className="grid grid-cols-3 gap-4 border-t border-line bg-[#fafbf8] px-5 py-3">
              <KeyValue label="Charges" value={money(f.chargeTotal)} />
              <KeyValue label="Paid" value={money(f.paidTotal)} />
              <KeyValue label="Balance" value={money(f.balance)} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Reservation history</h2>
            <ol className="mt-4 space-y-4">
              {[...reservation.history].reverse().map((entry) =>
              <li key={entry.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink">{entry.event}</p>
                    {entry.detail ?
                  <p className="text-[12px] text-ink-soft">{entry.detail}</p> :
                  null}
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {dateTime(entry.at)} · {entry.actor}
                    </p>
                  </div>
                </li>
              )}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Guest</h2>
            {guest ?
            <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-[13px] font-bold text-brand-800">
                    {guest.firstName.charAt(0)}
                    {guest.lastName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-ink">
                      {guest.firstName} {guest.lastName}
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {guest.tier} · {guest.segment}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-[12px] text-ink-soft">
                  <p className="truncate">{guest.email}</p>
                  <p>{guest.phone}</p>
                  <p>
                    {guest.idType} {guest.idNumber || '—'}{' '}
                    {guest.idVerified ?
                  <span className="font-semibold text-brand-700">· verified</span> :

                  <span className="font-semibold text-[#b3312a]">· unverified</span>
                  }
                  </p>
                </div>
                <Link
                to={`/guests/${guest.id}`}
                className="inline-flex text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700 hover:text-brand-800">
                
                  Open guest profile
                </Link>
              </div> :

            <p className="mt-3 text-[12px] text-ink-muted">Guest record unavailable.</p>
            }
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Room</h2>
            {room ?
            <div className="mt-3 space-y-3">
                <div className="flex items-end justify-between">
                  <span className="tabular text-[28px] font-bold leading-none text-ink">
                    {room.number}
                  </span>
                  <StatusPill tone={roomStatusTone[roomStatus(room.id)]}>
                    {roomStatusLabel[roomStatus(room.id)]}
                  </StatusPill>
                </div>
                <p className="text-[12px] text-ink-soft">
                  {room.type} · Floor {room.floor} · {room.beds} · {room.view}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-ink-muted">Housekeeping</span>
                  <StatusPill tone={housekeepingTone[room.housekeeping]}>
                    {housekeepingLabel[room.housekeeping]}
                  </StatusPill>
                </div>
                <Link
                to={`/rooms?room=${room.number}`}
                className="inline-flex text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700 hover:text-brand-800">
                
                  View in room list
                </Link>
              </div> :

            <div className="mt-3">
                <p className="text-[12px] text-ink-muted">
                  No room assigned yet. Assign one before check-in.
                </p>
                {isActive ?
              <PrimaryButton className="mt-3 w-full" onClick={() => setDialog('assign')}>
                    <BedDoubleIcon aria-hidden="true" className="h-4 w-4" />
                    Assign room
                  </PrimaryButton> :
              null}
              </div>
            }
          </Card>
        </div>
      </div>

      <CheckInDialog
        open={dialog === 'check-in'}
        reservationId={reservation.id}
        onClose={() => setDialog(null)} />
      
      <CheckOutDialog
        open={dialog === 'check-out'}
        reservationId={reservation.id}
        onClose={() => setDialog(null)} />
      
      <AddChargeDialog
        open={dialog === 'charge'}
        reservationId={reservation.id}
        onClose={() => setDialog(null)} />
      
      <RecordPaymentDialog
        open={dialog === 'payment'}
        reservationId={reservation.id}
        onClose={() => setDialog(null)} />
      
      <ExtendStayDialog
        open={dialog === 'extend'}
        reservationId={reservation.id}
        onClose={() => setDialog(null)} />
      
      <ChangeRoomDialog
        open={dialog === 'change-room'}
        reservationId={reservation.id}
        onClose={() => setDialog(null)} />
      
      <CancelReservationDialog
        open={dialog === 'cancel'}
        reservationId={reservation.id}
        onClose={() => setDialog(null)} />
      
      <RoomPickerDialog
        open={dialog === 'assign'}
        onClose={() => setDialog(null)}
        preferredType={reservation.roomType}
        excludeRoomId={reservation.roomId}
        subtitle={`${reservation.code} · prefers ${reservation.roomType}`}
        onConfirm={(roomId) => assignRoom(reservation.id, roomId)} />
      
    </div>);

}