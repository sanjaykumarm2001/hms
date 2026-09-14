import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BedDoubleIcon, PlusIcon, WrenchIcon } from 'lucide-react';
import {
  Card,
  KeyValue,
  PageHeader,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  SelectInput,
  StatusPill
} from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { AddRoomDialog } from '../components/workflows/AddRoomDialog';
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
  const [addRoomOpen, setAddRoomOpen] = useState(false);
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
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
              Rooms & Property Inventory
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#176938]">
              <span className="h-2 w-2 rounded-full bg-[#176938] animate-pulse" />
              LIVE ROOM INVENTORY
            </span>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 font-normal">
            {ops.counts.total} total rooms · {ops.counts.available} available · {ops.counts.occupied} occupied · {
              ops.counts.maintenance + ops.counts.outOfService
            } blocked
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrimaryButton gradient onClick={() => setAddRoomOpen(true)}>
            <PlusIcon aria-hidden="true" className="h-4 w-4" />
            Add Room
          </PrimaryButton>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              TOTAL ROOMS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-xs">
              <BedDoubleIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {ops.counts.total}
            </span>
            <span className="text-xs font-semibold text-slate-500">Inventory</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              AVAILABLE READY
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] shadow-xs">
              <BedDoubleIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {ops.counts.available}
            </span>
            <span className="text-xs font-semibold text-[#176938]">Clean & Vacant</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              OCCUPIED
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700 shadow-xs">
              <BedDoubleIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {ops.counts.occupied}
            </span>
            <span className="text-xs font-semibold text-red-700">In-House Guests</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              BLOCKED / OUT OF SERVICE
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fef3c7] text-[#b45309] shadow-xs">
              <WrenchIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {ops.counts.maintenance + ops.counts.outOfService}
            </span>
            <span className="text-xs font-semibold text-[#b45309]">Maintenance</span>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value);
            if (searchParams.get('room')) setSearchParams({});
          }}
          placeholder="Search room number, type, view…"
          className="w-full sm:w-[240px] shrink-0"
        />

        <SelectInput
          value={String(floor)}
          onChange={(event) =>
            setFloor(event.target.value === 'all' ? 'all' : Number(event.target.value))
          }
          className="!w-auto min-w-[130px] shrink-0"
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
          className="!w-auto min-w-[160px] shrink-0"
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
          className="!w-auto min-w-[160px] shrink-0"
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
                            'relative flex min-h-[110px] flex-col justify-between rounded-xl border p-4 pl-5 text-left shadow-sm transition-all duration-150 hover:shadow-md glass-card-premium',
                            isSelected
                              ? 'border-[#176938] ring-2 ring-[#176938]/20 bg-emerald-50/30'
                              : 'border-slate-200/80 bg-white/80 hover:border-slate-300'
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

        <div className="space-y-4 xl:sticky xl:top-6 self-start h-fit">
          {selected ? (
            <>
              <Card className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      ROOM DETAILS
                    </p>
                    <p className="tabular mt-1 text-[30px] font-extrabold leading-none text-slate-900">
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
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-[12px] font-medium text-slate-500">Housekeeping</span>
                  <StatusPill tone={housekeepingTone[selected.housekeeping]}>
                    {housekeepingLabel[selected.housekeeping]}
                  </StatusPill>
                </div>
                {selected.housekeeper ? (
                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    Assigned to {selected.housekeeper}
                  </p>
                ) : null}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/housekeeping')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#176938] hover:bg-[#12532c] text-white px-3 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <BedDoubleIcon className="h-4 w-4" />
                    Housekeeping
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/maintenance')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#176938] hover:bg-[#12532c] text-white px-3 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <WrenchIcon className="h-4 w-4" />
                    Work orders
                  </button>
                </div>
              </Card>

              <Card className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm">
                <h2 className="text-[14px] font-bold tracking-tight text-slate-900">Current guest</h2>
                {selectedReservation ? (
                  <div className="mt-3 space-y-2.5">
                    <Link
                      to={`/reservations/${selectedReservation.id}`}
                      className="block text-[14px] font-bold text-slate-900 hover:text-[#176938] transition-colors"
                    >
                      {guestName(selectedReservation.guestId)}
                    </Link>
                    <p className="text-[12px] font-medium text-slate-500">
                      {selectedReservation.code} · {shortDate(selectedReservation.arrival)} →{' '}
                      {shortDate(selectedReservation.departure)}
                    </p>
                    <div className="pt-1">
                      <StatusPill tone={selectedReservation.status === 'in-house' ? 'green' : 'citrus'}>
                        {selectedReservation.status === 'in-house' ? 'In house' : 'Upcoming'}
                      </StatusPill>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2.5 text-[12px] font-medium text-slate-400">
                    No current or upcoming reservation for this room.
                  </p>
                )}
              </Card>

              {selectedTickets.length ? (
                <Card className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm">
                  <h2 className="text-[14px] font-bold tracking-tight text-slate-900">Open work orders</h2>
                  <ul className="mt-3 space-y-2.5">
                    {selectedTickets.map((ticket) => (
                      <li key={ticket.id} className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
                        <p className="text-[13px] font-bold text-slate-900">{ticket.title}</p>
                        <p className="mt-1 text-[11px] font-medium text-slate-500">
                          {ticket.code} · {ticket.priority}
                          {ticket.blocksSale ? ' · blocks sale' : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <AddRoomDialog
        open={addRoomOpen}
        onClose={() => setAddRoomOpen(false)}
        onRoomCreated={(id, fl) => {
          setSelectedId(id);
          setFloor(fl);
        }}
      />
    </div>
  );
}