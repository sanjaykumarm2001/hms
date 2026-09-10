import React, { useMemo, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { Modal, PrimaryButton, SecondaryButton, SelectInput, StatusPill } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import type { RoomTypeName } from '../../types/hotel';
import { housekeepingLabel, housekeepingTone } from '../../utils/tone';
import { money0 } from '../../utils/format';

export function RoomPickerDialog({
  open,
  onClose,
  onConfirm,
  preferredType,
  title = 'Assign room',
  subtitle,
  confirmLabel = 'Assign room',
  excludeRoomId,
  children










}: {open: boolean;onClose: () => void;onConfirm: (roomId: string) => void;preferredType?: RoomTypeName;title?: string;subtitle?: string;confirmLabel?: string;excludeRoomId?: string | null;children?: React.ReactNode;}) {
  const { rooms, ops } = useHotel();
  const [selected, setSelected] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'preferred' | 'all'>(
    preferredType ? 'preferred' : 'all'
  );

  const options = useMemo(() => {
    return rooms.
    filter((room) => ops.statusByRoom[room.id] === 'available' && room.id !== excludeRoomId).
    filter((room) => typeFilter === 'preferred' && preferredType ? room.type === preferredType : true).
    sort((a, b) => {
      const readyRank = (value: string) => value === 'inspected' ? 0 : value === 'clean' ? 1 : 2;
      return readyRank(a.housekeeping) - readyRank(b.housekeeping) || a.number.localeCompare(b.number);
    });
  }, [excludeRoomId, ops.statusByRoom, preferredType, rooms, typeFilter]);

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected);
    setSelected(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle ?? 'Only rooms that are free of reservations and blocks are listed.'}
      width="max-w-[620px]"
      footer={
      <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleConfirm} disabled={!selected}>
            {confirmLabel}
          </PrimaryButton>
        </>
      }>
      
      {children}
      {preferredType ?
      <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[12px] text-ink-soft">
            Reservation prefers <span className="font-semibold text-ink">{preferredType}</span>
          </p>
          <SelectInput
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as 'preferred' | 'all')}
          className="h-9 w-[200px]"
          aria-label="Room type filter">
          
            <option value="preferred">Preferred type only</option>
            <option value="all">All available rooms</option>
          </SelectInput>
        </div> :
      null}

      {options.length === 0 ?
      <p className="rounded-lg border border-line bg-canvas px-4 py-6 text-center text-[12px] text-ink-muted">
          No sellable rooms match. Try all room types or release a room first.
        </p> :

      <ul className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
          {options.map((room) => {
          const isSelected = selected === room.id;
          const ready = room.housekeeping === 'clean' || room.housekeeping === 'inspected';
          return (
            <li key={room.id}>
                <button
                type="button"
                onClick={() => setSelected(room.id)}
                aria-pressed={isSelected}
                className={[
                'flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors duration-150',
                isSelected ?
                'border-brand-400 bg-brand-50' :
                'border-line bg-white hover:bg-[#fafbf8]'].
                join(' ')}>
                
                  <span className="tabular w-14 text-[15px] font-bold text-ink">{room.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-ink">{room.type}</span>
                    <span className="block text-[11px] text-ink-muted">
                      Floor {room.floor} · {room.beds} · {room.view} · max {room.maxOccupancy}
                    </span>
                  </span>
                  <span className="tabular text-[12px] font-semibold text-ink-soft">
                    {money0(room.rate)}
                  </span>
                  <StatusPill tone={housekeepingTone[room.housekeeping]}>
                    {housekeepingLabel[room.housekeeping]}
                  </StatusPill>
                  {isSelected ?
                <CheckIcon aria-hidden="true" className="h-4 w-4 text-brand-700" /> :

                <span className="w-4" aria-hidden="true" />
                }
                  {!ready ? <span className="sr-only">Room not ready</span> : null}
                </button>
              </li>);

        })}
        </ul>
      }
    </Modal>);

}