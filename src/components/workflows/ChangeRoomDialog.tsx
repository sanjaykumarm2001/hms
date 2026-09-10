import React, { useMemo, useState } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { Field, Modal, PrimaryButton, SecondaryButton, SelectInput, StatusPill } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import { housekeepingLabel, housekeepingTone } from '../../utils/tone';
import { money0 } from '../../utils/format';

const REASONS = [
'Guest request',
'Maintenance issue in room',
'Upgrade — loyalty recognition',
'Noise complaint',
'Housekeeping delay',
'Operational move'];


export function ChangeRoomDialog({
  open,
  reservationId,
  onClose




}: {open: boolean;reservationId: string | null;onClose: () => void;}) {
  const { getReservation, getRoom, rooms, ops, changeRoom, guestName } = useHotel();
  const reservation = reservationId ? getReservation(reservationId) : undefined;
  const currentRoom = getRoom(reservation?.roomId ?? null);
  const [target, setTarget] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [error, setError] = useState('');

  const options = useMemo(
    () =>
    rooms.
    filter((room) => ops.statusByRoom[room.id] === 'available' && room.id !== reservation?.roomId).
    sort((a, b) => a.number.localeCompare(b.number)),
    [ops.statusByRoom, reservation?.roomId, rooms]
  );

  if (!reservation) return null;

  const targetRoom = rooms.find((r) => r.id === target);

  function confirm() {
    if (!target) {
      setError('Select the room the guest is moving to.');
      return;
    }
    changeRoom(reservation.id, target, reason);
    setTarget('');
    setError('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change room"
      subtitle={`${guestName(reservation.guestId)} · ${reservation.code}`}
      footer={
      <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={confirm}>Confirm room change</PrimaryButton>
        </>
      }>
      
      <div className="mb-4 flex items-center gap-4 rounded-lg border border-line bg-canvas px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">From</p>
          <p className="tabular text-[18px] font-bold text-ink">{currentRoom?.number ?? '—'}</p>
          <p className="text-[11px] text-ink-muted">{currentRoom?.type ?? 'Unassigned'}</p>
        </div>
        <ArrowRightIcon aria-hidden="true" className="h-4 w-4 text-ink-muted" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">To</p>
          <p className="tabular text-[18px] font-bold text-ink">{targetRoom?.number ?? '—'}</p>
          <p className="text-[11px] text-ink-muted">{targetRoom?.type ?? 'Select a room'}</p>
        </div>
        {targetRoom ?
        <div className="ml-auto flex items-center gap-2">
            <span className="tabular text-[12px] font-semibold text-ink-soft">
              {money0(targetRoom.rate)}
            </span>
            <StatusPill tone={housekeepingTone[targetRoom.housekeeping]}>
              {housekeepingLabel[targetRoom.housekeeping]}
            </StatusPill>
          </div> :
        null}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="New room" hint={`${options.length} available`}>
          <SelectInput value={target} onChange={(event) => setTarget(event.target.value)}>
            <option value="">Select a room…</option>
            {options.map((room) =>
            <option key={room.id} value={room.id}>
                {room.number} · {room.type} · {room.housekeeping}
              </option>
            )}
          </SelectInput>
        </Field>
        <Field label="Reason">
          <SelectInput value={reason} onChange={(event) => setReason(event.target.value)}>
            {REASONS.map((item) =>
            <option key={item} value={item}>
                {item}
              </option>
            )}
          </SelectInput>
        </Field>
      </div>

      <p className="mt-4 rounded-lg bg-canvas px-3 py-2.5 text-[12px] text-ink-soft">
        Room {currentRoom?.number ?? ''} will be sent to housekeeping as dirty with high priority and
        the move recorded in the reservation history.
      </p>
      {error ?
      <p role="alert" className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-[12px] font-semibold text-[#b3312a]">
          {error}
        </p> :
      null}
    </Modal>);

}