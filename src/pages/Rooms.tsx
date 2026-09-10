import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BedDoubleIcon, WrenchIcon } from 'lucide-react';
import {
  Card,
  KeyValue,
  PageHeader,
  SearchInput,
  SecondaryButton,
  SelectInput,
  StatusPill
} from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import type { HousekeepingStatus, Room, RoomFrontOfficeStatus } from '../types/hotel';
import {
  housekeepingLabel,
  housekeepingTone,
  roomStatusLabel,
  roomStatusTone } from
'../utils/tone';
import { money0, nightsBetween, shortDate } from '../utils/format';

function getRoomTypeLabel(room: Room): string {
  if (room.type === 'Executive' || room.type === 'Suite') return 'Executive Suite';
  if (room.beds.includes('2') || room.beds.toLowerCase().includes('twin')) return 'Double Queen';
  return `${room.type} King`;
}

function formatGuestNameShort(fullName: string): string {
  if (!fullName || fullName === 'Unknown guest') return 'GUEST';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].toUpperCase();
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${lastName.toUpperCase()}, ${firstName.charAt(0).toUpperCase()}.`;
}

export function Rooms() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, ops, reservations, guestName, tickets } = useHotel();
  const [query, setQuery] = useState(searchParams.get('room') ?? '');
  const [floor, setFloor] = useState<'all' | number>('all');
  const [status, setStatus] = useState<'all' | RoomFrontOfficeStatus>('all');
  const [hk, setHk] = useState<'all' | HousekeepingStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const number = searchParams.get('room');
    return number ? rooms.find((room) => room.number === number)?.id ?? null : null;
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms
      .filter((room) => (floor === 'all' ? true : room.floor === floor))
      .filter((room) => (status === 'all' ? true : ops.statusByRoom[room.id] === status))
      .filter((room) => (hk === 'all' ? true : room.housekeeping === hk))
      .filter((room) =>
        q ? [room.number, room.type, room.view, room.beds].join(' ').toLowerCase().includes(q) : true
      )
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [floor, hk, ops.statusByRoom, query, rooms, status]);

  const selected = rooms.find((room) => room.id === selectedId) ?? filtered[0];
  const selectedReservation = selected
    ? reservations.find(
        (r) =>
          r.roomId === selected.id &&
          (r.status === 'in-house' ||
            ((r.status === 'confirmed' || r.status === 'tentative') && r.departure > ops.today))
      )
    : undefined;
  const selectedTickets = selected
    ? tickets.filter((t) => t.roomId === selected.id && t.status !== 'resolved')
    : [];

  const floors = [...new Set(rooms.map((room) => room.floor))].sort();

  const roomsByFloor = useMemo(() => {
    const map = new Map<number, typeof filtered>();
    for (const room of filtered) {
      const list = map.get(room.floor) || [];
      list.push(room);
      map.set(room.floor, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [filtered]);

  return (
    <div>
      <PageHeader
        eyebrow="Inventory"
        title="Rooms"
        subtitle={`${ops.counts.total} rooms · ${ops.counts.available} available · ${ops.counts.occupied} occupied · ${
          ops.counts.maintenance + ops.counts.outOfService
        } blocked`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value);
            if (searchParams.get('room')) setSearchParams({});
          }}
          placeholder="Search room number, type, view…"
          className="w-[240px]"
        />

        <SelectInput
          value={String(floor)}
          onChange={(event) =>
            setFloor(event.target.value === 'all' ? 'all' : Number(event.target.value))
          }
          className="w-[140px]"
          aria-label="Filter by floor"
        >
          <option value="all">All floors</option>
          {floors.map((value) => (
            <option key={value} value={value}>
              Floor {value}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          value={status}
          onChange={(event) => setStatus(event.target.value as 'all' | RoomFrontOfficeStatus)}
          className="w-[168px]"
          aria-label="Filter by room status"
        >
          <option value="all">All room statuses</option>
          {(
            ['available', 'occupied', 'reserved', 'maintenance', 'out-of-service'] as RoomFrontOfficeStatus[]
          ).map((value) => (
            <option key={value} value={value}>
              {roomStatusLabel[value]}
            </option>
          ))}
        </SelectInput>
        <SelectInput
          value={hk}
          onChange={(event) => setHk(event.target.value as 'all' | HousekeepingStatus)}
          className="w-[168px]"
          aria-label="Filter by housekeeping status"
        >
          <option value="all">All housekeeping</option>
          {(['dirty', 'cleaning', 'clean', 'inspected'] as HousekeepingStatus[]).map((value) => (
            <option key={value} value={value}>
              {housekeepingLabel[value]}
            </option>
          ))}
        </SelectInput>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {filtered.length === 0 ? (
            <Card className="p-12 text-center text-[12px] text-ink-muted">
              No rooms match these filters.
            </Card>
          ) : (
            <div className="space-y-6">
              {roomsByFloor.map(([floorNum, floorRooms]) => (
                <div key={floorNum}>
                  <div className="mb-3.5 flex items-center gap-2.5">
                    <div className="h-1.5 w-6 rounded-full bg-[#84cc16]" />
                    <h2 className="text-[17px] font-bold text-gray-800">
                      Floor {floorNum}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                    {floorRooms.map((room) => {
                      const roomStatus = ops.statusByRoom[room.id];
                      const isSelected = selected?.id === room.id;

                      const roomRes = reservations.find(
                        (r) =>
                          r.roomId === room.id &&
                          (r.status === 'in-house' ||
                            ((r.status === 'confirmed' || r.status === 'tentative') &&
                              r.arrival <= ops.today &&
                              r.departure > ops.today))
                      );

                      const roomTicket = tickets.find(
                        (t) => t.roomId === room.id && t.status !== 'resolved'
                      );

                      let barColor = 'bg-emerald-500';
                      let hasGuest = false;
                      let guestDisplayName = '';
                      let badgeText = '';
                      let statusText = '';
                      let statusTextColor = '';

                      if (roomStatus === 'occupied' || roomRes?.status === 'in-house') {
                        barColor = 'bg-red-500';
                        if (roomRes) {
                          hasGuest = true;
                          guestDisplayName = formatGuestNameShort(guestName(roomRes.guestId));
                          badgeText = `Nights: ${nightsBetween(roomRes.arrival, roomRes.departure)}`;
                        } else {
                          statusText = 'Occupied';
                          statusTextColor = 'text-red-600 font-semibold';
                        }
                      } else if (
                        roomStatus === 'reserved' ||
                        roomRes?.status === 'confirmed' ||
                        roomRes?.status === 'tentative'
                      ) {
                        barColor = 'bg-blue-600';
                        if (roomRes) {
                          hasGuest = true;
                          guestDisplayName = formatGuestNameShort(guestName(roomRes.guestId));
                          badgeText = 'ETA: 14:00';
                        } else {
                          statusText = 'Reserved';
                          statusTextColor = 'text-blue-600 font-semibold';
                        }
                      } else if (
                        roomStatus === 'maintenance' ||
                        roomStatus === 'out-of-service' ||
                        room.outOfService
                      ) {
                        barColor = 'bg-slate-500';
                        statusText = roomTicket ? roomTicket.title : 'HVAC Repair';
                        statusTextColor = 'text-slate-700 font-semibold';
                      } else if (
                        room.housekeeping === 'dirty' ||
                        room.housekeeping === 'cleaning'
                      ) {
                        barColor = 'bg-amber-500';
                        statusText = 'Needs Cleaning';
                        statusTextColor = 'text-amber-800 font-semibold';
                      } else {
                        // Vacant Ready
                        barColor = 'bg-emerald-500';
                        statusText = 'Vacant Ready';
                        statusTextColor = 'text-emerald-700 font-semibold';
                      }

                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => setSelectedId(room.id)}
                          aria-pressed={isSelected}
                          className={[
                            'relative flex min-h-[110px] flex-col justify-between rounded-xl border bg-white p-4 pl-5 text-left shadow-sm transition-all duration-150 hover:shadow-md',
                            isSelected
                              ? 'border-brand-500 ring-2 ring-brand-500/20'
                              : 'border-gray-200/80 hover:border-gray-300'
                          ].join(' ')}
                        >
                          {/* Left accent bar */}
                          <div
                            className={`absolute bottom-0 left-0 top-0 w-[5px] rounded-l-xl ${barColor}`}
                          />

                          <div>
                            <span className="tabular text-[22px] font-bold leading-none tracking-tight text-gray-900">
                              {room.number}
                            </span>
                            <p className="mt-1.5 text-[13px] font-medium text-gray-500">
                              {getRoomTypeLabel(room)}
                            </p>
                          </div>

                          {hasGuest ? (
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="truncate text-[13px] font-bold tracking-tight text-gray-900">
                                {guestDisplayName}
                              </span>
                              <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                                {badgeText}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-3">
                              <span className={`text-[13px] ${statusTextColor}`}>
                                {statusText}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {selected ?
          <>
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      Room details
                    </p>
                    <p className="tabular mt-1 text-[28px] font-bold leading-none text-ink">
                      {selected.number}
                    </p>
                  </div>
                  <StatusPill tone={roomStatusTone[ops.statusByRoom[selected.id]]}>
                    {roomStatusLabel[ops.statusByRoom[selected.id]]}
                  </StatusPill>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <KeyValue label="Type" value={selected.type} />
                  <KeyValue label="Floor" value={selected.floor} />
                  <KeyValue label="Beds" value={selected.beds} />
                  <KeyValue label="Max occupancy" value={selected.maxOccupancy} />
                  <KeyValue label="Rate" value={money0(selected.rate)} />
                  <KeyValue label="View" value={selected.view} />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-[12px] text-ink-muted">Housekeeping</span>
                  <StatusPill tone={housekeepingTone[selected.housekeeping]}>
                    {housekeepingLabel[selected.housekeeping]}
                  </StatusPill>
                </div>
                {selected.housekeeper ?
              <p className="mt-2 text-[11px] text-ink-muted">
                    Assigned to {selected.housekeeper}
                  </p> :
              null}
                <div className="mt-4 flex gap-2">
                  <SecondaryButton className="flex-1" onClick={() => navigate('/housekeeping')}>
                    <BedDoubleIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                    Housekeeping
                  </SecondaryButton>
                  <SecondaryButton className="flex-1" onClick={() => navigate('/maintenance')}>
                    <WrenchIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                    Work orders
                  </SecondaryButton>
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-[15px] font-semibold tracking-tight text-ink">Current guest</h2>
                {selectedReservation ?
              <div className="mt-3 space-y-2">
                    <Link
                  to={`/reservations/${selectedReservation.id}`}
                  className="block text-[13px] font-semibold text-ink hover:text-brand-700">
                  
                      {guestName(selectedReservation.guestId)}
                    </Link>
                    <p className="text-[11px] text-ink-muted">
                      {selectedReservation.code} · {shortDate(selectedReservation.arrival)} →{' '}
                      {shortDate(selectedReservation.departure)}
                    </p>
                    <StatusPill tone={selectedReservation.status === 'in-house' ? 'green' : 'citrus'}>
                      {selectedReservation.status === 'in-house' ? 'In house' : 'Upcoming'}
                    </StatusPill>
                  </div> :

              <p className="mt-3 text-[12px] text-ink-muted">
                    No current or upcoming reservation for this room.
                  </p>
              }
              </Card>

              {selectedTickets.length ?
            <Card className="p-5">
                  <h2 className="text-[15px] font-semibold tracking-tight text-ink">Open work orders</h2>
                  <ul className="mt-3 space-y-2">
                    {selectedTickets.map((ticket) =>
                <li key={ticket.id} className="rounded-lg border border-line px-3 py-2.5">
                        <p className="text-[12px] font-semibold text-ink">{ticket.title}</p>
                        <p className="mt-0.5 text-[11px] text-ink-muted">
                          {ticket.code} · {ticket.priority}
                          {ticket.blocksSale ? ' · blocks sale' : ''}
                        </p>
                      </li>
                )}
                  </ul>
                </Card> :
            null}
            </> :
          null}
        </div>
      </div>
    </div>);

}