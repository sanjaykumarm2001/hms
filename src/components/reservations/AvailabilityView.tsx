import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, format, parseISO } from 'date-fns';
import { Card, CardHeader, SecondaryButton, SelectInput } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import { isoDate } from '../../utils/format';

const SPAN = 14;

export function AvailabilityView() {
  const navigate = useNavigate();
  const { rooms, reservations, guestName, ops, today } = useHotel();
  const [offset, setOffset] = useState(0);
  const [floor, setFloor] = useState<'all' | number>('all');

  const days = useMemo(
    () =>
    Array.from({ length: SPAN }, (_, index) => isoDate(addDays(parseISO(today), offset + index))),
    [offset, today]
  );

  const visibleRooms = rooms.
  filter((room) => floor === 'all' ? true : room.floor === floor).
  sort((a, b) => a.number.localeCompare(b.number));

  const active = reservations.filter(
    (r) => r.roomId && r.status !== 'cancelled' && r.status !== 'no-show'
  );

  function cellFor(roomId: string, day: string) {
    return active.find((r) => r.roomId === roomId && r.arrival <= day && r.departure > day);
  }

  const floors = [...new Set(rooms.map((room) => room.floor))].sort();
  const sellable = visibleRooms.filter(
    (room) => ops.statusByRoom[room.id] !== 'maintenance' && ops.statusByRoom[room.id] !== 'out-of-service'
  ).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Availability & room planning"
        subtitle={`${sellable} sellable rooms · ${SPAN}-day horizon from ${format(
          parseISO(days[0]),
          'dd MMM'
        )}`}
        action={
        <div className="flex items-center gap-2">
            <SelectInput
            value={String(floor)}
            onChange={(event) =>
            setFloor(event.target.value === 'all' ? 'all' : Number(event.target.value))
            }
            className="h-9 w-[130px]"
            aria-label="Filter by floor">
            
              <option value="all">All floors</option>
              {floors.map((value) =>
            <option key={value} value={value}>
                  Floor {value}
                </option>
            )}
            </SelectInput>
            <SecondaryButton className="px-3 py-2" onClick={() => setOffset(Math.max(0, offset - 7))}>
              Earlier
            </SecondaryButton>
            <SecondaryButton className="px-3 py-2" onClick={() => setOffset(offset + 7)}>
              Later
            </SecondaryButton>
          </div>
        } />
      
      <div className="overflow-x-auto border-t border-line">
        <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
              <th scope="col" className="sticky left-0 z-10 bg-[#fafbf8] py-2.5 pl-5 pr-3 font-semibold">
                Room
              </th>
              {days.map((day) =>
              <th key={day} scope="col" className="px-2 py-2.5 text-center font-semibold">
                  <span className="block">{format(parseISO(day), 'EEE')}</span>
                  <span className="tabular block text-[11px] font-bold text-ink-soft">
                    {format(parseISO(day), 'dd')}
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRooms.map((room) => {
              const blocked =
              ops.statusByRoom[room.id] === 'maintenance' ||
              ops.statusByRoom[room.id] === 'out-of-service';
              return (
                <tr key={room.id}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-t border-line bg-white py-2 pl-5 pr-3 text-left">
                    
                    <span className="tabular block text-[13px] font-semibold text-ink">
                      {room.number}
                    </span>
                    <span className="block text-[10px] text-ink-muted">{room.type}</span>
                  </th>
                  {days.map((day) => {
                    const reservation = cellFor(room.id, day);
                    if (blocked) {
                      return (
                        <td key={day} className="border-t border-line px-1 py-1">
                          <span
                            className="block h-8 rounded-md bg-[#fdeceb]"
                            title={`Room ${room.number} blocked`} />
                          
                        </td>);

                    }
                    if (!reservation) {
                      return (
                        <td key={day} className="border-t border-line px-1 py-1">
                          <span className="block h-8 rounded-md bg-[#f4f6f1]" />
                        </td>);

                    }
                    const isStart = reservation.arrival === day;
                    return (
                      <td key={day} className="border-t border-line px-1 py-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/reservations/${reservation.id}`)}
                          title={`${guestName(reservation.guestId)} · ${reservation.code}`}
                          className={[
                          'block h-8 w-full truncate rounded-md px-1.5 text-left text-[10px] font-semibold transition-colors duration-150',
                          reservation.status === 'in-house' ?
                          'bg-brand-600 text-white hover:bg-brand-500' :
                          'bg-[#eaf1fd] text-[#1e57ad] hover:bg-[#dce8fb]'].
                          join(' ')}>
                          
                          {isStart ? guestName(reservation.guestId).split(' ')[0] : ''}
                        </button>
                      </td>);

                  })}
                </tr>);

            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3 text-[11px] text-ink-muted">
        {[
        { label: 'In house', color: '#25b84f' },
        { label: 'Reserved', color: '#a9c8f5' },
        { label: 'Free', color: '#f4f6f1' },
        { label: 'Blocked', color: '#f6cfcc' }].
        map((item) =>
        <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        )}
      </div>
    </Card>);

}