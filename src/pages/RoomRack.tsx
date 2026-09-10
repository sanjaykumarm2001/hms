import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BedDoubleIcon, SearchIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import {
  Badge,
  HousekeepingBadge,
  RoomStatusBadge } from
'../components/ui/Badge';
import { Select } from '../components/ui/Field';
import { Button } from '../components/ui/Button';
import { money, titleize } from '../utils/format';
import { roomTypeName } from '../data/property';
import type { FrontOfficeStatus, HousekeepingStatus } from '../types';

const statusRing: Record<FrontOfficeStatus, string> = {
  available: 'border-emerald-200 bg-emerald-50',
  reserved: 'border-brand-200 bg-brand-50',
  occupied: 'border-violet-200 bg-violet-50',
  maintenance: 'border-red-200 bg-red-50',
  out_of_service: 'border-slate-200 bg-slate-50'
};

export function RoomRack() {
  const { rooms, ops, guestById, tickets } = useHotel();
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('room');
  const [floor, setFloor] = useState('all');
  const [status, setStatus] = useState<'all' | FrontOfficeStatus>('all');
  const [hk, setHk] = useState<'all' | HousekeepingStatus>('all');
  const [query, setQuery] = useState('');

  const floors = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b),
    [rooms]
  );

  const filtered = useMemo(
    () =>
    rooms.filter((room) => {
      if (floor !== 'all' && String(room.floor) !== floor) return false;
      if (status !== 'all' && ops.statusOf(room.id) !== status) return false;
      if (hk !== 'all' && room.housekeeping !== hk) return false;
      if (
      query.trim() &&
      !`${room.number} ${roomTypeName(room.type)} ${room.view}`.
      toLowerCase().
      includes(query.trim().toLowerCase()))

      return false;
      return true;
    }),
    [rooms, floor, status, hk, query, ops]
  );

  const selected = rooms.find((r) => r.id === selectedId) ?? null;
  const selectedRes = selected ? ops.reservationForRoom(selected.id) : null;
  const selectedGuest = selectedRes ? guestById(selectedRes.guestId) : undefined;
  const selectedTickets = selected ?
  tickets.filter((t) => t.roomId === selected.id && t.status !== 'resolved') :
  [];

  const legend: {status: FrontOfficeStatus;count: number;}[] = [
  { status: 'available', count: ops.counts.available },
  { status: 'reserved', count: ops.counts.reserved },
  { status: 'occupied', count: ops.counts.occupied },
  { status: 'maintenance', count: ops.counts.maintenance },
  { status: 'out_of_service', count: ops.counts.outOfService }];


  return (
    <Page>
      <PageHeader
        eyebrow="Inventory"
        title="Room Rack"
        subtitle={`${rooms.length} rooms · ${ops.occupancy}% occupied · ${ops.vacantReady.length} vacant and ready`} />
      

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {legend.map((item) =>
        <button
          key={item.status}
          type="button"
          onClick={() => setStatus(status === item.status ? 'all' : item.status)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors duration-150 ease-out ${
          status === item.status ?
          'border-brand-500 bg-brand-50' :
          'border-line bg-white hover:bg-slate-50'}`
          }>
          
            <RoomStatusBadge status={item.status} />
            <span className="tabular text-[13px] font-semibold text-ink">
              {item.count}
            </span>
          </button>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
            <Select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              aria-label="Filter by floor"
              className="w-auto">
              
              <option value="all">All floors</option>
              {floors.map((f) =>
              <option key={f} value={String(f)}>
                  Floor {f}
                </option>
              )}
            </Select>
            <Select
              value={hk}
              onChange={(e) => setHk(e.target.value as HousekeepingStatus | 'all')}
              aria-label="Filter by housekeeping status"
              className="w-auto">
              
              <option value="all">All housekeeping</option>
              <option value="dirty">Dirty</option>
              <option value="cleaning">Cleaning</option>
              <option value="clean">Clean</option>
              <option value="inspected">Inspected</option>
            </Select>
            <div className="relative ml-auto w-full max-w-[240px]">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rooms…"
                aria-label="Search rooms"
                className="h-9 w-full rounded-lg border border-line bg-white pl-8 pr-3 text-[13px] focus:border-brand-500 focus:outline-none" />
              
            </div>
          </div>

          {filtered.length === 0 ?
          <EmptyState icon={BedDoubleIcon} title="No rooms match these filters" /> :

          <div className="space-y-5 p-4">
              {floors.
            filter((f) => filtered.some((r) => r.floor === f)).
            map((f) =>
            <div key={f}>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                      Floor {f}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {filtered.
                filter((r) => r.floor === f).
                map((room) => {
                  const st = ops.statusOf(room.id);
                  const res = ops.reservationForRoom(room.id);
                  const guest = res ? guestById(res.guestId) : undefined;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setParams({ room: room.id })}
                      className={`rounded-xl border px-3 py-2.5 text-left transition-colors duration-150 ease-out ${statusRing[st]} ${
                      selectedId === room.id ? 'ring-2 ring-brand-500' : ''}`
                      }>
                      
                              <div className="flex items-center justify-between">
                                <span className="tabular text-[16px] font-semibold text-ink">
                                  {room.number}
                                </span>
                                <span
                          className={`h-2 w-2 rounded-full ${
                          room.housekeeping === 'dirty' ?
                          'bg-red-500' :
                          room.housekeeping === 'cleaning' ?
                          'bg-amber-500' :
                          room.housekeeping === 'clean' ?
                          'bg-brand-500' :
                          'bg-emerald-500'}`
                          } />
                        
                              </div>
                              <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                                {roomTypeName(room.type)}
                              </p>
                              <p className="mt-1 truncate text-[11px] font-medium text-ink">
                                {guest ?
                        `${guest.firstName} ${guest.lastName}` :
                        titleize(st)}
                              </p>
                            </button>);

                })}
                    </div>
                  </div>
            )}
            </div>
          }
        </Card>

        <aside>
          {selected ?
          <Card title={`Room ${selected.number}`}>
              <div className="flex flex-wrap items-center gap-2">
                <RoomStatusBadge status={ops.statusOf(selected.id)} />
                <HousekeepingBadge status={selected.housekeeping} />
                <Badge tone="neutral">{titleize(selected.hkPriority)} priority</Badge>
              </div>
              <dl className="mt-4 space-y-2.5 border-t border-line pt-4">
                {[
              { label: 'Room type', value: roomTypeName(selected.type) },
              { label: 'Floor', value: String(selected.floor) },
              { label: 'Beds', value: selected.beds },
              { label: 'Max occupancy', value: `${selected.maxOccupancy} guests` },
              { label: 'Rack rate', value: `${money(selected.rate)} / night` },
              { label: 'View', value: selected.view },
              {
                label: 'Attendant',
                value: selected.housekeeper ?? 'Unassigned'
              }].
              map((row) =>
              <div key={row.label} className="flex justify-between gap-3">
                    <dt className="text-[12px] text-ink-faint">{row.label}</dt>
                    <dd className="text-[12px] font-medium text-ink">{row.value}</dd>
                  </div>
              )}
              </dl>

              {selectedRes &&
            <div className="mt-4 rounded-lg border border-line p-3">
                  <p className="text-[11px] font-medium text-ink-faint">
                    Current reservation
                  </p>
                  <Link
                to={`/bookings/${selectedRes.id}`}
                className="mt-0.5 block text-[13px] font-semibold text-brand-600">
                
                    #{selectedRes.confirmation}
                  </Link>
                  <p className="text-[12px] text-ink-muted">
                    {selectedGuest ?
                `${selectedGuest.firstName} ${selectedGuest.lastName}` :
                ''}{' '}
                    · {selectedRes.arrival} → {selectedRes.departure}
                  </p>
                </div>
            }

              {selectedTickets.length > 0 &&
            <div className="mt-4 rounded-lg bg-red-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-red-700">
                    Open work orders
                  </p>
                  <ul className="mt-1 space-y-1">
                    {selectedTickets.map((t) =>
                <li key={t.id} className="text-[12px] text-red-900">
                        {t.title}
                        {t.blocksSale && ' · blocks sale'}
                      </li>
                )}
                  </ul>
                </div>
            }

              <div className="mt-4 flex gap-2">
                <Link to="/housekeeping" className="flex-1">
                  <Button className="w-full">Housekeeping</Button>
                </Link>
                <Link to="/maintenance" className="flex-1">
                  <Button className="w-full">Maintenance</Button>
                </Link>
              </div>
            </Card> :

          <Card>
              <EmptyState
              icon={BedDoubleIcon}
              title="Select a room"
              detail="Choose a room from the rack to see its status, guest, and work orders." />
            
            </Card>
          }
        </aside>
      </div>
    </Page>);

}