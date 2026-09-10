import React, { useState } from 'react';
import { Field, Modal, PrimaryButton, SecondaryButton, SelectInput, TextInput } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import type { PaymentKind, PaymentMethod } from '../../types/hotel';
import { money } from '../../utils/format';

const METHODS: PaymentMethod[] = ['Visa', 'Mastercard', 'Amex', 'Cash', 'Bank Transfer', 'City Ledger'];
const KINDS: PaymentKind[] = ['Payment', 'Deposit', 'Refund'];

export function RecordPaymentDialog({
  open,
  reservationId,
  onClose




}: {open: boolean;reservationId: string | null;onClose: () => void;}) {
  const { addPayment, folio } = useHotel();
  const balance = reservationId ? folio(reservationId).balance : 0;
  const [amount, setAmount] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('Visa');
  const [kind, setKind] = useState<PaymentKind>('Payment');
  const [error, setError] = useState('');

  const value = amount === null ? Math.max(0, balance) : amount;

  function record() {
    if (!reservationId) return;
    if (value <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    addPayment({ reservationId, amount: value, method, kind });
    setAmount(null);
    setError('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record payment"
      subtitle={`Current outstanding balance ${money(balance)}`}
      footer={
      <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={record}>Record {kind.toLowerCase()}</PrimaryButton>
        </>
      }>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Amount">
          <TextInput
            type="number"
            min={0}
            value={value}
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
        <Field label="Payment type">
          <SelectInput value={kind} onChange={(event) => setKind(event.target.value as PaymentKind)}>
            {KINDS.map((item) =>
            <option key={item} value={item}>
                {item}
              </option>
            )}
          </SelectInput>
        </Field>
      </div>
      {error ?
      <p role="alert" className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-[12px] font-semibold text-[#b3312a]">
          {error}
        </p> :
      null}
    </Modal>);

}