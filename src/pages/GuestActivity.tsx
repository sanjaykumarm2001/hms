import { useMemo, useState } from 'react';
import {
  DoorOpenIcon,
  DownloadIcon,
  LockIcon,
  LogOutIcon,
  MousePointerClickIcon,
  ReceiptIcon,
  SparklesIcon
} from 'lucide-react';
import { PageHeader, PrimaryButton, SearchInput } from '../components/ui';
import { money } from '../utils/format';

export interface ActivityEvent {
  id: string;
  title: string;
  category: 'room' | 'access' | 'pos' | 'security' | 'wellness';
  status: 'GRANTED' | 'DENIED' | 'CHARGED' | 'IN' | 'OUT';
  guestName: string;
  roomNumber: string;
  timestamp: string;
  exactInTime?: string;
  exactOutTime?: string;
  detail?: string;
  amount?: number;
  deviceUid: string;
  keycardUid: string;
}

const SEED_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-101',
    title: 'Room 402 Entry',
    category: 'room',
    status: 'IN',
    guestName: 'Eleanor Vance',
    roomNumber: '402',
    timestamp: 'Just now',
    exactInTime: '17:25:04',
    exactOutTime: '09:14:12',
    detail: 'Keycard unlocked door 402',
    deviceUid: 'LOCK-RM-402',
    keycardUid: 'KC-990214'
  },
  {
    id: 'act-102',
    title: 'Room 1105 Exit',
    category: 'room',
    status: 'OUT',
    guestName: 'Marcus Thorne',
    roomNumber: '1105',
    timestamp: '5m ago',
    exactInTime: '14:10:30',
    exactOutTime: '17:20:18',
    detail: 'Door closed & deadbolt engaged',
    deviceUid: 'LOCK-RM-1105',
    keycardUid: 'KC-884012'
  },
  {
    id: 'act-1',
    title: 'Main Entrance',
    category: 'access',
    status: 'GRANTED',
    guestName: 'Eleanor Vance',
    roomNumber: '402',
    timestamp: '15m ago',
    exactInTime: '17:10:00',
    exactOutTime: '09:14:12',
    deviceUid: 'RDR-ENT-01',
    keycardUid: 'KC-990214'
  },
  {
    id: 'act-2',
    title: 'Spa & Wellness Center',
    category: 'wellness',
    status: 'GRANTED',
    guestName: 'Marcus Thorne',
    roomNumber: '1105',
    timestamp: '25m ago',
    exactInTime: '14:10:30',
    exactOutTime: '17:00:45',
    deviceUid: 'RDR-SPA-03',
    keycardUid: 'KC-884012'
  },
  {
    id: 'act-103',
    title: 'Room 822 Exit',
    category: 'room',
    status: 'OUT',
    guestName: 'Sarah Jenkins',
    roomNumber: '822',
    timestamp: '35m ago',
    exactInTime: '11:05:15',
    exactOutTime: '16:50:22',
    detail: 'Keycard tapped on exit handle',
    deviceUid: 'LOCK-RM-822',
    keycardUid: 'KC-772910'
  },
  {
    id: 'act-3',
    title: 'Lobby Bar POS',
    category: 'pos',
    status: 'CHARGED',
    guestName: 'Sarah Jenkins',
    roomNumber: '822',
    timestamp: '45m ago',
    exactInTime: '11:05:15',
    exactOutTime: '16:40:00',
    detail: 'Folio charge added ($42.50)',
    amount: 42.50,
    deviceUid: 'POS-BAR-01',
    keycardUid: 'KC-772910'
  },
  {
    id: 'act-4',
    title: 'Service Elevator B',
    category: 'security',
    status: 'DENIED',
    guestName: 'Unregistered Card',
    roomNumber: '—',
    timestamp: '1h ago',
    exactInTime: '—',
    exactOutTime: '16:25:00',
    detail: 'Invalid keycard swipe detected.',
    deviceUid: 'RDR-ELV-02B',
    keycardUid: 'KC-000000'
  },
  {
    id: 'act-104',
    title: 'Room 505 Entry',
    category: 'room',
    status: 'IN',
    guestName: 'Daniel Brennan',
    roomNumber: '505',
    timestamp: '1h 20m ago',
    exactInTime: '16:05:40',
    exactOutTime: '08:30:15',
    detail: 'Guest keycard door unlock',
    deviceUid: 'LOCK-RM-505',
    keycardUid: 'KC-551982'
  },
  {
    id: 'act-5',
    title: 'Executive Lounge',
    category: 'access',
    status: 'GRANTED',
    guestName: 'Daniel Brennan',
    roomNumber: '505',
    timestamp: '2h ago',
    exactInTime: '15:25:00',
    exactOutTime: '08:30:15',
    deviceUid: 'RDR-EXL-01',
    keycardUid: 'KC-551982'
  },
  {
    id: 'act-6',
    title: 'Fitness Center',
    category: 'wellness',
    status: 'GRANTED',
    guestName: 'Sofia Marchetti',
    roomNumber: '204',
    timestamp: '3h ago',
    exactInTime: '14:20:00',
    exactOutTime: '10:00:00',
    deviceUid: 'RDR-FIT-02',
    keycardUid: 'KC-331049'
  }
];

export function GuestActivity() {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'room' | 'amenities'>('room');
  const [selectedId, setSelectedId] = useState<string | null>('act-101');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SEED_ACTIVITIES
      .filter((act) => {
        if (categoryFilter === 'room') return act.category === 'room';
        return act.category !== 'room';
      })
      .filter((act) =>
        q
          ? [act.roomNumber, act.guestName, act.title, act.detail, act.status]
              .join(' ')
              .toLowerCase()
              .includes(q)
          : true
      );
  }, [categoryFilter, query]);

  const selectedEvent = SEED_ACTIVITIES.find((act) => act.id === selectedId) || filtered[0];

  return (
    <div>
      <PageHeader
        eyebrow="Monitoring"
        title="Guest Activity"
        subtitle="Real-time guest movements, room in/out activity tracking, and amenity access logs."
        actions={
          <PrimaryButton gradient onClick={() => alert('Activity log exported to CSV.')}>
            <DownloadIcon aria-hidden="true" className="h-4 w-4" />
            Export Log
          </PrimaryButton>
        }
      />

      {/* Horizontal Inline Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={(val) => setQuery(val)}
          placeholder="Search by room # or guest name…"
          className="w-[280px]"
        />

        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-ink-muted">Filter by:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'room' | 'amenities')}
            className="h-10 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink focus:border-brand-400 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="room">Rooms (In/Out Activity)</option>
            <option value="amenities">Amenities & Services</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Live Feed Column */}
        <div className="rounded-2xl border border-white/80 bg-white/80 backdrop-blur-md p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-bold text-gray-900">
                {categoryFilter === 'room' ? 'Room In/Out Activity Feed' : 'Amenities Access Feed'}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              LIVE
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-xs text-gray-400">No activity logs match your filter.</p>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedEvent?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex w-full items-start justify-between rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-light/30 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-white/80 bg-white/80 backdrop-blur-sm hover:bg-emerald-50/60 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                          item.status === 'IN'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.status === 'OUT'
                            ? 'bg-amber-100 text-amber-700'
                            : item.status === 'GRANTED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status === 'IN' ? (
                          <DoorOpenIcon className="h-5 w-5" />
                        ) : item.status === 'OUT' ? (
                          <LogOutIcon className="h-5 w-5" />
                        ) : item.category === 'pos' ? (
                          <ReceiptIcon className="h-5 w-5" />
                        ) : item.category === 'wellness' ? (
                          <SparklesIcon className="h-5 w-5" />
                        ) : (
                          <LockIcon className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-gray-900">{item.title}</span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-extrabold tracking-wider ${
                              item.status === 'IN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'OUT'
                                ? 'bg-amber-100 text-amber-800'
                                : item.status === 'GRANTED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {item.detail && (
                          <p className="mt-0.5 text-[12px] font-medium text-gray-500">
                            {item.detail} {item.amount ? `: ${money(item.amount)}` : ''}
                          </p>
                        )}

                        <p className="mt-1 text-[12px] text-gray-600">
                          <span className="font-semibold text-gray-800">{item.guestName}</span> · Room{' '}
                          <span className="font-bold text-gray-900">{item.roomNumber}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-gray-400">{item.timestamp}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Panel: In / Out Activity */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm flex flex-col justify-start text-left min-h-[420px]">
          {selectedEvent ? (
            <div className="w-full space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    ROOM ACTIVITY DETAIL
                  </p>
                  <h3 className="text-xl font-bold text-gray-900">In / Out Activity</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    selectedEvent.status === 'IN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedEvent.status === 'OUT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedEvent.status === 'IN'
                    ? 'ROOM IN (Occupied)'
                    : selectedEvent.status === 'OUT'
                    ? 'ROOM OUT (Vacant)'
                    : selectedEvent.status}
                </span>
              </div>

              {/* Guest & Room Summary */}
              <div className="grid grid-cols-2 gap-3.5 text-[13px] bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-xs font-medium">Guest Name</span>
                  <span className="font-bold text-gray-900">{selectedEvent.guestName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs font-medium">Room Number</span>
                  <span className="font-bold text-gray-900">Room {selectedEvent.roomNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs font-medium">Lock Device ID</span>
                  <span className="font-semibold text-gray-700">{selectedEvent.deviceUid}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs font-medium">Keycard UID</span>
                  <span className="font-semibold text-gray-700">{selectedEvent.keycardUid}</span>
                </div>
              </div>

              {/* Movement Activity Breakdown */}
              <div className="space-y-3">
                <h4 className="text-[13px] font-bold text-gray-900">Movement & Keycard Log</h4>
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 p-3 border border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <div>
                        <p className="font-bold text-emerald-900">Exact Entry (IN): {selectedEvent.exactInTime || '14:22:05'}</p>
                        <p className="text-[11px] text-emerald-700">Keycard tapped on door sensor</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-800">{selectedEvent.exactInTime || '14:22:05'}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-amber-50/70 p-3 border border-amber-100">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <div>
                        <p className="font-bold text-amber-900">Exact Exit (OUT): {selectedEvent.exactOutTime || '10:15:30'}</p>
                        <p className="text-[11px] text-amber-700">Door closed & deadbolt engaged</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-800">{selectedEvent.exactOutTime || '10:15:30'}</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="rounded-xl bg-[#0f172a] p-4 text-white space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400 border-b border-slate-700 pb-2">
                  <span>ROOM LOCK TELEMETRY</span>
                  <span className="text-emerald-400 font-mono">ONLINE</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span>Current Room Status:</span>
                  <span className="text-emerald-300 font-bold">
                    {selectedEvent.status === 'IN' ? 'GUEST INSIDE ROOM' : 'GUEST OUTSIDE ROOM'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono">
                  LOG: {selectedEvent.timestamp} — Swipe registered for {selectedEvent.guestName} (Room {selectedEvent.roomNumber})
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 space-y-3 text-center mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <MousePointerClickIcon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Select a room activity</h3>
              <p className="text-[13px] text-gray-500 max-w-[260px] mx-auto">
                Click on any room entry/exit item to view detailed In / Out activity logs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
