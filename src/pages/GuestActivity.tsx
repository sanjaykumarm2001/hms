import { useMemo, useState } from 'react';
import {
  DoorOpenIcon,
  DownloadIcon,
  LockIcon,
  LogOutIcon,
  MousePointerClickIcon,
  ReceiptIcon,
  SelectInput,
  ShieldAlertIcon,
  SparklesIcon
} from 'lucide-react';
import { PageHeader, PrimaryButton, SearchInput } from '../components/ui';

export interface ActivityEvent {
  id: string;
  title: string;
  category: 'room' | 'access' | 'pos' | 'security' | 'wellness';
  status: 'GRANTED' | 'DENIED' | 'CHARGED' | 'IN' | 'OUT';
  guestName: string;
  roomNumber: string;
  timestamp: string;
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
    deviceUid: 'RDR-FIT-02',
    keycardUid: 'KC-331049'
  }
];

export function GuestActivity() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SEED_ACTIVITIES
      .filter((act) => (categoryFilter === 'all' ? true : act.category === categoryFilter))
      .filter((act) => (statusFilter === 'all' ? true : act.status === statusFilter))
      .filter((act) =>
        q
          ? [act.title, act.guestName, act.roomNumber, act.detail, act.status]
              .join(' ')
              .toLowerCase()
              .includes(q)
          : true
      );
  }, [categoryFilter, statusFilter, query]);

  const selectedEvent = SEED_ACTIVITIES.find((act) => act.id === selectedId);

  return (
    <div>
      <PageHeader
        eyebrow="Monitoring"
        title="Activity Pulse"
        subtitle="Real-time guest movements, room in/out tracking, and access logs."
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
          placeholder="Search by guest name or room #…"
          className="w-[260px]"
        />

        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-ink-muted">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-lg border border-line bg-white px-3 text-[13px] text-ink focus:border-brand-400 focus:outline-none"
          >
            <option value="all">All Amenities & Rooms</option>
            <option value="room">Room Keycard (In/Out)</option>
            <option value="access">Building Access</option>
            <option value="wellness">Spa & Fitness</option>
            <option value="pos">Bar & POS Charges</option>
            <option value="security">Security Alerts</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[12px] font-semibold text-ink-muted">In/Out Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-line bg-white px-3 text-[13px] text-ink focus:border-brand-400 focus:outline-none"
          >
            <option value="all">All Movements</option>
            <option value="IN">In (Room Entry)</option>
            <option value="OUT">Out (Room Exit)</option>
            <option value="GRANTED">Granted</option>
            <option value="DENIED">Denied</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Live Feed Column */}
        <div className="rounded-2xl border border-white/80 bg-white/80 backdrop-blur-md p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-bold text-gray-900">Live Feed</h2>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              MONITORING
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-xs text-gray-400">No activity logs match your filter.</p>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex w-full items-start justify-between rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-light/30 ring-2 ring-brand-500/20'
                        : 'border-white/80 bg-white/80 backdrop-blur-sm hover:bg-emerald-50/60 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          item.status === 'GRANTED'
                            ? 'bg-emerald-50 text-emerald-600'
                            : item.status === 'DENIED'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {item.category === 'pos' ? (
                          <ReceiptIcon className="h-5 w-5" />
                        ) : item.category === 'wellness' ? (
                          <SparklesIcon className="h-5 w-5" />
                        ) : item.status === 'DENIED' ? (
                          <ShieldAlertIcon className="h-5 w-5" />
                        ) : (
                          <LockIcon className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-gray-900">{item.title}</span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider ${
                              item.status === 'GRANTED'
                                ? 'bg-emerald-100/70 text-emerald-700'
                                : item.status === 'DENIED'
                                ? 'bg-red-100/70 text-red-700'
                                : 'bg-amber-100/70 text-amber-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {item.detail && (
                          <p className="mt-0.5 text-[12px] font-medium text-gray-500">
                            {item.detail} {item.amount ? `: $${item.amount.toFixed(2)}` : ''}
                          </p>
                        )}

                        <p className="mt-1 text-[12px] text-gray-600">
                          <span className="font-semibold text-gray-800">{item.guestName}</span> · Room{' '}
                          {item.roomNumber}
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

        {/* Right Detail Panel */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm flex flex-col justify-center items-center text-center min-h-[400px]">
          {selectedEvent ? (
            <div className="w-full text-left space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    EVENT DETAILS
                  </p>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    selectedEvent.status === 'GRANTED'
                      ? 'bg-emerald-50 text-emerald-600'
                      : selectedEvent.status === 'DENIED'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {selectedEvent.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[13px] bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-gray-400 block text-xs">Guest</span>
                  <span className="font-bold text-gray-900">{selectedEvent.guestName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Room</span>
                  <span className="font-bold text-gray-900">{selectedEvent.roomNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Reader Device ID</span>
                  <span className="font-semibold text-gray-700">{selectedEvent.deviceUid}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs">Keycard UID</span>
                  <span className="font-semibold text-gray-700">{selectedEvent.keycardUid}</span>
                </div>
              </div>

              {/* Simulated Camera / Access Log Preview */}
              <div className="rounded-xl bg-[#0f172a] p-4 text-white space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400 border-b border-slate-700 pb-2">
                  <span>CAMERA FEED TRACE</span>
                  <span className="text-emerald-400 font-mono">LIVE FEED ON</span>
                </div>
                <div className="flex h-32 items-center justify-center rounded bg-slate-800 text-slate-400 text-xs font-mono">
                  [ SIMULATED DOOR ACCESS CAM ]
                </div>
                <p className="text-[11px] text-slate-300 font-mono">
                  LOG: {selectedEvent.timestamp} — Swipe registered at {selectedEvent.deviceUid} for {selectedEvent.guestName}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <MousePointerClickIcon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Select an event</h3>
              <p className="text-[13px] text-gray-500 max-w-[260px] mx-auto">
                Click on any activity in the timeline to view detailed logs and camera feeds.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
