import React, { useMemo, useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { useHotel } from '../../contexts/HotelContext';
import { roomTypeName } from '../../data/property';
import type { Room, RoomTypeId } from '../../types';
import { HousekeepingBadge, RoomStatusBadge } from '../ui/Badge';
import { money } from '../../utils/format';

/** Shared room chooser used by assign, change-room, walk-in and booking flows. */
export function RoomPicker({
  preferredType,
  excludeRoomId,
  selectedRoomId,
  onSelect





}: {preferredType?: RoomTypeId;excludeRoomId?: string | null;selectedRoomId: string | null;onSelect: (roomId: string) => void;}) {
  const { rooms, ops } = useHotel();
  const [onlyPreferred, setOnlyPreferred] = useState(Boolean(preferredType));

  const candidates = useMemo(() => {
    const eligible = rooms.filter((room) => {
      if (room.id === excludeRoomId) return false;
      const status = ops.statusOf(room.id);
      return status === 'available';
    });
    const filtered =
    onlyPreferred && preferredType ?
    eligible.filter((r) => r.type === preferredType) :
    eligible;
    const rank = (room: Room) =>
    room.housekeeping === 'inspected' ? 0 : room.housekeeping === 'clean' ? 1 : 2;
    return [...filtered].sort(
      (a, b) => rank(a) - rank(b) || a.number.localeCompare(b.number)
    );
  }, [rooms, ops, onlyPreferred, preferredType, excludeRoomId]);

  return (
    <div>
      {preferredType &&
      <label className="mb-3 flex items-center gap-2 text-[12px] text-ink-muted">
          <input
          type="checkbox"
          checked={onlyPreferred}
          onChange={(e) => setOnlyPreferred(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-line text-brand-600 focus:ring-brand-500" />
        
          Match booked room type ({roomTypeName(preferredType)})
        </label>
      }

      {candidates.length === 0 ?
      <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-[13px] text-ink-muted">
          No vacant rooms match this filter.
        </p> :

      <ul className="max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
          {candidates.map((room) => {
          const active = room.id === selectedRoomId;
          return (
            <li key={room.id}>
                <button
                type="button"
                onClick={() => onSelect(room.id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150 ease-out ${
                active ?
                'border-brand-500 bg-brand-50' :
                'border-line bg-white hover:bg-slate-50'}`
                }>
                
                  <span className="tabular w-14 text-[15px] font-semibold text-ink">
                    {room.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-ink">
                      {roomTypeName(room.type)}
                    </span>
                    <span className="block text-[11px] text-ink-faint">
                      Floor {room.floor} · {room.view} view · {money(room.rate)}/night
                    </span>
                  </span>
                  <HousekeepingBadge status={room.housekeeping} />
                  <RoomStatusBadge status={ops.statusOf(room.id)} />
                  {active && <CheckIcon className="h-4 w-4 text-brand-600" />}
                </button>
              </li>);

        })}
        </ul>
      }
    </div>);

}