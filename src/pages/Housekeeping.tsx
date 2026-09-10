import React from 'react';
import { toast } from 'sonner';
import { BrushIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Field';
import { roomTypeName } from '../data/property';
import type { HousekeepingPriority, HousekeepingStatus, Room } from '../types';

const columns: {
  status: HousekeepingStatus;
  label: string;
  accent: string;
  next?: {status: HousekeepingStatus;label: string;};
}[] = [
{
  status: 'dirty',
  label: 'Dirty',
  accent: 'bg-red-500',
  next: { status: 'cleaning', label: 'Start cleaning' }
},
{
  status: 'cleaning',
  label: 'Cleaning',
  accent: 'bg-amber-500',
  next: { status: 'clean', label: 'Mark clean' }
},
{
  status: 'clean',
  label: 'Clean',
  accent: 'bg-brand-500',
  next: { status: 'inspected', label: 'Pass inspection' }
},
{ status: 'inspected', label: 'Inspected', accent: 'bg-emerald-500' }];


export function Housekeeping() {
  const { rooms, ops, staff, updateHousekeeping, guestById } = useHotel();
  const attendants = staff.filter((s) => s.department === 'housekeeping');

  const priorityRank: Record<HousekeepingPriority, number> = {
    high: 0,
    normal: 1,
    low: 2
  };
  const sortRooms = (list: Room[]) =>
  [...list].sort(
    (a, b) =>
    priorityRank[a.hkPriority] - priorityRank[b.hkPriority] ||
    a.number.localeCompare(b.number)
  );

  return (
    <Page>
      <PageHeader
        eyebrow="Housekeeping"
        title="Room Care Board"
        subtitle={`${ops.counts.dirty} dirty · ${ops.counts.cleaning} in progress · ${ops.counts.inspected} inspected and sellable`} />
      

      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => {
          const list = sortRooms(
            rooms.filter((r) => r.housekeeping === column.status)
          );
          return (
            <section
              key={column.status}
              className="flex flex-col rounded-xl border border-line bg-white shadow-card">
              
              <header className="flex items-center gap-2 border-b border-line px-4 py-3">
                <span className={`h-2 w-2 rounded-full ${column.accent}`} />
                <h2 className="text-[13px] font-semibold text-ink">{column.label}</h2>
                <span className="tabular ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-ink-muted">
                  {list.length}
                </span>
              </header>

              {list.length === 0 ?
              <EmptyState icon={BrushIcon} title="Nothing queued" /> :

              <ul className="flex-1 divide-y divide-line">
                  {list.map((room) => {
                  const res = ops.reservationForRoom(room.id);
                  const guest = res ? guestById(res.guestId) : undefined;
                  const arrivalToday = ops.arrivals.some(
                    (a) => a.roomId === room.id
                  );
                  return (
                    <li key={room.id} className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="tabular text-[15px] font-semibold text-ink">
                            {room.number}
                          </span>
                          {room.hkPriority === 'high' &&
                        <Badge tone="red">High</Badge>
                        }
                          {arrivalToday && <Badge tone="amber">Arrival today</Badge>}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                          {roomTypeName(room.type)} · Floor {room.floor}
                          {guest ? ` · ${guest.firstName} ${guest.lastName}` : ''}
                        </p>

                        <div className="mt-2 grid gap-1.5">
                          <Select
                          aria-label={`Assign attendant to room ${room.number}`}
                          value={room.housekeeper ?? ''}
                          onChange={(e) => {
                            updateHousekeeping(room.id, {
                              housekeeper: e.target.value || null
                            });
                            toast.success(
                              e.target.value ?
                              `Room ${room.number} assigned to ${e.target.value}` :
                              `Room ${room.number} unassigned`
                            );
                          }}
                          className="h-8 text-[12px]">
                          
                            <option value="">Unassigned</option>
                            {attendants.map((a) =>
                          <option key={a.id} value={a.name}>
                                {a.name}
                              </option>
                          )}
                          </Select>
                          <Select
                          aria-label={`Priority for room ${room.number}`}
                          value={room.hkPriority}
                          onChange={(e) =>
                          updateHousekeeping(room.id, {
                            hkPriority: e.target.value as HousekeepingPriority
                          })
                          }
                          className="h-8 text-[12px]">
                          
                            <option value="high">High priority</option>
                            <option value="normal">Normal priority</option>
                            <option value="low">Low priority</option>
                          </Select>
                          {column.next &&
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            updateHousekeeping(room.id, {
                              housekeeping: column.next!.status
                            });
                            toast.success(
                              `Room ${room.number} → ${column.next!.status}`
                            );
                          }}>
                          
                              {column.next.label}
                            </Button>
                        }
                          {!column.next &&
                        <Button
                          size="sm"
                          onClick={() => {
                            updateHousekeeping(room.id, {
                              housekeeping: 'dirty',
                              hkPriority: 'normal'
                            });
                            toast.success(`Room ${room.number} reopened as dirty`);
                          }}>
                          
                              Reopen as dirty
                            </Button>
                        }
                        </div>
                      </li>);

                })}
                </ul>
              }
            </section>);

        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card title="Attendant workload">
          <ul className="space-y-3">
            {attendants.map((a) => {
              const assigned = rooms.filter(
                (r) => r.housekeeper === a.name && r.housekeeping !== 'inspected'
              );
              return (
                <li key={a.id} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">
                      {a.name}
                    </span>
                    <span className="block text-[11px] text-ink-faint">
                      {a.role} · {a.shift}
                    </span>
                  </span>
                  <span className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.min(100, assigned.length * 20)}%` }} />
                    
                  </span>
                  <span className="tabular w-16 text-right text-[12px] text-ink-muted">
                    {assigned.length} rooms
                  </span>
                </li>);

            })}
          </ul>
        </Card>

        <Card title="Rooms needed for today's arrivals">
          {ops.arrivals.filter((a) => a.roomId).length === 0 ?
          <EmptyState icon={BrushIcon} title="No assigned arrival rooms" /> :

          <ul className="space-y-2.5">
              {ops.arrivals.
            filter((a) => a.roomId).
            map((res) => {
              const room = rooms.find((r) => r.id === res.roomId)!;
              const ready =
              room.housekeeping === 'inspected' || room.housekeeping === 'clean';
              return (
                <li key={res.id} className="flex items-center gap-3">
                      <span className="tabular w-12 text-[13px] font-semibold text-ink">
                        {room.number}
                      </span>
                      <span className="flex-1 text-[12px] text-ink-muted">
                        #{res.confirmation}
                      </span>
                      <Badge tone={ready ? 'green' : 'amber'}>
                        {ready ? 'Ready' : 'Needs attention'}
                      </Badge>
                    </li>);

            })}
            </ul>
          }
        </Card>
      </div>
    </Page>);

}