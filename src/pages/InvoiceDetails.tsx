import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, CreditCardIcon, MailIcon, PrinterIcon } from 'lucide-react';
import {
  Card,
  KeyValue,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  StatusPill } from
'../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { RecordPaymentDialog } from '../components/workflows/RecordPaymentDialog';
import { AddChargeDialog } from '../components/workflows/AddChargeDialog';
import { longDate, money, nightsBetween, shortDate } from '../utils/format';
import { paymentLabel, paymentTone, reservationLabel, reservationTone } from '../utils/tone';

export function InvoiceDetails() {
  const { reservationId = '' } = useParams();
  const navigate = useNavigate();
  const { getReservation, getGuest, getRoom, folio, settings } = useHotel();
  const [dialog, setDialog] = useState<'payment' | 'charge' | null>(null);

  const reservation = getReservation(reservationId);

  if (!reservation) {
    return (
      <Card className="p-10 text-center">
        <p className="text-[14px] font-semibold text-ink">Invoice not found</p>
        <div className="mt-4 flex justify-center">
          <SecondaryButton onClick={() => navigate('/billing')}>Back to billing</SecondaryButton>
        </div>
      </Card>);

  }

  const guest = getGuest(reservation.guestId);
  const room = getRoom(reservation.roomId);
  const f = folio(reservation.id);
  const nights = nightsBetween(reservation.arrival, reservation.departure);

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/billing')}
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft transition-colors duration-150 hover:text-ink">
        
        <ArrowLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
        Billing ledger
      </button>

      <PageHeader
        eyebrow={`Invoice · ${reservation.code}`}
        title={guest ? `${guest.firstName} ${guest.lastName}` : 'Invoice'}
        subtitle={`${longDate(reservation.arrival)} → ${longDate(reservation.departure)} · ${nights} night(s)`}
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
            <SecondaryButton
            onClick={() =>
            toast.success('Invoice emailed', {
              description: `Sent to ${guest?.email ?? 'guest on file'}.`
            })
            }>
            
              <MailIcon aria-hidden="true" className="h-4 w-4" />
              Email invoice
            </SecondaryButton>
            <SecondaryButton onClick={() => window.print()}>
              <PrinterIcon aria-hidden="true" className="h-4 w-4" />
              Print
            </SecondaryButton>
            <PrimaryButton gradient onClick={() => setDialog('payment')}>
              <CreditCardIcon aria-hidden="true" className="h-4 w-4" />
              Record payment
            </PrimaryButton>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <p className="text-[15px] font-bold tracking-tight text-ink">{settings.propertyName}</p>
              <p className="mt-1 text-[12px] text-ink-muted">{settings.address}</p>
              <p className="text-[12px] text-ink-muted">
                {settings.propertyCode} · Currency {settings.currency}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Invoice for
              </p>
              <p className="mt-1 text-[13px] font-semibold text-ink">
                {guest ? `${guest.firstName} ${guest.lastName}` : '—'}
              </p>
              <p className="text-[12px] text-ink-muted">{guest?.email}</p>
              {guest?.company ? <p className="text-[12px] text-ink-muted">{guest.company}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-line px-6 py-4 sm:grid-cols-4">
            <KeyValue label="Reservation" value={reservation.code} />
            <KeyValue label="Room" value={room ? `${room.number} · ${room.type}` : '—'} />
            <KeyValue label="Nights" value={nights} />
            <KeyValue label="Rate" value={money(reservation.rate)} />
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                <th scope="col" className="py-2.5 pl-6 pr-3 font-semibold">Date</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Description</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Qty</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Unit</th>
                <th scope="col" className="px-3 py-2.5 pr-6 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {f.charges.length === 0 ?
              <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[12px] text-ink-muted">
                    No charges posted to this folio.
                  </td>
                </tr> :

              f.charges.map((charge) =>
              <tr key={charge.id}>
                    <td className="tabular py-2.5 pl-6 pr-3 text-[12px] text-ink-muted">
                      {shortDate(charge.date)}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-[13px] font-semibold text-ink">{charge.description}</p>
                      <p className="text-[11px] text-ink-muted">{charge.code}</p>
                    </td>
                    <td className="tabular px-3 py-2.5 text-[12px] text-ink-soft">{charge.quantity}</td>
                    <td className="tabular px-3 py-2.5 text-[12px] text-ink-soft">
                      {money(charge.unitPrice)}
                    </td>
                    <td className="tabular px-3 py-2.5 pr-6 text-right text-[13px] font-semibold text-ink">
                      {money(charge.quantity * charge.unitPrice)}
                    </td>
                  </tr>
              )
              }
            </tbody>
          </table>

          <div className="border-t border-line px-6 py-4">
            <div className="ml-auto w-full max-w-[280px] space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink-soft">Total charges</span>
                <span className="tabular font-semibold text-ink">{money(f.chargeTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink-soft">Payments received</span>
                <span className="tabular font-semibold text-brand-700">−{money(f.paidTotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-2 text-[15px]">
                <span className="font-bold text-ink">Balance due</span>
                <span className="tabular font-bold text-ink">{money(f.balance)}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Payments</h2>
            {f.payments.length === 0 ?
            <p className="mt-3 text-[12px] text-ink-muted">No payments recorded yet.</p> :

            <ul className="mt-3 space-y-3">
                {f.payments.map((payment) =>
              <li key={payment.id} className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-[12px] font-semibold text-ink">
                        {payment.kind} · {payment.method}
                      </span>
                      <span className="block text-[11px] text-ink-muted">
                        {shortDate(payment.date)} · {payment.reference}
                      </span>
                    </span>
                    <span className="tabular text-[13px] font-semibold text-ink">
                      {money(payment.amount)}
                    </span>
                  </li>
              )}
              </ul>
            }
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Folio actions</h2>
            <div className="mt-3 space-y-2">
              <SecondaryButton className="w-full justify-start" onClick={() => setDialog('charge')}>
                Add charge to folio
              </SecondaryButton>
              <SecondaryButton className="w-full justify-start" onClick={() => setDialog('payment')}>
                Record payment or refund
              </SecondaryButton>
              <SecondaryButton
                className="w-full justify-start"
                onClick={() => navigate(`/reservations/${reservation.id}`)}>
                
                Open reservation
              </SecondaryButton>
              {guest ?
              <SecondaryButton
                className="w-full justify-start"
                onClick={() => navigate(`/guests/${guest.id}`)}>
                
                  Open guest profile
                </SecondaryButton> :
              null}
            </div>
          </Card>
        </div>
      </div>

      <RecordPaymentDialog
        open={dialog === 'payment'}
        reservationId={reservation.id}
        onClose={() => setDialog(null)} />
      
      <AddChargeDialog
        open={dialog === 'charge'}
        reservationId={reservation.id}
        onClose={() => setDialog(null)} />
      
    </div>);

}