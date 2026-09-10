import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, BanknoteIcon, MailIcon, PrinterIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { PaymentBadge } from '../components/ui/Badge';
import { AddPaymentModal } from '../components/workflows/AddPaymentModal';
import { longDate, money, nights, titleize } from '../utils/format';
import { property, roomTypeName } from '../data/property';

export function InvoiceDetail() {
  const { id = '' } = useParams();
  const { reservationById, guestById, roomById, folio } = useHotel();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const reservation = reservationById(id);

  if (!reservation) {
    return (
      <Page>
        <PageHeader title="Invoice not found" />
        <Link to="/billing">
          <Button variant="primary">Back to billing</Button>
        </Link>
      </Page>);

  }

  const guest = guestById(reservation.guestId);
  const room = roomById(reservation.roomId);
  const f = folio(reservation.id);
  const stay = nights(reservation.arrival, reservation.departure);

  return (
    <Page>
      <Link
        to="/billing"
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted transition-colors duration-150 ease-out hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" /> Billing ledger
      </Link>

      <PageHeader
        eyebrow="Invoice"
        title={`#${reservation.confirmation}`}
        subtitle={`${guest ? `${guest.firstName} ${guest.lastName}` : ''} · ${room ? `Room ${room.number}` : 'No room'} · ${stay} night${stay > 1 ? 's' : ''}`}
        actions={
        <>
            <Button onClick={() => toast.success(`Invoice emailed to ${guest?.email}`)}>
              <MailIcon className="h-4 w-4" /> Email invoice
            </Button>
            <Button onClick={() => window.print()}>
              <PrinterIcon className="h-4 w-4" /> Print
            </Button>
            <Button variant="primary" onClick={() => setPaymentOpen(true)}>
              <BanknoteIcon className="h-4 w-4" /> Record payment
            </Button>
          </>
        } />
      

      <div className="mx-auto max-w-[900px] rounded-xl border border-line bg-white p-8 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
          <div>
            <p className="text-[17px] font-semibold text-ink">{property.name}</p>
            <p className="text-[12px] text-ink-muted">{property.address}</p>
            <p className="text-[12px] text-ink-muted">{property.group}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Folio / Tax invoice
            </p>
            <p className="tabular text-[15px] font-semibold text-ink">
              #{reservation.confirmation}
            </p>
            <div className="mt-1">
              <PaymentBadge status={reservation.paymentStatus} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-b border-line py-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Billed to
            </p>
            <p className="mt-1 text-[14px] font-semibold text-ink">
              {guest ? `${guest.firstName} ${guest.lastName}` : '—'}
            </p>
            <p className="text-[12px] text-ink-muted">{guest?.email}</p>
            <p className="text-[12px] text-ink-muted">{guest?.phone}</p>
            <p className="text-[12px] text-ink-muted">{guest?.country}</p>
          </div>
          <dl className="space-y-1.5 sm:text-right">
            {[
            { label: 'Arrival', value: longDate(reservation.arrival) },
            { label: 'Departure', value: longDate(reservation.departure) },
            {
              label: 'Room',
              value: `${room ? room.number : '—'} · ${roomTypeName(reservation.roomType)}`
            },
            { label: 'Nightly rate', value: money(reservation.rate) }].
            map((row) =>
            <div key={row.label} className="flex justify-between gap-6">
                <dt className="text-[12px] text-ink-faint">{row.label}</dt>
                <dd className="text-[12px] font-medium text-ink">{row.value}</dd>
              </div>
            )}
          </dl>
        </div>

        <table className="mt-6 w-full text-left">
          <thead>
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
              <th className="py-2">Description</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {f.charges.map((charge) =>
            <tr key={charge.id}>
                <td className="py-2.5">
                  <p className="text-[13px] text-ink">{charge.description}</p>
                  <p className="text-[11px] text-ink-faint">{titleize(charge.code)}</p>
                </td>
                <td className="tabular py-2.5 text-right text-[13px] text-ink-muted">
                  {charge.qty}
                </td>
                <td className="tabular py-2.5 text-right text-[13px] text-ink-muted">
                  {money(charge.unitPrice)}
                </td>
                <td className="tabular py-2.5 text-right text-[13px] font-semibold text-ink">
                  {money(charge.qty * charge.unitPrice)}
                </td>
              </tr>
            )}
            {f.charges.length === 0 &&
            <tr>
                <td colSpan={4} className="py-6 text-center text-[13px] text-ink-muted">
                  No charges posted to this folio.
                </td>
              </tr>
            }
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-[280px] space-y-2">
            <div className="flex justify-between text-[13px]">
              <dt className="text-ink-muted">Total charges</dt>
              <dd className="tabular font-medium text-ink">{money(f.chargeTotal)}</dd>
            </div>
            <div className="flex justify-between text-[13px]">
              <dt className="text-ink-muted">Total paid</dt>
              <dd className="tabular font-medium text-emerald-700">
                −{money(f.paidTotal)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <dt className="text-[13px] font-semibold text-ink">Balance due</dt>
              <dd className="tabular text-[17px] font-semibold text-ink">
                {money(f.balance)}
              </dd>
            </div>
          </dl>
        </div>

        <p className="mt-8 border-t border-line pt-4 text-[11px] text-ink-faint">
          Check-out time {property.checkOut}. Charges are shown in {property.currency}.
          Thank you for staying with {property.name}.
        </p>
      </div>

      <AddPaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        reservationId={reservation.id} />
      
    </Page>);

}