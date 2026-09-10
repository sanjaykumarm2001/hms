import React, { useMemo, useState } from 'react';
import { LayoutGridIcon, ListIcon } from 'lucide-react';
import { Card } from '../components/ui';
import { roomLegend, rooms } from '../data/rooms';
import { Room, RoomStatus } from '../types';

const statusMeta: Record<RoomStatus, {bar: string;label: string;text: string;}> = {
  available: { bar: '#25b84f', label: 'Vacant Clean', text: 'text-brand-800' },
  dirty: { bar: '#f0a72a', label: 'Vacant Dirty', text: 'text-[#8d5a10]' },
  occupied: { bar: '#e0453c', label: 'Occupied', text: 'text-[#b3312a]' },
  reserved: { bar: '#2f74e0', label: 'Reserved', text: 'text-[#1e57ad]' },
  ooo: { bar: '#6b7280', label: 'Out of Order', text: 'text-ink-soft' }
};

function RoomCard({ room }: {room: Room;}) {
  const meta = statusMeta[room.status];
  return (
    <button
      type="button"
      className="relative w-full overflow-hidden rounded-card border border-line bg-white p-3 text-left shadow-card transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-panel">
      
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: meta.bar }} aria-hidden="true" />
      <p className="tabular pl-1.5 text-[16px] font-bold leading-none text-ink">{room.number}</p>
      <p className="mt-1.5 pl-1.5 text-[11px] text-ink-muted">{room.type}</p>
      <div className="mt-3 flex items-center gap-2 pl-1.5">
        {room.guest ?
        <>
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink">{room.guest}</span>
            <span className="rounded bg-[#f1f2ef] px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft">
              {room.eta ? room.eta : `Nights: ${room.nights}`}
            </span>
          </> :

        <span className={`text-[10.5px] font-semibold ${meta.text}`}>{room.note}</span>
        }
      </div>
    </button>);

}

export function RoomRack() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [floor, setFloor] = useState('all');
  const [type, setType] = useState('all');

  const roomTypes = useMemo(() => Array.from(new Set(rooms.map((r) => r.type))), []);
  const visible = rooms.filter(
    (r) => (floor === 'all' || String(r.floor) === floor) && (type === 'all' || r.type === type)
  );
  const floors = Array.from(new Set(visible.map((r) => r.floor))).sort((a, b) => a - b);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-[26px] font-bold leading-none tracking-tight text-ink">Room Rack</h1>
          <div className="flex items-center gap-1 rounded-lg bg-[#f3f4f0] p-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition-colors duration-150 ${
              view === 'grid' ? 'bg-white text-ink shadow-card' : 'text-ink-soft hover:text-ink'}`
              }>
              
              <LayoutGridIcon aria-hidden="true" className="h-3.5 w-3.5" /> Grid
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition-colors duration-150 ${
              view === 'list' ? 'bg-white text-ink shadow-card' : 'text-ink-soft hover:text-ink'}`
              }>
              
              <ListIcon aria-hidden="true" className="h-3.5 w-3.5" /> List
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            aria-label="Filter by floor"
            className="h-9 rounded-lg border border-line bg-white px-3 text-[12px] font-medium text-ink focus:border-brand-400 focus:outline-none">
            
            <option value="all">All Floors</option>
            {Array.from(new Set(rooms.map((r) => r.floor))).map((f) =>
            <option key={f} value={String(f)}>
                Floor {f}
              </option>
            )}
          </select>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter by room type"
            className="h-9 rounded-lg border border-line bg-white px-3 text-[12px] font-medium text-ink focus:border-brand-400 focus:outline-none">
            
            <option value="all">All Room Types</option>
            {roomTypes.map((t) =>
            <option key={t} value={t}>
                {t}
              </option>
            )}
          </select>

          <ul className="flex items-center gap-3">
            {roomLegend.map((l) =>
            <li key={l.code} className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                {l.code}
              </li>
            )}
          </ul>
        </div>
      </div>

      {view === 'grid' ?
      <div className="space-y-7">
          {floors.map((f) =>
        <section key={f}>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-[3px] w-6 rounded-full bg-brand-gradient" aria-hidden="true" />
                <h2 className="text-[13px] font-semibold text-ink-soft">Floor {f}</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {visible.
            filter((r) => r.floor === f).
            map((room) =>
            <RoomCard key={room.number} room={room} />
            )}
              </div>
            </section>
        )}
        </div> :

      <Card className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Room</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Floor</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Type</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                <th scope="col" className="px-3 py-2.5 pr-5 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((room) =>
            <tr key={room.number} className="transition-colors duration-150 hover:bg-[#fafbf8]">
                  <td className="tabular py-3 pl-5 pr-3 text-[13px] font-bold text-ink">{room.number}</td>
                  <td className="tabular px-3 py-3 text-[12px] text-ink-soft">{room.floor}</td>
                  <td className="px-3 py-3 text-[12px] text-ink-soft">{room.type}</td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusMeta[room.status].bar }} />
                      {statusMeta[room.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-3 pr-5 text-[12px] text-ink-soft">
                    {room.guest ? `${room.guest} · ${room.eta ?? `${room.nights} nights`}` : room.note}
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </Card>
      }
    </div>);

}