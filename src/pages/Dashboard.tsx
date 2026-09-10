import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BrushIcon,
  CheckCircle2Icon,
  LogInIcon,
  LogOutIcon,
  TriangleAlertIcon } from
'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Badge, PaymentBadge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { longDate, money, shortDate } from '../utils/format';
import { property } from '../data/property';

export function Dashboard() {
  const { ops, today, guestById, roomById, rooms } = useHotel();

  const hkLoad = [
  { label: 'Dirty', value: ops.counts.dirty, tone: 'bg-red-500' },
  { label: 'Cleaning', value: ops.counts.cleaning, tone: 'bg-amber-500' },
  { label: 'Clean', value: ops.counts.clean, tone: 'bg-brand-500' },
  { label: 'Inspected', value: ops.counts.inspected, tone: 'bg-emerald-500' }];


  return (
    <Page>
      <PageHeader
        eyebrow="Operations"
        title="Property Position"
        subtitle={`${property.name} · ${longDate(today)}`}
        actions={
        <>
            <Link to="/front-desk">
              <Button>Front desk</Button>
            </Link>
            <Link to="/bookings">
              <Button variant="primary">All bookings</Button>
            </Link>
          </>
        } />
      

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Primary panel — the number the duty manager came for. */}
        <section className="rounded-xl border border-line bg-white p-5 shadow-card lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                Occupancy today
              </p>
              <p className="tabular mt-1 text-[56px] font-semibold leading-none tracking-tight text-ink">
                {ops.occupancy}
                <span className="text-[28px] text-ink-faint">%</span>
              </p>
              <p className="mt-2 text-[13px] text-ink-muted">
                {ops.counts.occupied} of {rooms.length} rooms occupied ·{' '}
                {ops.counts.reserved} reserved · {ops.counts.available} available
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-6">
              {[
              { label: 'ADR', value: money(ops.adr) },
              { label: 'RevPAR', value: money(ops.revpar) },
              { label: 'Payments today', value: money(ops.revenueToday) }].
              map((item) =>
              <div key={item.label}>
                  <dt className="text-[11px] font-medium text-ink-faint">
                    {item.label}
                  </dt>
                  <dd className="tabular mt-0.5 text-[20px] font-semibold text-ink">
                    {item.value}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 sm:grid-cols-4">
            {[
            { label: 'Arrivals', value: ops.arrivals.length, to: '/front-desk' },
            { label: 'Departures', value: ops.departures.length, to: '/front-desk' },
            { label: 'In-house', value: ops.inHouse.length, to: '/bookings' },
            { label: 'Stayovers', value: ops.stayovers.length, to: '/bookings' }].
            map((tile) =>
            <Link
              key={tile.label}
              to={tile.to}
              className="rounded-lg border border-line px-3 py-2.5 transition-colors duration-150 ease-out hover:bg-slate-50">
              
                <p className="text-[11px] font-medium text-ink-faint">{tile.label}</p>
                <p className="tabular mt-0.5 text-[22px] font-semibold text-ink">
                  {tile.value}
                </p>
              </Link>
            )}
          </div>
        </section>

        <Card title="Alerts" padded={false}>
          {ops.alerts.length === 0 ?
          <EmptyState
            icon={CheckCircle2Icon}
            title="All clear"
            detail="No operational exceptions on the floor right now." /> :


          <ul className="divide-y divide-line">
              {ops.alerts.map((alert) =>
            <li key={alert.id}>
                  <Link
                to={alert.to}
                className="flex items-start gap-2.5 px-4 py-3 transition-colors duration-150 ease-out hover:bg-slate-50">
                
                    <TriangleAlertIcon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                  alert.level === 'critical' ?
                  'text-red-500' :
                  alert.level === 'warning' ?
                  'text-amber-500' :
                  'text-brand-500'}`
                  } />
                
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-ink">
                        {alert.title}
                      </span>
                      <span className="block text-[12px] text-ink-muted">
                        {alert.detail}
                      </span>
                    </span>
                    <ArrowRightIcon className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  </Link>
                </li>
            )}
            </ul>
          }
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card
          title={`Today's arrivals (${ops.arrivals.length})`}
          padded={false}
          action={
          <Link to="/front-desk" className="text-[12px] font-medium text-brand-600">
              Front desk
            </Link>
          }>
          
          {ops.arrivals.length === 0 ?
          <EmptyState icon={LogInIcon} title="No arrivals expected" /> :

          <ul className="divide-y divide-line">
              {ops.arrivals.map((res) => {
              const guest = guestById(res.guestId);
              const room = roomById(res.roomId);
              return (
                <li key={res.id} className="flex items-center gap-3 px-4 py-3">
                    {guest &&
                  <Avatar firstName={guest.firstName} lastName={guest.lastName} />
                  }
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {guest ? `${guest.firstName} ${guest.lastName}` : '—'}
                      </p>
                      <p className="text-[11px] text-ink-faint">
                        #{res.confirmation} ·{' '}
                        {room ? `Room ${room.number}` : 'No room assigned'}
                      </p>
                    </div>
                    <Link to={`/check-in/${res.id}`}>
                      <Button size="sm">Check in</Button>
                    </Link>
                  </li>);

            })}
            </ul>
          }
        </Card>

        <Card
          title={`Today's departures (${ops.departures.length})`}
          padded={false}>
          
          {ops.departures.length === 0 ?
          <EmptyState icon={LogOutIcon} title="No departures due" /> :

          <ul className="divide-y divide-line">
              {ops.departures.map((res) => {
              const guest = guestById(res.guestId);
              const room = roomById(res.roomId);
              return (
                <li key={res.id} className="flex items-center gap-3 px-4 py-3">
                    {guest &&
                  <Avatar firstName={guest.firstName} lastName={guest.lastName} />
                  }
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {guest ? `${guest.firstName} ${guest.lastName}` : '—'}
                      </p>
                      <p className="text-[11px] text-ink-faint">
                        Room {room?.number ?? '—'} · due {shortDate(res.departure)}
                      </p>
                    </div>
                    <Link to={`/check-out/${res.id}`}>
                      <Button size="sm">Check out</Button>
                    </Link>
                  </li>);

            })}
            </ul>
          }
        </Card>

        <Card title="Housekeeping load">
          <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
            {hkLoad.map((seg) =>
            <div
              key={seg.label}
              className={seg.tone}
              style={{ width: `${seg.value / rooms.length * 100}%` }} />

            )}
          </div>
          <ul className="mt-4 space-y-2.5">
            {hkLoad.map((seg) =>
            <li key={seg.label} className="flex items-center gap-2.5">
                <span className={`h-2 w-2 rounded-full ${seg.tone}`} />
                <span className="flex-1 text-[13px] text-ink-muted">{seg.label}</span>
                <span className="tabular text-[13px] font-semibold text-ink">
                  {seg.value}
                </span>
              </li>
            )}
          </ul>
          <Link to="/housekeeping" className="mt-4 block">
            <Button size="sm" className="w-full">
              <BrushIcon className="h-3.5 w-3.5" /> Open housekeeping board
            </Button>
          </Link>
        </Card>
      </div>

      <div className="mt-4">
        <Card
          title={`Outstanding balances — ${money(ops.totalOutstanding)}`}
          padded={false}
          action={
          <Link to="/billing" className="text-[12px] font-medium text-brand-600">
              Open ledger
            </Link>
          }>
          
          {ops.outstanding.length === 0 ?
          <EmptyState icon={CheckCircle2Icon} title="Every folio is settled" /> :

          <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  <th className="px-4 py-2">Guest</th>
                  <th className="px-4 py-2">Confirmation</th>
                  <th className="px-4 py-2">Stay</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ops.outstanding.map((row) =>
              <tr key={row.reservation.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-[13px] font-medium text-ink">
                      {row.guest ?
                  `${row.guest.firstName} ${row.guest.lastName}` :
                  '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                    to={`/bookings/${row.reservation.id}`}
                    className="text-[13px] font-medium text-brand-600">
                    
                        #{row.reservation.confirmation}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-ink-muted">
                      {shortDate(row.reservation.arrival)} –{' '}
                      {shortDate(row.reservation.departure)}
                    </td>
                    <td className="px-4 py-2.5">
                      {row.reservation.status === 'checked_out' ?
                  <Badge tone="red">Overdue</Badge> :

                  <PaymentBadge status={row.reservation.paymentStatus} />
                  }
                    </td>
                    <td className="tabular px-4 py-2.5 text-right text-[13px] font-semibold text-ink">
                      {money(row.balance)}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          }
        </Card>
      </div>
    </Page>);

}