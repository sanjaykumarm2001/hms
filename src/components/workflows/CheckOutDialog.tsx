import { useState } from 'react';
import { CheckIcon, PlusIcon, PrinterIcon, SparklesIcon } from 'lucide-react';
import { Field, Modal, PrimaryButton, SecondaryButton, SelectInput, TextInput } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import type { PaymentMethod } from '../../types/hotel';
import { money, nightsBetween, shortDate } from '../../utils/format';

const METHODS: PaymentMethod[] = ['Visa', 'Mastercard', 'Amex', 'Cash', 'Bank Transfer', 'City Ledger'];

export function CheckOutDialog({
  open,
  reservationId,
  onClose
}: {
  open: boolean;
  reservationId: string | null;
  onClose: () => void;
}) {
  const { getReservation, getGuest, getRoom, folio, checkOut, addCharge } = useHotel();
  const reservation = reservationId ? getReservation(reservationId) : undefined;
  const guest = reservation ? getGuest(reservation.guestId) : undefined;
  const room = getRoom(reservation?.roomId ?? null);
  const f = reservation ? folio(reservation.id) : null;

  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('Visa');
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [lateChargeDesc, setLateChargeDesc] = useState('Late Checkout Fee');
  const [lateChargeAmount, setLateChargeAmount] = useState(50);

  const nights = reservation ? nightsBetween(reservation.arrival, reservation.departure) : 0;
  const settlement = amount === null ? Math.max(0, f?.balance ?? 0) : amount;

  if (!reservation || !guest || !f) {
    return (
      <Modal open={open} onClose={onClose} title="Check-out">
        <p className="text-[13px] text-ink-soft">Reservation not found.</p>
      </Modal>
    );
  }

  function complete() {
    if (!reservation) return;
    checkOut(reservation.id, { amount: settlement, method });
    setAmount(null);
    onClose();
  }

  function handleAddLateCharge() {
    if (!reservation) return;
    addCharge({
      reservationId: reservation.id,
      code: 'Late Checkout',
      description: lateChargeDesc,
      quantity: 1,
      unitPrice: lateChargeAmount
    });
    setShowAddCharge(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="" width="max-w-[720px]">
      <div className="space-y-5 py-1">
        {/* Express Check-Out Header & Actions */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              FRONT DESK OPERATIONS
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Express Check-Out</h1>
            <p className="mt-0.5 text-[12px] text-gray-500">
              {guest.firstName} {guest.lastName} · Room {room?.number ?? '—'} · {reservation.roomType} King
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SecondaryButton
              onClick={() => setShowAddCharge(!showAddCharge)}
              className="gap-1.5 px-3 py-2 text-[12px]"
            >
              <PlusIcon aria-hidden="true" className="h-4 w-4 text-gray-600" />
              Add late charge
            </SecondaryButton>
            <SecondaryButton
              onClick={() => window.print()}
              className="gap-1.5 px-3 py-2 text-[12px]"
            >
              <PrinterIcon aria-hidden="true" className="h-4 w-4 text-gray-600" />
              Print folio
            </SecondaryButton>
          </div>
        </div>

        {/* Add Late Charge Form */}
        {showAddCharge && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <h3 className="text-[13px] font-bold text-gray-900">Post Late Charge</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Description">
                <TextInput
                  value={lateChargeDesc}
                  onChange={(e) => setLateChargeDesc(e.target.value)}
                  className="h-9"
                />
              </Field>
              <Field label="Amount">
                <TextInput
                  type="number"
                  value={lateChargeAmount}
                  onChange={(e) => setLateChargeAmount(Number(e.target.value))}
                  className="h-9"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <SecondaryButton onClick={() => setShowAddCharge(false)} className="px-3 py-1.5 text-xs">
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleAddLateCharge} className="px-3 py-1.5 text-xs">
                Post Charge
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* Folio Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <h2 className="text-[14px] font-bold text-gray-900">Folio #{reservation.code}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 px-5 py-3.5 sm:grid-cols-4 bg-gray-50/30">
            <div>
              <p className="text-[11px] font-semibold text-gray-400">Arrival</p>
              <p className="text-[13px] font-bold text-gray-800">{shortDate(reservation.arrival)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400">Departure</p>
              <p className="text-[13px] font-bold text-gray-800">{shortDate(reservation.departure)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400">Nights</p>
              <p className="text-[13px] font-bold text-gray-800">{nights}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400">Nightly rate</p>
              <p className="text-[13px] font-bold text-gray-800">{money(reservation.rate)}</p>
            </div>
          </div>

          {/* Charges Table */}
          <div className="px-5 py-3">
            <div className="grid grid-cols-[1fr_80px_100px] text-[10px] font-bold tracking-wider text-gray-400 uppercase pb-2 border-b border-gray-100">
              <span>DESCRIPTION</span>
              <span className="text-center">QTY</span>
              <span className="text-right">AMOUNT</span>
            </div>

            <div className="divide-y divide-gray-100 text-[13px]">
              {f.charges.map((charge) => (
                <div key={charge.id} className="grid grid-cols-[1fr_80px_100px] py-2.5 items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{charge.description}</p>
                    <p className="text-[11px] text-gray-400">{charge.code} · {charge.date}</p>
                  </div>
                  <span className="text-center text-gray-600 font-medium">{charge.quantity}</span>
                  <span className="text-right font-bold text-gray-900">
                    {money(charge.quantity * charge.unitPrice)}
                  </span>
                </div>
              ))}

              {f.payments.map((payment) => (
                <div key={payment.id} className="grid grid-cols-[1fr_80px_100px] py-2.5 items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Payment · {payment.method}</p>
                    <p className="text-[11px] text-gray-400">{payment.kind} · {payment.date}</p>
                  </div>
                  <span className="text-center text-gray-400">—</span>
                  <span className="text-right font-bold text-emerald-600">
                    -{money(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settlement Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-[15px] font-bold text-gray-900">Settlement</h2>

          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between text-gray-600">
              <span>Charges</span>
              <span className="font-semibold text-gray-900">{money(f.chargeTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Previous payments</span>
              <span className="font-semibold text-emerald-600">
                {f.paidTotal > 0 ? `-${money(f.paidTotal)}` : money(0)}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between items-baseline">
              <span className="text-[13px] font-medium text-gray-500">Outstanding balance</span>
              <span className="text-3xl font-extrabold text-gray-900">{money(f.balance)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
            <Field label="Amount to settle now *">
              <TextInput
                type="number"
                min={0}
                value={settlement}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="h-10"
              />
            </Field>

            <Field label="Payment method *">
              <SelectInput
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="h-10"
              >
                {METHODS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>

          <PrimaryButton
            onClick={complete}
            className="w-full justify-center py-3 text-[15px] font-bold bg-brand-600 hover:bg-brand-500"
          >
            Complete check-out
          </PrimaryButton>
        </div>

        {/* What Happens Next Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-[15px] font-bold text-gray-900">What happens next</h2>

          <div className="space-y-2 text-[13px] text-gray-700">
            <div className="flex items-center gap-2.5">
              <SparklesIcon className="h-4 w-4 text-brand-600 shrink-0" />
              <span>Payment is posted and the folio closes.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <SparklesIcon className="h-4 w-4 text-brand-600 shrink-0" />
              <span>Reservation moves to Checked Out.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <SparklesIcon className="h-4 w-4 text-brand-600 shrink-0" />
              <span>Room {room?.number ?? '—'} is released and marked dirty.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <SparklesIcon className="h-4 w-4 text-brand-600 shrink-0" />
              <span>Housekeeping priority is raised to high.</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600">
              <CheckIcon className="h-3.5 w-3.5" />
              Auto-routed to housekeeping
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}