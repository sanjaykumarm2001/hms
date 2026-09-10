import React from 'react';
import { BedDoubleIcon, CreditCardIcon, LineChartIcon, MoreVerticalIcon } from 'lucide-react';
import { Card, ProgressBar, StatusPill } from '../components/ui';
import { kpis, movements, roomStatusSummary } from '../data/dashboard';
import { attendants } from '../data/housekeeping';

function OccupancyDonut() {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const occupied = roomStatusSummary.breakdown[1].value / roomStatusSummary.totalRooms;

  return (
    <div className="relative mx-auto h-[168px] w-[168px]">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="donut" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d9dd3a" />
            <stop offset="45%" stopColor="#a4d13f" />
            <stop offset="100%" stopColor="#25b84f" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="14" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#donut)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${circumference * occupied} ${circumference}`} />
        
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-[30px] font-bold leading-none text-white">{roomStatusSummary.totalRooms}</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white/60">Total Rooms</span>
      </div>
    </div>);

}

export function Dashboard() {
  const cleaned = attendants.reduce((sum, a) => sum + a.done, 0);
  const totalToClean = 42;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_296px]">
      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-ink">Property Overview</h1>
            <p className="mt-2 text-[13px] text-ink-soft">Live metrics for today&apos;s operations.</p>
          </div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
            <span className="h-2 w-2 rounded-full bg-brand-600" />
            Live updates active
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {kpis.map((kpi) =>
          <Card
            key={kpi.id}
            className={
            kpi.featured ?
            'relative overflow-hidden bg-brand-wash p-4 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand-gradient-v' :
            'p-4'
            }>
            
              <div className="flex items-start justify-between">
                <p className="text-[12px] font-semibold text-ink-soft">{kpi.label}</p>
                {kpi.id === 'occupancy' ? <BedDoubleIcon aria-hidden="true" className="h-4 w-4 text-brand-700" /> : null}
                {kpi.id === 'adr' ? <CreditCardIcon aria-hidden="true" className="h-4 w-4 text-ink-muted" /> : null}
                {kpi.id === 'revpar' ? <LineChartIcon aria-hidden="true" className="h-4 w-4 text-ink-muted" /> : null}
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="tabular text-[30px] font-bold leading-none tracking-tight text-ink">{kpi.value}</span>
                <span className="tabular pb-0.5 text-[12px] font-semibold text-brand-700">{kpi.delta}</span>
              </div>
              {typeof kpi.progress === 'number' ?
            <ProgressBar className="mt-4" value={kpi.progress} label="Occupancy" /> :

            <p className="mt-4 text-[11px] text-ink-muted">{kpi.caption}</p>
            }
            </Card>
          )}
        </div>

        <Card className="mt-5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Today&apos;s Movements</h2>
            <button type="button" className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700 hover:text-brand-800">
              View all
            </button>
          </div>
          <table className="w-full border-t border-line text-left">
            <thead>
              <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Guest</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Room</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">ETA / ETD</th>
                <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {movements.map((m) =>
              <tr key={m.id} className="transition-colors duration-150 hover:bg-[#fafbf8]">
                  <td className="py-3 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800">
                        {m.initials}
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold text-ink">{m.guest}</span>
                        <span className="block text-[11px] text-ink-muted">{m.segment}</span>
                      </span>
                    </div>
                  </td>
                  <td className="tabular px-3 py-3 text-[13px] font-semibold text-ink">{m.room}</td>
                  <td className="px-3 py-3">
                    <StatusPill tone={m.direction === 'Arrival' ? 'green' : 'red'} dot={false}>
                      {m.direction}
                    </StatusPill>
                  </td>
                  <td className="tabular px-3 py-3 text-[13px] text-ink-soft">{m.time}</td>
                  <td className="px-3 py-3 pr-5 text-right">
                    <button
                    type="button"
                    aria-label={`Actions for ${m.guest}`}
                    className="rounded-md p-1.5 text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
                    
                      <MoreVerticalIcon aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <section className="rounded-card bg-panel p-5 shadow-panel">
          <h2 className="text-[15px] font-semibold tracking-tight text-white">Room Status</h2>
          <OccupancyDonut />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {roomStatusSummary.breakdown.map((item) =>
            <div key={item.label} className="rounded-lg bg-white/[0.06] px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </p>
                <p className="tabular mt-1 text-[18px] font-bold leading-none text-white">{item.value}</p>
              </div>
            )}
          </div>
        </section>

        <Card className="p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Housekeeping Progress</h2>
          <div className="mt-4 flex items-center justify-between text-[12px]">
            <span className="text-ink-soft">Rooms Cleaned</span>
            <span className="tabular font-semibold text-ink">
              {cleaned} / {totalToClean}
            </span>
          </div>
          <ProgressBar className="mt-2" value={cleaned / totalToClean * 100} label="Rooms cleaned" />

          <ul className="mt-5 space-y-3">
            {attendants.map((a) =>
            <li key={a.name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-[10px] font-bold text-ink-soft">
                    {a.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-[12px] font-semibold text-ink">{a.name}</span>
                    <span className="block text-[11px] text-ink-muted">{a.zone}</span>
                  </span>
                </div>
                <span className="tabular text-[12px] font-semibold text-ink-soft">
                  {a.done}/{a.total}
                </span>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>);

}