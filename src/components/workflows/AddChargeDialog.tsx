import React, { useState } from 'react';
import { Field, Modal, PrimaryButton, SecondaryButton, SelectInput, TextInput } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import type { ChargeCode } from '../../types/hotel';
import { money } from '../../utils/format';

const CHARGE_CODES: ChargeCode[] = [
'Room',
'Tax',
'Restaurant',
'Bar',
'Minibar',
'Spa',
'Laundry',
'Parking',
'Transfer',
'Late Checkout',
'Adjustment'];


export function AddChargeDialog({
  open,
  reservationId,
  onClose




}: {open: boolean;reservationId: string | null;onClose: () => void;}) {
  const { addCharge } = useHotel();
  const [code, setCode] = useState<ChargeCode>('Restaurant');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [error, setError] = useState('');

  function post() {
    if (!reservationId) return;
    if (unitPrice <= 0) {
      setError('Enter a unit price greater than zero.');
      return;
    }
    addCharge({
      reservationId,
      code,
      description: description.trim() || code,
      quantity,
      unitPrice
    });
    setDescription('');
    setQuantity(1);
    setUnitPrice(0);
    setError('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Post charge to folio"
      subtitle="The folio total and outstanding balance recalculate immediately."
      footer={
      <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={post}>Post charge</PrimaryButton>
        </>
      }>
      
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Charge code">
          <SelectInput value={code} onChange={(event) => setCode(event.target.value as ChargeCode)}>
            {CHARGE_CODES.map((item) =>
            <option key={item} value={item}>
                {item}
              </option>
            )}
          </SelectInput>
        </Field>
        <Field label="Description">
          <TextInput
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Dinner — Lantern Grill" />
          
        </Field>
        <Field label="Quantity">
          <TextInput
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} />
          
        </Field>
        <Field label="Unit price">
          <TextInput
            type="number"
            min={0}
            value={unitPrice}
            onChange={(event) => setUnitPrice(Math.max(0, Number(event.target.value)))} />
          
        </Field>
      </div>
      <p className="mt-4 rounded-lg bg-canvas px-3 py-2.5 text-[12px] text-ink-soft">
        Charge total:{' '}
        <span className="tabular font-semibold text-ink">{money(quantity * unitPrice)}</span>
      </p>
      {error ?
      <p role="alert" className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-[12px] font-semibold text-[#b3312a]">
          {error}
        </p> :
      null}
    </Modal>);

}