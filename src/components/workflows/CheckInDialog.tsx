import React, { useMemo, useState } from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, PlusIcon, XIcon } from 'lucide-react';
import {
  Field,
  KeyValue,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  StatusPill,
  TextInput } from
'../ui';
import { useHotel } from '../../contexts/HotelContext';
import type { PaymentMethod } from '../../types/hotel';
import { housekeepingLabel, housekeepingTone } from '../../utils/tone';
import { longDate, money, money0, nightsBetween } from '../../utils/format';

const METHODS: PaymentMethod[] = ['Visa', 'Mastercard', 'Amex', 'Cash', 'Bank Transfer', 'City Ledger'];

export function CheckInDialog({
  open,
  reservationId,
  onClose




}: {open: boolean;reservationId: string | null;onClose: () => void;}) {
  const { getReservation, getGuest, rooms, ops, settings, checkIn, folio } = useHotel();
  const reservation = reservationId ? getReservation(reservationId) : undefined;
  const guest = reservation ? getGuest(reservation.guestId) : undefined;

  const [roomId, setRoomId] = useState<string>('');
  const [idVerified, setIdVerified] = useState(false);
  const [contactConfirmed, setContactConfirmed] = useState(false);
  const [registrationSigned, setRegistrationSigned] = useState(false);
  const [accompanying, setAccompanying] = useState<string[]>([]);
  const [accompanyingDraft, setAccompanyingDraft] = useState('');
  const [keyCards, setKeyCards] = useState(2);
  const [deposit, setDeposit] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>('Visa');
  const [error, setError] = useState('');

  const activeRoomId = roomId || reservation?.roomId || '';
  const room = rooms.find((r) => r.id === activeRoomId);
  const roomReady = room ? room.housekeeping === 'clean' || room.housekeeping === 'inspected' : false;

  const candidates = useMemo(
    () =>
    rooms.
    filter(
      (r) =>
      ops.statusByRoom[r.id] === 'available' && (
      !reservation || r.type === reservation.roomType || r.id === reservation.roomId)
    ).
    sort((a, b) => a.number.localeCompare(b.number)),
    [ops.statusByRoom, reservation, rooms]
  );

  const nights = reservation ? nightsBetween(reservation.arrival, reservation.departure) : 0;
  const estimate = reservation ? reservation.rate * nights : 0;
  const suggestedDeposit = Math.round(estimate * settings.depositPercent / 100);
  const balance = reservation ? folio(reservation.id).balance : 0;

  if (!reservation || !guest) {
    return (
      <Modal open={open} onClose={onClose} title="Check-in">
        <p className="text-[13px] text-ink-soft">Reservation not found.</p>
      </Modal>);

  }

  function complete() {
    if (!activeRoomId) {
      setError('Assign a room before completing the check-in.');
      return;
    }
    if (!idVerified || !contactConfirmed || !registrationSigned) {
      setError('Verify the guest ID, contact details, and registration card.');
      return;
    }
    checkIn(reservation.id, {
      roomId: activeRoomId,
      accompanying,
      keyCards,
      depositAmount: deposit,
      method,
      idVerified,
      registrationSigned
    });
    setError('');
    setRoomId('');
    setIdVerified(false);
    setContactConfirmed(false);
    setRegistrationSigned(false);
    setAccompanying([]);
    setKeyCards(2);
    setDeposit(0);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Check in · ${guest.firstName} ${guest.lastName}`}
      subtitle={`${reservation.code} · ${longDate(reservation.arrival)} → ${longDate(reservation.departure)}`}
      width="max-w-[700px]"
      footer={
      <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={complete}>Complete check-in</PrimaryButton>
        </>
      }>
      
      <div className="space-y-5">
        <section className="rounded-lg border border-line bg-canvas px-4 py-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KeyValue label="Tier" value={guest.tier} />
            <KeyValue label="Segment" value={guest.segment} />
            <KeyValue label="Guests" value={`${reservation.adults}A · ${reservation.children}C`} />
            <KeyValue label="Stay value" value={money0(estimate)} />
            <KeyValue label="Email" value={guest.email} />
            <KeyValue label="Phone" value={guest.phone} />
            <KeyValue label="ID on file" value={`${guest.idType} ${guest.idNumber || '—'}`} />
            <KeyValue label="Folio balance" value={money(balance)} />
          </div>
          {reservation.requests ?
          <p className="mt-3 border-t border-line pt-3 text-[12px] text-ink-soft">
              <span className="font-semibold text-ink">Requests:</span> {reservation.requests}
            </p> :
          null}
        </section>

        <section>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            Verification
          </h3>
          <div className="space-y-2">
            {[
            { label: 'Photo ID verified against reservation', value: idVerified, set: setIdVerified },
            { label: 'Contact details confirmed with guest', value: contactConfirmed, set: setContactConfirmed },
            { label: 'Registration card signed', value: registrationSigned, set: setRegistrationSigned }].
            map((item) =>
            <label
              key={item.label}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2.5">
              
                <input
                type="checkbox"
                checked={item.value}
                onChange={(event) => item.set(event.target.checked)}
                className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400" />
              
                <span className="text-[13px] text-ink">{item.label}</span>
              </label>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            Room
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label={reservation.roomId ? 'Confirm room' : 'Assign room'}>
              <SelectInput value={activeRoomId} onChange={(event) => setRoomId(event.target.value)}>
                <option value="">Select a room…</option>
                {reservation.roomId && !candidates.some((c) => c.id === reservation.roomId) ?
                <option value={reservation.roomId}>
                    {rooms.find((r) => r.id === reservation.roomId)?.number} · currently assigned
                  </option> :
                null}
                {candidates.map((candidate) =>
                <option key={candidate.id} value={candidate.id}>
                    {candidate.number} · {candidate.type} · {candidate.housekeeping}
                  </option>
                )}
              </SelectInput>
            </Field>
            <div className="flex items-end">
              {room ?
              <div className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2.5">
                  {roomReady ?
                <CheckCircle2Icon aria-hidden="true" className="h-4 w-4 text-brand-700" /> :

                <AlertTriangleIcon aria-hidden="true" className="h-4 w-4 text-[#f0a72a]" />
                }
                  <span className="text-[12px] text-ink-soft">
                    Room {room.number} · {room.type}
                  </span>
                  <StatusPill tone={housekeepingTone[room.housekeeping]}>
                    {housekeepingLabel[room.housekeeping]}
                  </StatusPill>
                </div> :

              <p className="text-[12px] text-ink-muted">Room readiness appears once selected.</p>
              }
            </div>
          </div>
          {room && !roomReady ?
          <p className="mt-2 text-[12px] text-[#8d5a10]">
              Room is not inspected yet — check-in will mark it clean, but confirm with housekeeping first.
            </p> :
          null}
        </section>

        <section>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            Accompanying guests & keys
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
            <div>
              <div className="flex gap-2">
                <TextInput
                  value={accompanyingDraft}
                  onChange={(event) => setAccompanyingDraft(event.target.value)}
                  placeholder="Add accompanying guest name" />
                
                <SecondaryButton
                  onClick={() => {
                    if (!accompanyingDraft.trim()) return;
                    setAccompanying([...accompanying, accompanyingDraft.trim()]);
                    setAccompanyingDraft('');
                  }}>
                  
                  <PlusIcon aria-hidden="true" className="h-4 w-4" />
                  Add
                </SecondaryButton>
              </div>
              {accompanying.length ?
              <ul className="mt-2 flex flex-wrap gap-2">
                  {accompanying.map((name, index) =>
                <li
                  key={`${name}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                  
                      {name}
                      <button
                    type="button"
                    aria-label={`Remove ${name}`}
                    onClick={() => setAccompanying(accompanying.filter((_, i) => i !== index))}
                    className="text-ink-muted transition-colors duration-150 hover:text-ink">
                    
                        <XIcon aria-hidden="true" className="h-3 w-3" />
                      </button>
                    </li>
                )}
                </ul> :
              null}
            </div>
            <Field label="Key cards">
              <SelectInput
                value={keyCards}
                onChange={(event) => setKeyCards(Number(event.target.value))}>
                
                {[1, 2, 3, 4].map((count) =>
                <option key={count} value={count}>
                    {count} card{count > 1 ? 's' : ''}
                  </option>
                )}
              </SelectInput>
            </Field>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            Deposit (optional)
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr_auto]">
            <Field label="Amount">
              <TextInput
                type="number"
                min={0}
                value={deposit}
                onChange={(event) => setDeposit(Math.max(0, Number(event.target.value)))} />
              
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
            <div className="flex items-end">
              <SecondaryButton onClick={() => setDeposit(suggestedDeposit)}>
                Use policy {settings.depositPercent}% · {money0(suggestedDeposit)}
              </SecondaryButton>
            </div>
          </div>
        </section>

        {error ?
        <p role="alert" className="rounded-lg bg-[#fdeceb] px-3 py-2 text-[12px] font-semibold text-[#b3312a]">
            {error}
          </p> :
        null}
      </div>
    </Modal>);

}