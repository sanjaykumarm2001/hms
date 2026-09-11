import React, { useMemo, useState } from 'react';
import { BrushIcon, CheckCheckIcon, SparklesIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  SelectInput,
  StatusPill,
  Tabs } from
'../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { HOUSEKEEPERS } from '../data/seed';
import type { HousekeepingPriority, HousekeepingStatus } from '../types/hotel';
import {
  housekeepingLabel,
  housekeepingTone,
  priorityTone,
  roomStatusLabel,
  roomStatusTone } from
'../utils/tone';

function nextAction(status: HousekeepingStatus): { label: string; next: HousekeepingStatus } | null {
  if (status === 'dirty') return { label: 'Start cleaning', next: 'cleaning' };
  if (status === 'cleaning') return { label: 'Mark clean', next: 'clean' };
  if (status === 'clean') return { label: 'Mark inspected', next: 'inspected' };
  return null;
}

export function Housekeeping() {
  const { rooms, ops, setHousekeeping, assignHousekeeper, setHousekeepingPriority, reservations, guestName, staff } =
  useHotel();
  const [filter, setFilter] = useState<Filter>('dirty');
  const [priority, setPriority] = useState<'all' | HousekeepingPriority>('all');

  const housekeeperOptions = useMemo(() => {
    const fromStaff = staff
      .filter((s) => s.department === 'Housekeeping' || s.role.toLowerCase().includes('housekeep') || s.role.toLowerCase().includes('clean'))
      .map((s) => s.name);
    return Array.from(new Set([...HOUSEKEEPERS, ...fromStaff]));
  }, [staff]);

  const list = useMemo(
    () =>
    rooms.
    filter((room) => {
      if (filter === 'dirty') return room.housekeeping === 'dirty';
      if (filter === 'cleaning') return room.housekeeping === 'cleaning';
      if (filter === 'completed') return room.housekeeping === 'clean' || room.housekeeping === 'inspected';
      return true;
    }).
    filter((room) => priority === 'all' ? true : room.housekeepingPriority === priority).
    sort((a, b) => {
      const rank = (value: HousekeepingPriority) => value === 'high' ? 0 : value === 'normal' ? 1 : 2;
      return rank(a.housekeepingPriority) - rank(b.housekeepingPriority) || a.number.localeCompare(b.number);
    }),
    [filter, priority, rooms]
  );

  const { counts } = ops;
  const completedCount = counts.clean + counts.inspected;

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Housekeeping"
        subtitle="Dirty → Cleaning → Completed. Departures land here automatically at high priority." />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
        { label: 'Dirty', value: counts.dirty, icon: BrushIcon },
        { label: 'Cleaning', value: counts.cleaning, icon: SparklesIcon },
        { label: 'Completed', value: completedCount, icon: CheckCheckIcon }].
        map((item) =>
        <Card key={item.label} className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-semibold text-ink-soft">{item.label}</p>
              <item.icon aria-hidden="true" className="h-4 w-4 text-ink-muted" />
            </div>
            <p className="tabular mt-3 text-[26px] font-bold leading-none text-ink">{item.value}</p>
          </Card>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
          { id: 'dirty', label: 'Dirty', count: counts.dirty },
          { id: 'cleaning', label: 'Cleaning', count: counts.cleaning },
          { id: 'completed', label: 'Completed', count: completedCount },
          { id: 'all', label: 'All rooms', count: rooms.length }]
          }
          active={filter}
          onChange={(next) => setFilter(next as Filter)} />
        
        <SelectInput
          value={priority}
          onChange={(event) => setPriority(event.target.value as 'all' | HousekeepingPriority)}
          className="w-[125px]"
          aria-label="Filter by priority">
          
          <option value="all">Priority: All</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </SelectInput>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Room queue" subtitle={`${list.length} rooms in this view`} />
        {list.length === 0 ?
        <EmptyState title="Queue is clear" detail="No rooms in this housekeeping state right now." /> :

        <ul className="divide-y divide-line border-t border-line">
            {list.map((room) => {
            const action = nextAction(room.housekeeping);
            const arrival = reservations.find(
              (r) => r.roomId === room.id && r.arrival === ops.today && r.status !== 'cancelled'
            );
            return (
              <li key={room.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <div className="w-[92px]">
                    <p className="tabular text-[16px] font-bold leading-none text-ink">{room.number}</p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      Floor {room.floor} · {room.type}
                    </p>
                  </div>
                  <div className="w-[112px]">
                    <StatusPill tone={housekeepingTone[room.housekeeping]}>
                      {housekeepingLabel[room.housekeeping]}
                    </StatusPill>
                  </div>
                  <div className="w-[120px]">
                    <StatusPill tone={roomStatusTone[ops.statusByRoom[room.id]]} dot={false}>
                      {roomStatusLabel[ops.statusByRoom[room.id]]}
                    </StatusPill>
                  </div>
                  <div className="min-w-[170px] flex-1">
                    {arrival ?
                  <p className="text-[11px] font-semibold text-[#8d5a10]">
                        Arrival today · {guestName(arrival.guestId)}
                      </p> :

                  <p className="text-[11px] text-ink-muted">No arrival waiting</p>
                  }
                  </div>
                  <SelectInput
                  value={room.housekeeper ?? ''}
                  onChange={(event) => assignHousekeeper(room.id, event.target.value)}
                  className="h-9 w-[168px]"
                  aria-label={`Assign housekeeper for room ${room.number}`}>
                  
                    <option value="">Unassigned</option>
                    {housekeeperOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </SelectInput>
                  <SelectInput
                  value={room.housekeepingPriority}
                  onChange={(event) =>
                  setHousekeepingPriority(room.id, event.target.value as HousekeepingPriority)
                  }
                  className="h-9 w-[130px]"
                  aria-label={`Priority for room ${room.number}`}>
                  
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </SelectInput>
                  <div className="w-[96px]">
                    <StatusPill tone={priorityTone[room.housekeepingPriority]} dot={false}>
                      {room.housekeepingPriority}
                    </StatusPill>
                  </div>
                  {action ?
                <PrimaryButton
                  className="px-3 py-2"
                  onClick={() => setHousekeeping(room.id, action.next)}>
                  
                      {action.label}
                    </PrimaryButton> :

                <SecondaryButton
                  className="px-3 py-2"
                  onClick={() => setHousekeeping(room.id, 'dirty')}>
                  
                      Send back to dirty
                    </SecondaryButton>
                }
                </li>);

          })}
          </ul>
        }
      </Card>
    </div>);

}