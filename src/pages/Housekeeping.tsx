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

type Filter = 'dirty' | 'cleaning' | 'inspected' | 'completed' | 'all';

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
      if (filter === 'inspected') return room.housekeeping === 'clean';
      if (filter === 'completed') return room.housekeeping === 'inspected';
      return true;
    }).
    filter((room) => priority === 'all' ? true : room.housekeepingPriority === priority).
    sort((a, b) => {
      const rank = (value: HousekeepingPriority) => value === 'high' ? 0 : value === 'normal' ? 1 : 2;
      return rank(a.housekeepingPriority) - rank(b.housekeepingPriority) || a.number.localeCompare(b.number);
    }),
    [filter, priority, rooms]
  );

  const counts = useMemo(() => {
    return {
      dirty: rooms.filter((r) => r.housekeeping === 'dirty').length,
      cleaning: rooms.filter((r) => r.housekeeping === 'cleaning').length,
      inspected: rooms.filter((r) => r.housekeeping === 'clean').length,
      completed: rooms.filter((r) => r.housekeeping === 'inspected').length
    };
  }, [rooms]);

  const completedCount = counts.completed;

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
              Housekeeping Queue
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#176938]">
              <span className="h-2 w-2 rounded-full bg-[#176938] animate-pulse" />
              LIVE HOUSEKEEPING ROSTER
            </span>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 font-normal">
            Dirty → Cleaning → Completed. Departures land here automatically at high priority.
          </p>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              DIRTY ROOMS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-xs">
              <BrushIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {counts.dirty}
            </span>
            <span className="text-xs font-semibold text-amber-700">Needs Cleaning</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              IN CLEANING
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800 shadow-xs">
              <SparklesIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {counts.cleaning}
            </span>
            <span className="text-xs font-semibold text-blue-700">In Progress</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              COMPLETED / CLEAN
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] shadow-xs">
              <CheckCheckIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs font-semibold text-[#176938]">Inspected & Ready</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              TOTAL ROOMS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-xs">
              <SparklesIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {rooms.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Inventory</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
            { id: 'dirty', label: 'Dirty', count: counts.dirty },
            { id: 'cleaning', label: 'Cleaning', count: counts.cleaning },
            { id: 'inspected', label: 'Inspected', count: counts.inspected },
            { id: 'completed', label: 'Completed', count: completedCount },
            { id: 'all', label: 'All rooms', count: rooms.length }
          ]}
          active={filter}
          onChange={(next) => setFilter(next as Filter)}
        />
        
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

      <Card className="glass-card-premium p-0 border border-slate-200/80 shadow-md backdrop-blur-md rounded-2xl overflow-hidden">
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
              <li key={room.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-emerald-50/40 transition-colors">
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
                  {filter === 'inspected' || room.housekeeping === 'clean' ? (
                    <div className="flex items-center gap-2">
                      <PrimaryButton
                        className="px-3 py-2"
                        onClick={() => setHousekeeping(room.id, 'inspected')}>
                        Mark as inspected
                      </PrimaryButton>
                      <SecondaryButton
                        className="px-3 py-2"
                        onClick={() => setHousekeeping(room.id, 'dirty')}>
                        Send back to dirty
                      </SecondaryButton>
                    </div>
                  ) : action ? (
                    <PrimaryButton
                      className="px-3 py-2"
                      onClick={() => setHousekeeping(room.id, action.next)}>
                      {action.label}
                    </PrimaryButton>
                  ) : (
                    <SecondaryButton
                      className="px-3 py-2"
                      onClick={() => setHousekeeping(room.id, 'dirty')}>
                      Send back to dirty
                    </SecondaryButton>
                  )}
                </li>
              );
            })}
          </ul>
        }
      </Card>
    </div>);

}