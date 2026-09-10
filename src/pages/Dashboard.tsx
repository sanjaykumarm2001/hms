import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BedDoubleIcon,
  CreditCardIcon,
  LineChartIcon,
  LogInIcon,
  LogOutIcon,
  MoreVerticalIcon } from
'lucide-react';
import { Card, LinkButton, ProgressBar, StatusPill } from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { money, money0, percent } from '../utils/format';
import { housekeepingLabel, housekeepingTone } from '../utils/tone';

function OccupancyDonut({ occupied, total }: {occupied: number;total: number;}) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const ratio = total ? occupied / total : 0;

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
          strokeDasharray={`${circumference * ratio} ${circumference}`} />
        
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-[30px] font-bold leading-none text-white">{total}</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white/60">
          Total Rooms
        </span>
      </div>
    </div>);

}

export function Dashboard() {
  const navigate = useNavigate();
  const { ops, guestName, getRoom, rooms, settings } = useHotel();
  const { counts } = ops;

  const movements = [
  ...ops.arrivals.map((r) => ({ reservation: r, direction: 'Arrival' as const })),
  ...ops.departures.map((r) => ({ reservation: r, direction: 'Departure' as const }))].
  slice(0, 8);

  const position = [
  { label: 'Arrivals today', value: ops.arrivals.length, caption: `${ops.unassignedArrivals.length} unassigned`, to: '/front-desk' },
  { label: 'Departures today', value: ops.departures.length, caption: `Checkout ${settings.checkOutTime}`, to: '/front-desk' },
  { label: 'In house', value: ops.inHouse.length, caption: `${ops.stayovers.length} stayovers`, to: '/front-desk' },
  { label: 'Vacant & ready', value: counts.ready, caption: `${counts.dirty} dirty · ${counts.cleaning} cleaning`, to: '/housekeeping' },
  { label: 'Outstanding', value: money0(ops.outstandingTotal), caption: `${ops.outstanding.length} open folios`, to: '/billing' }];


  const hkTotal = counts.dirty + counts.cleaning + counts.clean + counts.inspected;
  const hkDone = counts.inspected;
  const attendantLoad = rooms.
  filter((room) => room.housekeeping === 'cleaning' || room.housekeeping === 'dirty').
  reduce<Record<string, number>>((acc, room) => {
    const key = room.housekeeper ?? 'Unassigned';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-ink">
              Property Overview
            </h1>
            <p className="mt-2 text-[13px] text-ink-soft">
              Live metrics calculated from rooms, reservations, folios and work orders.
            </p>
          </div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
            <span className="h-2 w-2 rounded-full bg-brand-600" />
            Live updates active
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="relative overflow-hidden bg-brand-wash p-4 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand-gradient-v">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-semibold text-ink-soft">Occupancy</p>
              <BedDoubleIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="tabular text-[30px] font-bold leading-none tracking-tight text-ink">
                {percent(ops.occupancy)}
              </span>
              <span className="tabular pb-0.5 text-[12px] font-semibold text-brand-700">
                {counts.occupied}/{counts.total}
              </span>
            </div>
            <ProgressBar className="mt-4" value={ops.occupancy} label="Occupancy" />
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-semibold text-ink-soft">ADR</p>
              <CreditCardIcon aria-hidden="true" className="h-4 w-4 text-ink-muted" />
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="tabular text-[30px] font-bold leading-none tracking-tight text-ink">
                {money0(ops.adr)}
              </span>
            </div>
            <p className="mt-4 text-[11px] text-ink-muted">
              Average rate across {ops.inHouse.length} in-house reservations
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-semibold text-ink-soft">RevPAR</p>
              <LineChartIcon aria-hidden="true" className="h-4 w-4 text-ink-muted" />
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="tabular text-[30px] font-bold leading-none tracking-tight text-ink">
                {money0(ops.revpar)}
              </span>
            </div>
            <p className="mt-4 text-[11px] text-ink-muted">
              Room revenue today {money0(ops.roomRevenue)}
            </p>
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {position.map((item) =>
          <Link
            key={item.label}
            to={item.to}
            className="rounded-card border border-line bg-white px-4 py-3 shadow-card transition-colors duration-150 hover:bg-[#fafbf8]">
            
              <p className="text-[11px] font-semibold text-ink-soft">{item.label}</p>
              <p className="tabular mt-1.5 text-[22px] font-bold leading-none text-ink">{item.value}</p>
              <p className="mt-1.5 text-[11px] text-ink-muted">{item.caption}</p>
            </Link>
          )}
        </div>

        <Card className="mt-5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Today&apos;s Movements</h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {ops.arrivals.length} arrivals · {ops.departures.length} departures
              </p>
            </div>
            <LinkButton onClick={() => navigate('/front-desk')}>Open front desk</LinkButton>
          </div>
          {movements.length === 0 ?
          <p className="border-t border-line px-5 py-10 text-center text-[12px] text-ink-muted">
              No arrivals or departures scheduled for today.
            </p> :

          <table className="w-full border-t border-line text-left">
              <thead>
                <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Guest</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Room</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Movement</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Housekeeping</th>
                  <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {movements.map(({ reservation, direction }) => {
                const room = getRoom(reservation.roomId);
                const name = guestName(reservation.guestId);
                return (
                  <tr
                    key={`${direction}-${reservation.id}`}
                    className="transition-colors duration-150 hover:bg-[#fafbf8]">
                    
                      <td className="py-3 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800">
                            {name.
                          split(' ').
                          map((part) => part.charAt(0)).
                          join('')}
                          </span>
                          <span>
                            <span className="block text-[13px] font-semibold text-ink">{name}</span>
                            <span className="block text-[11px] text-ink-muted">
                              {reservation.code} · {reservation.source}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="tabular px-3 py-3 text-[13px] font-semibold text-ink">
                        {room?.number ?? 'Unassigned'}
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill tone={direction === 'Arrival' ? 'green' : 'red'} dot={false}>
                          <span className="inline-flex items-center gap-1">
                            {direction === 'Arrival' ?
                          <LogInIcon aria-hidden="true" className="h-3 w-3" /> :

                          <LogOutIcon aria-hidden="true" className="h-3 w-3" />
                          }
                            {direction}
                          </span>
                        </StatusPill>
                      </td>
                      <td className="px-3 py-3">
                        {room ?
                      <StatusPill tone={housekeepingTone[room.housekeeping]}>
                            {housekeepingLabel[room.housekeeping]}
                          </StatusPill> :

                      <span className="text-[12px] text-ink-muted">—</span>
                      }
                      </td>
                      <td className="px-3 py-3 pr-5 text-right">
                        <button
                        type="button"
                        aria-label={`Open reservation for ${name}`}
                        onClick={() => navigate(`/reservations/${reservation.id}`)}
                        className="rounded-md p-1.5 text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
                        
                          <MoreVerticalIcon aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          }
        </Card>

        <Card className="mt-5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Outstanding balances</h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {money(ops.outstandingTotal)} across {ops.outstanding.length} folios
              </p>
            </div>
            <LinkButton onClick={() => navigate('/billing')}>Open billing</LinkButton>
          </div>
          {ops.outstanding.length === 0 ?
          <p className="border-t border-line px-5 py-8 text-center text-[12px] text-ink-muted">
              Every folio is settled.
            </p> :

          <ul className="divide-y divide-line border-t border-line">
              {ops.outstanding.slice(0, 5).map(({ reservation, balance }) =>
            <li key={reservation.id}>
                  <Link
                to={`/billing/${reservation.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors duration-150 hover:bg-[#fafbf8]">
                
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-ink">
                        {guestName(reservation.guestId)}
                      </span>
                      <span className="block text-[11px] text-ink-muted">
                        {reservation.code} · {reservation.status === 'checked-out' ? 'Departed' : 'In house'}
                      </span>
                    </span>
                    <span className="tabular text-[13px] font-bold text-ink">{money(balance)}</span>
                  </Link>
                </li>
            )}
            </ul>
          }
        </Card>
      </div>

      <div className="flex flex-col gap-5">
        <section className="rounded-card bg-panel p-5 shadow-panel">
          <h2 className="text-[15px] font-semibold tracking-tight text-white">Room Status</h2>
          <OccupancyDonut occupied={counts.occupied} total={counts.total} />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
            { label: 'Available', value: counts.available, color: '#25b84f' },
            { label: 'Occupied', value: counts.occupied, color: '#2f74e0' },
            { label: 'Reserved', value: counts.reserved, color: '#d9dd3a' },
            { label: 'Blocked', value: counts.maintenance + counts.outOfService, color: '#e0453c' }].
            map((item) =>
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
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Alerts</h2>
          {ops.alerts.length === 0 ?
          <p className="mt-3 text-[12px] text-ink-muted">No operational alerts right now.</p> :

          <ul className="mt-3 space-y-2">
              {ops.alerts.map((alert) =>
            <li key={alert.id}>
                  <Link
                to={alert.to}
                className="block rounded-lg border border-line px-3 py-2.5 transition-colors duration-150 hover:bg-canvas">
                
                    <span className="flex items-center gap-2">
                      <StatusPill
                    tone={
                    alert.level === 'critical' ? 'red' : alert.level === 'warning' ? 'amber' : 'blue'
                    }
                    dot={false}>
                    
                        {alert.level}
                      </StatusPill>
                      <span className="text-[12px] font-semibold text-ink">{alert.title}</span>
                    </span>
                    <span className="mt-1.5 block text-[11px] text-ink-muted">{alert.detail}</span>
                  </Link>
                </li>
            )}
            </ul>
          }
        </Card>

        <Card className="p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Housekeeping Load</h2>
          <div className="mt-4 flex items-center justify-between text-[12px]">
            <span className="text-ink-soft">Rooms inspected</span>
            <span className="tabular font-semibold text-ink">
              {hkDone} / {hkTotal}
            </span>
          </div>
          <ProgressBar className="mt-2" value={hkTotal ? hkDone / hkTotal * 100 : 0} label="Rooms inspected" />
          <ul className="mt-5 space-y-3">
            {Object.entries(attendantLoad).map(([name, load]) =>
            <li key={name} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-[10px] font-bold text-ink-soft">
                    {name.slice(0, 1)}
                  </span>
                  <span className="text-[12px] font-semibold text-ink">{name}</span>
                </div>
                <span className="tabular text-[12px] font-semibold text-ink-soft">{load} rooms</span>
              </li>
            )}
            {Object.keys(attendantLoad).length === 0 ?
            <li className="text-[12px] text-ink-muted">No rooms waiting for housekeeping.</li> :
            null}
          </ul>
        </Card>
      </div>
    </div>);

}