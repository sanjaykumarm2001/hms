import React, { useState } from 'react';
import { addDays, parseISO } from 'date-fns';
import { Field, Modal, PrimaryButton, SecondaryButton, TextInput } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import { isoDate, longDate, money, nightsBetween } from '../../utils/format';

export function ExtendStayDialog({
  open,
  reservationId,
  onClose




}: {open: boolean;reservationId: string | null;onClose: () => void;}) {
  const { getReservation, extendStay } = useHotel();
  const reservation = reservationId ? getReservation(reservationId) : undefined;
  const [departure, setDeparture] = useState('');
  const [error, setError] = useState('');

  const value = departure || (reservation ? isoDate(addDays(parseISO(reservation.departure), 1)) : '');

  function confirm() {
    if (!reservation) return;
    if (value <= reservation.arrival) {
      setError('Departure must be after the arrival date.');
      return;
    }
    extendStay(reservation.id, value);
    setDeparture('');
    setError('');
    onClose();
  }

  if (!reservation) return null;

  const extraNights =
  nightsBetween(reservation.arrival, value) - nightsBetween(reservation.arrival, reservation.departure);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Extend stay"
      subtitle={`Current departure ${longDate(reservation.departure)}`}
      footer={
      <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={confirm}>Confirm new departure</PrimaryButton>
        </>
      }>
      
      <Field label="New departure date">
        <TextInput
          type="date"
          value={value}
          onChange={(event) => setDeparture(event.target.value)} />
        
      </Field>
      <p className="mt-4 rounded-lg bg-canvas px-3 py-2.5 text-[12px] text-ink-soft">
        {extraNights === 0 ?
        'Same departure date — no change to the stay.' :
        `${extraNights > 0 ? '+' : ''}${extraNights} night(s) · approx ${money(
          Math.abs(extraNights) * reservation.rate
        )} in additional room revenue at the current rate.`}
      </p>
      {error ?
      <p role="alert" className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-[12px] font-semibold text-[#b3312a]">
          {error}
        </p> :
      null}
    </Modal>);

}