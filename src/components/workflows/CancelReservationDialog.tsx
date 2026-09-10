import React, { useState } from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { DangerButton, Field, Modal, SecondaryButton, SelectInput, TextArea } from '../ui';
import { useHotel } from '../../contexts/HotelContext';

const REASONS = [
'Guest travel plans changed',
'Duplicate booking',
'Rate dispute',
'No-show at cut-off',
'Property unable to accommodate',
'Other'];


export function CancelReservationDialog({
  open,
  reservationId,
  onClose




}: {open: boolean;reservationId: string | null;onClose: () => void;}) {
  const { getReservation, cancelReservation, settings, guestName } = useHotel();
  const reservation = reservationId ? getReservation(reservationId) : undefined;
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');

  if (!reservation) return null;

  function confirm() {
    cancelReservation(reservation.id, note.trim() ? `${reason} — ${note.trim()}` : reason);
    setNote('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel reservation"
      subtitle={`${reservation.code} · ${guestName(reservation.guestId)}`}
      footer={
      <>
          <SecondaryButton onClick={onClose}>Keep reservation</SecondaryButton>
          <DangerButton onClick={confirm}>Cancel reservation</DangerButton>
        </>
      }>
      
      <div className="mb-4 flex items-start gap-3 rounded-lg bg-[#fdeceb] px-3 py-3">
        <AlertTriangleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#b3312a]" />
        <p className="text-[12px] text-[#b3312a]">
          Cancelling releases the assigned room and records the reason in the reservation history.
          Inside {settings.cancellationWindowHours}h of arrival a {settings.cancellationFeePercent}%
          fee applies under the current policy.
        </p>
      </div>
      <Field label="Cancellation reason">
        <SelectInput value={reason} onChange={(event) => setReason(event.target.value)}>
          {REASONS.map((item) =>
          <option key={item} value={item}>
              {item}
            </option>
          )}
        </SelectInput>
      </Field>
      <Field label="Additional note (optional)" className="mt-3">
        <TextArea rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
    </Modal>);

}