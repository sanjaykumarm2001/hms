import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BrushIcon, PlusIcon, PrinterIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Field';
import { Badge } from '../components/ui/Badge';
import { AddChargeModal } from '../components/workflows/AddChargeModal';
import { longDate, money, nights, timeAgo, titleize } from '../utils/format';
import { paymentMethods, roomTypeName } from '../data/property';
import type { PaymentMethod } from '../types';

export function CheckOut() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { reservationById, guestById, roomById, folio, checkOut } = useHotel();
  const reservation = reservationById(id);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('visa');

  const f = reservation ? folio(reservation.id) : null;
  const [amount, setAmount] = useState<number>(
    f ? Number(Math.max(0, f.balance).toFixed(2)) : 0
  );

  if (!reservation || !f) {
    return (
      <Page>
        <PageHeader title="Reservation not found" />
        <Link to="/front-desk">
          <Button variant="primary">Back to front desk</Button>
        </Link>
      </Page>);

  }

  const guest = guestById(reservation.guestId);
  const room = roomById(reservation.roomId);
  const stay = nights(reservation.arrival, reservation.departure);

  return (
    <Page>
      <PageHeader
        eyebrow="Front desk operations"
        title="Express Check-Out"
        subtitle={`${guest ? `${guest.firstName} ${guest.lastName}` : ''} · Room ${room?.number ?? '—'} · ${roomTypeName(reservation.roomType)}`}
        actions={
        <>
            <Button onClick={() => setChargeOpen(true)}>
              <PlusIcon className="h-4 w-4" /> Add late charge
            </Button>
            <Link to={`/billing/${reservation.id}`}>
              <Button>
                <PrinterIcon className="h-4 w-4" /> Print folio
              </Button>
            </Link>
          </>
        } />
      

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card title={`Folio #${reservation.confirmation}`} padded={false}>
          <div className="grid grid-cols-2 gap-4 border-b border-line px-4 py-3 sm:grid-cols-4">
            {[
            { label: 'Arrival', value: longDate(reservation.arrival) },
            { label: 'Departure', value: longDate(reservation.departure) },
            { label: 'Nights', value: String(stay) },
            { label: 'Nightly rate', value: money(reservation.rate) }].
            map((item) =>
            <div key={item.label}>
                <p className="text-[11px] font-medium text-ink-faint">{item.label}</p>
                <p className="mt-0.5 text-[13px] font-medium text-ink">
                  {item.value}
                </p>
              </div>
            )}
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                <th className="px-4 py-2">Description</th>
                <th className="px-2 py-2 text-right">Qty</th>
                <th className="px-4 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {f.charges.map((charge) =>
              <tr key={charge.id}>
                  <td className="px-4 py-2.5">
                    <p className="text-[13px] text-ink">{charge.description}</p>
                    <p className="text-[11px] text-ink-faint">
                      {titleize(charge.code)} · {timeAgo(charge.postedAt)}
                    </p>
                  </td>
                  <td className="tabular px-2 py-2.5 text-right text-[13px] text-ink-muted">
                    {charge.qty}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right text-[13px] font-semibold text-ink">
                    {money(charge.qty * charge.unitPrice)}
                  </td>
                </tr>
              )}
              {f.payments.map((payment) =>
              <tr key={payment.id} className="bg-slate-50/60">
                  <td className="px-4 py-2.5">
                    <p className="text-[13px] text-ink">
                      {titleize(payment.kind)} · {titleize(payment.method)}
                    </p>
                    <p className="text-[11px] text-ink-faint">
                      {payment.by} · {timeAgo(payment.at)}
                    </p>
                  </td>
                  <td />
                  <td className="tabular px-4 py-2.5 text-right text-[13px] font-semibold text-emerald-700">
                    −{money(payment.amount)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <aside className="space-y-4">
          <Card title="Settlement">
            <dl className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <dt className="text-ink-muted">Charges</dt>
                <dd className="tabular font-medium text-ink">
                  {money(f.chargeTotal)}
                </dd>
              </div>
              <div className="flex justify-between text-[13px]">
                <dt className="text-ink-muted">Previous payments</dt>
                <dd className="tabular font-medium text-emerald-700">
                  −{money(f.paidTotal)}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
              <span className="text-[12px] text-ink-muted">Outstanding balance</span>
              <span className="tabular text-[26px] font-semibold text-ink">
                {money(f.balance)}
              </span>
            </div>

            <Field label="Amount to settle now" required className="mt-4">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))} />
              
            </Field>
            <Field label="Payment method" required className="mt-3">
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
                
                {paymentMethods.map((m) =>
                <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                )}
              </Select>
            </Field>

            {f.balance - amount > 1 &&
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                {money(f.balance - amount)} will remain open on this folio after
                check-out.
              </p>
            }

            <Button
              variant="primary"
              size="lg"
              className="mt-4 w-full"
              onClick={() => {
                if (amount < 0) {
                  toast.error('Settlement cannot be negative');
                  return;
                }
                checkOut({ reservationId: reservation.id, amount, method });
                navigate('/housekeeping');
              }}>
              
              Complete check-out
            </Button>
          </Card>

          <Card title="What happens next">
            <ul className="space-y-2.5 text-[12px] text-ink-muted">
              {[
              'Payment is posted and the folio closes.',
              'Reservation moves to Checked Out.',
              `Room ${room?.number ?? ''} is released and marked dirty.`,
              'Housekeeping priority is raised to high.'].
              map((line) =>
              <li key={line} className="flex gap-2">
                  <BrushIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                  {line}
                </li>
              )}
            </ul>
            <div className="mt-3">
              <Badge tone="blue">Auto-routed to housekeeping</Badge>
            </div>
          </Card>
        </aside>
      </div>

      <AddChargeModal
        open={chargeOpen}
        onClose={() => setChargeOpen(false)}
        reservationId={reservation.id} />
      
    </Page>);

}