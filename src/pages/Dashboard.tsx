import { useNavigate as useNav } from 'react-router-dom';
import {
  BedDoubleIcon,
  BellIcon,
  CalendarIcon,
  CreditCardIcon,
  FilterIcon,
  LineChartIcon,
  LogInIcon,
  MoreVerticalIcon,
  MoveRightIcon,
  RefreshCwIcon,
  TrendingUpIcon
} from 'lucide-react';

function RoomStatusDonutChart({
  available = 24,
  occupied = 8,
  reserved = 5,
  blocked = 3
}: {
  available?: number;
  occupied?: number;
  reserved?: number;
  blocked?: number;
}) {
  const total = available + occupied + reserved + blocked || 40;
  const radius = 64;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  // Segment ratios
  const availRatio = available / total;
  const occRatio = occupied / total;
  const resRatio = reserved / total;
  const blockRatio = blocked / total;

  // Dashoffset calculations
  const availLength = circumference * availRatio;
  const occLength = circumference * occRatio;
  const resLength = circumference * resRatio;
  const blockLength = circumference * blockRatio;

  // Offsets
  const offsetAvail = 0;
  const offsetOcc = -availLength;
  const offsetRes = -(availLength + occLength);
  const offsetBlock = -(availLength + occLength + resLength);

  return (
    <div className="relative mx-auto my-3 h-[180px] w-[180px]">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        {/* Available Segment (Green) */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeDasharray={`${availLength} ${circumference}`}
          strokeDashoffset={offsetAvail}
        />
        {/* Occupied Segment (Blue) */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={`${occLength} ${circumference}`}
          strokeDashoffset={offsetOcc}
        />
        {/* Reserved Segment (Orange) */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={strokeWidth}
          strokeDasharray={`${resLength} ${circumference}`}
          strokeDashoffset={offsetRes}
        />
        {/* Blocked Segment (Red) */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth}
          strokeDasharray={`${blockLength} ${circumference}`}
          strokeDashoffset={offsetBlock}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[34px] font-extrabold leading-none text-white tracking-tight tabular-nums">{total}</span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Total Rooms
        </span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNav();

  // Mock table movements matching screenshot exact display
  const movements = [
    {
      id: 'm1',
      resId: 'r1',
      guestInitials: 'AO',
      avatarBg: 'bg-[#dcfce7] text-[#15803d]',
      guestName: 'Amara Okafor',
      code: 'RSV-4200',
      source: 'Corporate',
      room: '203',
      movement: 'Arrival',
      housekeeping: 'Inspected',
      hkTone: 'green'
    },
    {
      id: 'm2',
      resId: 'r2',
      guestInitials: 'HS',
      avatarBg: 'bg-[#e0f2fe] text-[#0369a1]',
      guestName: 'Hana Sato',
      code: 'RSV-4207',
      source: 'Direct',
      room: '307',
      movement: 'Arrival',
      housekeeping: 'Cleaning',
      hkTone: 'amber'
    },
    {
      id: 'm3',
      resId: 'r3',
      guestInitials: 'NP',
      avatarBg: 'bg-slate-200 text-slate-700',
      guestName: 'Nina Petrova',
      code: 'RSV-4214',
      source: 'Website',
      room: '101',
      movement: 'Arrival',
      housekeeping: 'Dirty',
      hkTone: 'red'
    },
    {
      id: 'm4',
      resId: 'r4',
      guestInitials: 'LF',
      avatarBg: 'bg-[#fef3c7] text-[#b45309]',
      guestName: 'Liam Ferguson',
      code: 'RSV-4221',
      source: 'Booking.com',
      room: 'Unassigned',
      movement: 'Arrival',
      housekeeping: '—',
      hkTone: 'none'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
              Property Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#16a34a]">
              <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
              LIVE UPDATES ACTIVE
            </span>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 font-normal">
            Live metrics calculated from rooms, reservations, folios and work orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
          >
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            <span>Today, Sep 11</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-[#176938] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#11502b] transition-all"
          >
            <RefreshCwIcon className="h-3.5 w-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid (Left Column 3/4, Right Column 1/4) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Section */}
        <div className="space-y-5 min-w-0">
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Card 1: Occupancy */}
            <div className="glass-card-premium rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  OCCUPANCY
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] text-[#176938] shadow-xs">
                  <BedDoubleIcon className="h-5 w-5 stroke-[2]" />
                </div>
              </div>
              <div className="mt-3.5 flex items-baseline gap-2.5">
                <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 font-sans tabular-nums">
                  20%
                </span>
                <span className="rounded-md bg-[#dcfce7]/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-[#176938] border border-[#bbf7d0]">
                  8/40
                </span>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/60">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#176938] to-[#2daf57] transition-all duration-500 shadow-xs" style={{ width: '20%' }} />
                </div>
              </div>
              <p className="mt-3.5 text-[12px] font-medium text-slate-500">
                32 rooms remaining to sell
              </p>
            </div>

            {/* Card 2: ADR */}
            <div className="glass-card-premium rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  ADR
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] text-[#176938] shadow-xs">
                  <CreditCardIcon className="h-5 w-5 stroke-[2]" />
                </div>
              </div>
              <div className="mt-3.5">
                <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 font-sans tabular-nums">
                  $310
                </span>
              </div>
              <p className="mt-7 text-[12px] font-medium text-slate-600 flex items-center gap-1.5">
                <TrendingUpIcon className="h-4 w-4 text-[#2daf57] stroke-[2.2]" />
                <span>Across 8 in-house reservations</span>
              </p>
            </div>

            {/* Card 3: RevPAR */}
            <div className="glass-card-premium rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  REVPAR
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#dcfce7] to-[#bbf7d0] text-[#176938] shadow-xs">
                  <LineChartIcon className="h-5 w-5 stroke-[2]" />
                </div>
              </div>
              <div className="mt-3.5">
                <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 font-sans tabular-nums">
                  $62
                </span>
              </div>
              <div className="mt-7 flex items-center justify-between text-[12px] font-medium">
                <span className="text-slate-500">Room revenue today</span>
                <span className="text-slate-900 font-bold tabular-nums">$2,482</span>
              </div>
            </div>
          </div>

          {/* Row of 5 Metric Cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {/* Item 1 */}
            <div className="glass-card-premium rounded-xl p-3.5">
              <p className="text-[11px] font-bold text-slate-500">Arrivals today</p>
              <p className="mt-1 text-[24px] font-extrabold text-slate-900 leading-tight tabular-nums">6</p>
              <span className="mt-1.5 inline-block rounded-md bg-[#fef3c7] px-2 py-0.5 text-[10px] font-bold text-[#b45309] border border-amber-200/60">
                3 unassigned
              </span>
            </div>

            {/* Item 2 */}
            <div className="glass-card-premium rounded-xl p-3.5">
              <p className="text-[11px] font-bold text-slate-500">Departures to...</p>
              <p className="mt-1 text-[24px] font-extrabold text-slate-900 leading-tight tabular-nums">3</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">Checkout 11:00</p>
            </div>

            {/* Item 3 */}
            <div className="glass-card-premium rounded-xl p-3.5">
              <p className="text-[11px] font-bold text-slate-500">In house</p>
              <p className="mt-1 text-[24px] font-extrabold text-slate-900 leading-tight tabular-nums">8</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">5 stayovers</p>
            </div>

            {/* Item 4 */}
            <div className="glass-card-premium rounded-xl p-3.5">
              <p className="text-[11px] font-bold text-slate-500">Vacant & ready</p>
              <p className="mt-1 text-[24px] font-extrabold text-[#176938] leading-tight tabular-nums">18</p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">6 dirty · 6 clean</p>
            </div>

            {/* Item 5 */}
            <div className="glass-card-premium rounded-xl p-3.5">
              <p className="text-[11px] font-bold text-slate-500">Outstanding</p>
              <p className="mt-1 text-[24px] font-extrabold text-slate-900 leading-tight tabular-nums">$6,783</p>
              <span className="mt-1.5 inline-block rounded-md bg-[#fee2e2] px-2 py-0.5 text-[10px] font-bold text-[#ef4444] border border-rose-200/60">
                9 open folios
              </span>
            </div>
          </div>

          {/* Today's Movements Section */}
          <div className="glass-card-premium overflow-hidden rounded-2xl">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 gap-3 border-b border-slate-200/60 bg-white/40 backdrop-blur-xs">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
                    Today&apos;s Movements
                  </h2>
                  <span className="rounded-full bg-slate-100/90 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200/50">
                    9 Total
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  6 arrivals • 3 departures scheduled
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-xs px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-white"
                >
                  <FilterIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/front-desk')}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#176938] to-[#2daf57] px-3.5 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
                >
                  <span>Open Front Desk</span>
                  <MoveRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/60 bg-slate-50/50 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-[#176938]">
                    <th scope="col" className="py-3 pl-5 pr-3">
                      Guest
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Room
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Movement
                    </th>
                    <th scope="col" className="px-3 py-3">
                      Housekeeping
                    </th>
                    <th scope="col" className="px-3 py-3 pr-5 text-right">
                      Open
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {movements.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-[#176938]/[0.04]">
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-xs ${row.avatarBg}`}
                          >
                            {row.guestInitials}
                          </span>
                          <div>
                            <span className="block text-[13px] font-bold text-slate-900 leading-tight">
                              {row.guestName}
                            </span>
                            <span className="block text-[11px] font-medium text-slate-400 mt-0.5">
                              {row.code} • {row.source}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3.5">
                        {row.room === 'Unassigned' ? (
                          <span className="rounded-md bg-[#fef3c7] px-2.5 py-1 text-xs font-bold text-[#b45309]">
                            Unassigned
                          </span>
                        ) : (
                          <span className="rounded-md bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-800 font-mono border border-slate-200/60">
                            {row.room}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-bold text-[#176938] border border-[#bbf7d0]">
                          <LogInIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>{row.movement}</span>
                        </span>
                      </td>

                      <td className="px-3 py-3.5">
                        {row.hkTone === 'green' ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[#176938]">
                            <span className="h-2 w-2 rounded-full bg-[#176938]" />
                            Inspected
                          </span>
                        ) : row.hkTone === 'amber' ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[#d97706]">
                            <span className="h-2 w-2 rounded-full bg-[#d97706]" />
                            Cleaning
                          </span>
                        ) : row.hkTone === 'red' ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-[#ef4444]">
                            <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                            Dirty
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5 pr-5 text-right">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between border-t border-slate-200/60 bg-[#dcfce7]/40 backdrop-blur-xs px-5 py-3 text-xs font-semibold">
              <span className="text-slate-600">Showing 4 of 9 pending roster items</span>
              <button
                type="button"
                onClick={() => navigate('/front-desk')}
                className="flex items-center gap-1 font-bold text-[#176938] hover:underline"
              >
                <span>View All Movements</span>
                <MoveRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Navy Room Status Card + Alerts */}
        <div className="space-y-5">
          {/* Navy Room Status Card */}
          <div className="glass-navy rounded-2xl p-5 text-white">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                </span>
                <h2 className="text-[17px] font-bold tracking-tight text-white">Room Status</h2>
              </div>
              <span className="rounded-full bg-white/10 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-slate-300 border border-white/10">
                40 Total
              </span>
            </div>

            {/* Donut Chart */}
            <RoomStatusDonutChart available={24} occupied={8} reserved={5} blocked={3} />

            {/* 2x2 Grid of Status Tiles */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {/* Box 1: Available */}
              <div className="glass-navy-tile rounded-xl p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                  Available
                </p>
                <p className="mt-1 text-[22px] font-extrabold text-white leading-none tabular-nums">24</p>
                <p className="mt-1 text-[11px] font-bold text-[#22c55e]">60% of inventory</p>
              </div>

              {/* Box 2: Occupied */}
              <div className="glass-navy-tile rounded-xl p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                  Occupied
                </p>
                <p className="mt-1 text-[22px] font-extrabold text-white leading-none tabular-nums">8</p>
                <p className="mt-1 text-[11px] font-bold text-[#3b82f6]">20% of inventory</p>
              </div>

              {/* Box 3: Reserved */}
              <div className="glass-navy-tile rounded-xl p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  Reserved
                </p>
                <p className="mt-1 text-[22px] font-extrabold text-white leading-none tabular-nums">5</p>
                <p className="mt-1 text-[11px] font-bold text-[#f59e0b]">Pending check-in</p>
              </div>

              {/* Box 4: Blocked */}
              <div className="glass-navy-tile rounded-xl p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                  Blocked
                </p>
                <p className="mt-1 text-[22px] font-extrabold text-white leading-none tabular-nums">3</p>
                <p className="mt-1 text-[11px] font-bold text-[#ef4444]">Maint. / Out of order</p>
              </div>
            </div>

            {/* Bottom Footer inside Navy Card */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[12px] font-medium">
              <span className="text-slate-400">Cleanliness ratio</span>
              <span className="font-bold text-[#22c55e]">75% Inspected</span>
            </div>
          </div>

          {/* Alerts White Glass Card */}
          <div className="glass-card-premium rounded-2xl p-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-[#ef4444]" />
                <h2 className="text-[16px] font-bold text-slate-900">Alerts</h2>
              </div>
              <span className="rounded-full bg-[#fee2e2] px-2.5 py-0.5 text-[11px] font-bold text-[#ef4444] border border-rose-200/60">
                3 Actions Needed
              </span>
            </div>

            {/* Critical Alert Item 1 */}
            <div className="mt-3.5 rounded-xl border border-rose-200/80 bg-rose-500/10 backdrop-blur-md p-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#fee2e2] px-2 py-0.5 text-[10px] font-extrabold text-[#ef4444]">
                  CRITICAL
                </span>
                <span className="text-[11px] font-medium text-slate-400">10m ago</span>
              </div>
              <p className="mt-2 text-[13px] font-bold text-slate-900">
                Urgent maintenance • Room 304
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-500 leading-snug">
                Air conditioning not cooling. Guest requested immediate repair.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/maintenance')}
                  className="rounded-lg border border-slate-200 bg-white/90 backdrop-blur-xs px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs hover:bg-white transition-all"
                >
                  Assign Technician
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/maintenance')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  View Ticket
                </button>
              </div>
            </div>

            {/* Critical Alert Item 2 */}
            <div className="mt-2.5 rounded-xl border border-slate-200/60 bg-slate-50/70 backdrop-blur-xs p-3.5">
              <div className="flex items-center justify-between">
                <span className="rounded bg-[#fee2e2] px-2 py-0.5 text-[10px] font-extrabold text-[#ef4444]">
                  CRITICAL
                </span>
                <span className="text-[11px] font-medium text-slate-400">42m ago</span>
              </div>
              <p className="mt-2 text-[13px] font-bold text-slate-900">
                Late checkout pending • Room 108
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-500 leading-snug">
                Guest past 11:00 AM checkout without prior approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}