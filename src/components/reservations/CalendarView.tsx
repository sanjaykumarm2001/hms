import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  endOfWeek } from
'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Card, CardHeader, SecondaryButton, StatusPill } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import { isoDate, longDate } from '../../utils/format';
import { reservationLabel, reservationTone } from '../../utils/tone';

export function CalendarView() {
  const { reservations, guestName, getRoom, today } = useHotel();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState(today);

  const cursor = addMonths(parseISO(today), monthOffset);
  const grid = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end }).map((date) => isoDate(date));
  }, [cursor]);

  const active = reservations.filter((r) => r.status !== 'cancelled' && r.status !== 'no-show');

  function dayStats(day: string) {
    return {
      arrivals: active.filter((r) => r.arrival === day).length,
      departures: active.filter((r) => r.departure === day).length,
      inHouse: active.filter((r) => r.arrival <= day && r.departure > day).length
    };
  }

  const selectedList = active.
  filter((r) => r.arrival === selected || r.departure === selected || r.arrival < selected && r.departure > selected).
  sort((a, b) => a.arrival.localeCompare(b.arrival));

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="overflow-hidden">
        <CardHeader
          title={format(cursor, 'MMMM yyyy')}
          subtitle="Arrivals, departures and occupancy by date"
          action={
          <div className="flex items-center gap-2">
              <SecondaryButton
              className="px-2.5 py-2"
              aria-label="Previous month"
              onClick={() => setMonthOffset(monthOffset - 1)}>
              
                <ChevronLeftIcon aria-hidden="true" className="h-4 w-4" />
              </SecondaryButton>
              <SecondaryButton className="px-3 py-2" onClick={() => setMonthOffset(0)}>
                Today
              </SecondaryButton>
              <SecondaryButton
              className="px-2.5 py-2"
              aria-label="Next month"
              onClick={() => setMonthOffset(monthOffset + 1)}>
              
                <ChevronRightIcon aria-hidden="true" className="h-4 w-4" />
              </SecondaryButton>
            </div>
          } />
        
        <div className="border-t border-line">
          <div className="grid grid-cols-7 bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) =>
            <p key={label} className="px-3 py-2.5">
                {label}
              </p>
            )}
          </div>
          <div className="grid grid-cols-7">
            {grid.map((day) => {
              const stats = dayStats(day);
              const inMonth = isSameMonth(parseISO(day), cursor);
              const isToday = day === today;
              const isSelected = day === selected;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelected(day)}
                  aria-pressed={isSelected}
                  className={[
                  'h-[92px] border-b border-r border-line px-2.5 py-2 text-left transition-colors duration-150',
                  isSelected ? 'bg-brand-50' : 'bg-white hover:bg-[#fafbf8]',
                  inMonth ? '' : 'opacity-45'].
                  join(' ')}>
                  
                  <span className="flex items-center justify-between">
                    <span
                      className={[
                      'tabular text-[12px] font-bold',
                      isToday ? 'text-brand-700' : 'text-ink'].
                      join(' ')}>
                      
                      {format(parseISO(day), 'd')}
                    </span>
                    {isToday ?
                    <span className="rounded-full bg-brand-600 px-1.5 text-[9px] font-bold uppercase text-white">
                        Today
                      </span> :
                    null}
                  </span>
                  <span className="mt-1.5 block space-y-0.5">
                    {stats.arrivals ?
                    <span className="block text-[10px] font-semibold text-brand-700">
                        {stats.arrivals} arr
                      </span> :
                    null}
                    {stats.departures ?
                    <span className="block text-[10px] font-semibold text-[#b3312a]">
                        {stats.departures} dep
                      </span> :
                    null}
                    {stats.inHouse ?
                    <span className="block text-[10px] text-ink-muted">{stats.inHouse} in house</span> :
                    null}
                  </span>
                </button>);

            })}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title={longDate(selected)} subtitle={`${selectedList.length} reservations touch this date`} />
        {selectedList.length === 0 ?
        <p className="border-t border-line px-5 py-10 text-center text-[12px] text-ink-muted">
            Nothing scheduled on this date.
          </p> :

        <ul className="max-h-[520px] divide-y divide-line overflow-y-auto border-t border-line">
            {selectedList.map((reservation) => {
            const room = getRoom(reservation.roomId);
            const tag =
            reservation.arrival === selected ?
            'Arrival' :
            reservation.departure === selected ?
            'Departure' :
            'Stayover';
            return (
              <li key={reservation.id}>
                  <Link
                  to={`/reservations/${reservation.id}`}
                  className="block px-5 py-3 transition-colors duration-150 hover:bg-[#fafbf8]">
                  
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold text-ink">
                        {guestName(reservation.guestId)}
                      </span>
                      <StatusPill tone={reservationTone[reservation.status]}>
                        {reservationLabel[reservation.status]}
                      </StatusPill>
                    </span>
                    <span className="mt-1 block text-[11px] text-ink-muted">
                      {tag} · {reservation.code} · Room {room?.number ?? 'unassigned'}
                    </span>
                  </Link>
                </li>);

          })}
          </ul>
        }
      </Card>
    </div>);

}