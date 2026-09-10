import React, { useState } from 'react';
import { toast } from 'sonner';
import { useHotel } from '../../contexts/HotelContext';
import { paymentKinds, paymentMethods } from '../../data/property';
import type { PaymentKind, PaymentMethod } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';
import { money } from '../../utils/format';

export function AddPaymentModal({
  open,
  onClose,
  reservationId




}: {open: boolean;onClose: () => void;reservationId: string;}) {
  const { addPayment, folio } = useHotel();
  const balance = folio(reservationId).balance;
  const [amount, setAmount] = useState(Math.max(0, Number(balance.toFixed(2))));
  const [method, setMethod] = useState<PaymentMethod>('visa');
  const [kind, setKind] = useState<PaymentKind>('payment');

  const submit = () => {
    if (amount <= 0) {
      toast.error('Enter an amount greater than zero');
      return;
    }
    addPayment(reservationId, amount, method, kind);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record payment"
      description={`Outstanding balance on this folio: ${money(balance)}`}
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>
            Record payment
          </Button>
        </>
      }>
      
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Amount" required className="sm:col-span-2">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))} />
          
        </Field>
        <Field label="Payment method" required>
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
        <Field label="Payment type" required>
          <Select value={kind} onChange={(e) => setKind(e.target.value as PaymentKind)}>
            {paymentKinds.map((k) =>
            <option key={k.id} value={k.id}>
                {k.label}
              </option>
            )}
          </Select>
        </Field>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="text-[12px] text-ink-muted">Balance after posting</span>
        <span className="tabular text-[15px] font-semibold text-ink">
          {money(kind === 'refund' ? balance + amount : balance - amount)}
        </span>
      </div>
    </Modal>);

}