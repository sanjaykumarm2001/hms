import React, { useState } from 'react';
import { toast } from 'sonner';
import { useHotel } from '../../contexts/HotelContext';
import { chargeCodes } from '../../data/property';
import type { ChargeCode } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';
import { money } from '../../utils/format';

export function AddChargeModal({
  open,
  onClose,
  reservationId




}: {open: boolean;onClose: () => void;reservationId: string;}) {
  const { addCharge } = useHotel();
  const [code, setCode] = useState<ChargeCode>('restaurant');
  const [description, setDescription] = useState('Restaurant');
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(68);

  const submit = () => {
    if (!description.trim()) {
      toast.error('Add a description for the charge');
      return;
    }
    if (qty < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    addCharge(reservationId, code, description.trim(), qty, unitPrice);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Post charge to folio"
      description="Charges post immediately and recalculate the folio balance."
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>
            Post charge
          </Button>
        </>
      }>
      
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Charge code" required className="sm:col-span-2">
          <Select
            value={code}
            onChange={(e) => {
              const next = e.target.value as ChargeCode;
              const preset = chargeCodes.find((c) => c.id === next);
              setCode(next);
              if (preset) {
                setDescription(preset.label);
                setUnitPrice(preset.unitPrice);
              }
            }}>
            
            {chargeCodes.map((c) =>
            <option key={c.id} value={c.id}>
                {c.label}
              </option>
            )}
          </Select>
        </Field>
        <Field label="Description" required className="sm:col-span-2">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)} />
          
        </Field>
        <Field label="Quantity" required>
          <Input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))} />
          
        </Field>
        <Field label="Unit price" required>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))} />
          
        </Field>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="text-[12px] text-ink-muted">Line total</span>
        <span className="tabular text-[15px] font-semibold text-ink">
          {money(qty * unitPrice)}
        </span>
      </div>
    </Modal>);

}