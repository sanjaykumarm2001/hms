import React, { useMemo, useState } from 'react';
import { Field, Modal, PrimaryButton, SecondaryButton, SelectInput, TextInput } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import type { PaymentMethod } from '../../types/hotel';
import { longDate, money, nightsBetween } from '../../utils/format';

const METHODS: PaymentMethod[] = ['Visa', 'Mastercard', 'Amex', 'Cash', 'Bank Transfer', 'City Ledger'];

export function CheckOutDialog({
  open,
  reservationId,
  onClose




}: {open: boolean;reservationId: string | null;onClose: () => void;}) {
  const { getReservation, getGuest, getRoom, folio, checkOut } = useHotel();
  const reservation = reservationId ? getReservation(reservationId) : undefined;
  const guest = reservation ? getGuest(reservation.guestId) : undefined;
  const room = getRoom(reservation?.roomId ?? null);
  const f = reservation ? folio(reservation.id) : null;

  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('Visa');

  const settlement = amount === null ? Math.max(0, f?.balance ?? 0) : amount;

  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    (f?.charges ?? []).forEach((charge) => {
      map.set(charge.code, (map.get(charge.code) ?? 0) + charge.quantity * charge.unitPrice);
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [f]);

  if (!reservation || !guest || !f) {
    return (
      <Modal open={open} onClose={onClose} title="Check-out">
        <p className="text-[13px] text-ink-soft">Reservation not found.</p>
      </Modal>);

  }

  function complete() {
    checkOut(reservation.id, { amount: settlement, method });
    setAmount(null);
    onClose();
  }

  const remaining = Math.round((f.balance - settlement) * 100) / 100;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Check out · ${guest.firstName} ${guest.lastName}`}
      subtitle={`${reservation.code} · Room ${room?.number ?? '—'} · ${nightsBetween(
        reservation.arrival,
        reservation.departure
      )} night(s) to ${longDate(reservation.departure)}`}
      width="max-w-[640px]"
      footer={
      <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={complete}>Complete check-out</PrimaryButton>
        </>
      }>
      
      <div className="space-y-5">
        <section className="rounded-lg border border-line">
          <p className="border-b border-line bg-[#fafbf8] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
            Folio summary
          </p>
          <ul className="divide-y divide-line">
            {grouped.map(([code, total]) =>
            <li key={code} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[13px] text-ink-soft">{code}</span>
                <span className="tabular text-[13px] font-semibold text-ink">{money(total)}</span>
              </li>
            )}
            <li className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[13px] font-semibold text-ink">Total charges</span>
              <span className="tabular text-[13px] font-bold text-ink">{money(f.chargeTotal)}</span>
            </li>
            <li className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[13px] text-ink-soft">Payments & deposits</span>
              <span className="tabular text-[13px] font-semibold text-brand-700">
                −{money(f.paidTotal)}
              </span>
            </li>
            <li className="flex items-center justify-between bg-brand-wash px-4 py-3">
              <span className="text-[13px] font-bold text-ink">Outstanding balance</span>
              <span className="tabular text-[16px] font-bold text-ink">{money(f.balance)}</span>
            </li>
          </ul>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr]">
          <Field label="Settlement amount">
            <TextInput
              type="number"
              min={0}
              value={settlement}
              onChange={(event) => setAmount(Math.max(0, Number(event.target.value)))} />
            
          </Field>
          <Field label="Payment method">
            <SelectInput
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
              
              {METHODS.map((item) =>
              <option key={item} value={item}>
                  {item}
                </option>
              )}
            </SelectInput>
          </Field>
        </section>

        <p className="rounded-lg bg-canvas px-3 py-2.5 text-[12px] text-ink-soft">
          {remaining <= 0.5 ?
          'Folio will be settled in full and the reservation marked paid.' :
          `${money(remaining)} will remain open and appear in the billing ledger as outstanding.`}{' '}
          Room {room?.number ?? ''} is released to housekeeping as dirty with high priority.
        </p>
      </div>
    </Modal>);

}