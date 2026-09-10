import React, { useMemo, useState } from 'react';
import {
  BuildingIcon,
  CreditCardIcon,
  DownloadIcon,
  PlaneLandingIcon,
  PlaneTakeoffIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TrendingUpIcon } from
'lucide-react';
import { Card, PageHeader, PrimaryButton, ProgressBar, SecondaryButton, StatusPill } from '../components/ui';
import { bookingMetrics, bookingTabs, bookings } from '../data/bookings';
import { Booking } from '../types';

const metricIcons = {
  'plane-landing': PlaneLandingIcon,
  'plane-takeoff': PlaneTakeoffIcon,
  building: BuildingIcon
};

const accentBar: Record<string, string> = {
  brand: 'bg-brand-400',
  'brand-strong': 'bg-brand-600',
  citrus: 'bg-citrus'
};

const sourceTone: Record<string, string> = {
  DIRECT: 'bg-[#f1f2ef] text-ink-soft',
  'BOOKING.COM': 'bg-[#eaf1fd] text-[#1e57ad]',
  AGODA: 'bg-[#eef3fb] text-[#3c6bab]'
};

function statusTone(status: Booking['status']) {
  if (status === 'expected') return 'blue' as const;
  if (status === 'in-house') return 'green' as const;
  if (status === 'departing') return 'amber' as const;
  return 'gray' as const;
}

function statusLabel(status: Booking['status']) {
  if (status === 'expected') return 'Expected';
  if (status === 'in-house') return 'In-House';
  if (status === 'departing') return 'Departing';
  return 'Checked out';
}

export function Bookings() {
  const [tab, setTab] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const rows = useMemo(() => {
    return bookings.filter((b) => {
      const matchesTab =
      tab === 'all' ||
      tab === 'arrivals' && b.status === 'expected' ||
      tab === 'in-house' && b.status === 'in-house' ||
      tab === 'departures' && b.status === 'departing';
      const q = query.trim().toLowerCase();
      const matchesQuery =
      !q ||
      b.guestName.toLowerCase().includes(q) ||
      b.confirmation.toLowerCase().includes(q) ||
      b.roomNumber.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [tab, query]);

  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  return (
    <div>
      <PageHeader
        title="Bookings"
        badge={
        <span className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-semibold text-white">42 Active Today</span>
        }
        subtitle="Manage reservations, track incoming arrivals, and review departure statuses."
        actions={
        <>
            <SecondaryButton>
              <DownloadIcon aria-hidden="true" className="h-4 w-4" />
              Export CSV
            </SecondaryButton>
            <PrimaryButton gradient>
              <PlusIcon aria-hidden="true" className="h-4 w-4" />
              New Booking
            </PrimaryButton>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))_260px]">
        {bookingMetrics.map((metric) => {
          const Icon = metricIcons[metric.icon];
          return (
            <Card key={metric.id} className="relative overflow-hidden p-4">
              <span className={`absolute inset-y-0 left-0 w-1 ${accentBar[metric.accent]}`} aria-hidden="true" />
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-soft">{metric.label}</p>
                <Icon aria-hidden="true" className="h-4 w-4 text-ink-muted" strokeWidth={1.8} />
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="tabular text-[30px] font-bold leading-none tracking-tight text-ink">{metric.value}</span>
                <span className="pb-0.5 text-[11px] font-medium text-ink-muted">{metric.unit}</span>
              </div>
              {typeof metric.progress === 'number' ?
              <ProgressBar className="mt-3.5" value={metric.progress} label={metric.label} /> :
              null}
              <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
                {metric.trend === 'up' ?
                <TrendingUpIcon aria-hidden="true" className="h-3.5 w-3.5 text-brand-600" /> :
                null}
                {metric.footnote}
              </p>
            </Card>);

        })}

        <section className="relative overflow-hidden rounded-card bg-panel p-4 shadow-panel">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60">Avg Daily Rate</p>
            <CreditCardIcon aria-hidden="true" className="h-4 w-4 text-white/50" strokeWidth={1.8} />
          </div>
          <p className="tabular mt-3 text-[30px] font-bold leading-none tracking-tight text-white">
            $284<span className="text-[15px] text-white/50">.50</span>
          </p>
          <div className="mt-4 flex h-8 items-end gap-1" aria-hidden="true">
            {[38, 52, 44, 66, 80, 100].map((h, i) =>
            <span
              key={h}
              className="flex-1 rounded-[2px]"
              style={{
                height: `${h}%`,
                background: i === 5 ? 'linear-gradient(180deg,#d9dd3a,#25b84f)' : 'rgba(255,255,255,0.16)'
              }} />

            )}
          </div>
        </section>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div className="flex items-center gap-1 rounded-lg bg-[#f3f4f0] p-1">
            {bookingTabs.map((t) =>
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={[
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150',
              tab === t.id ? 'bg-white text-ink shadow-card' : 'text-ink-soft hover:text-ink'].
              join(' ')}>
              
                {t.label}
                {'count' in t && t.count ?
              <span className="rounded-full bg-[#fdeceb] px-1.5 text-[10px] font-bold text-[#b3312a]">{t.count}</span> :
              null}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="relative">
              <span className="sr-only">Filter current view</span>
              <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter current view..."
                className="h-9 w-[220px] rounded-lg border border-line bg-white pl-8 pr-3 text-[12px] text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none" />
              
            </label>
            <button
              type="button"
              aria-label="Advanced filters"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink-soft transition-colors duration-150 hover:bg-canvas">
              
              <SlidersHorizontalIcon aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[880px] text-left">
            <thead>
              <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                <th scope="col" className="w-10 py-2.5 pl-4">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])}
                    aria-label="Select all bookings"
                    className="h-3.5 w-3.5 rounded border-line text-brand-600 focus:ring-brand-500" />
                  
                </th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Guest</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Confirmation</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Stay Dates</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Room Type</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Source</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                <th scope="col" className="px-3 py-2.5 pr-4 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((b) => {
                const isChecked = selected.includes(b.id);
                return (
                  <tr
                    key={b.id}
                    className={[
                    'relative transition-colors duration-150 hover:bg-[#fafbf8]',
                    b.status === 'in-house' ? 'bg-brand-50/40' : ''].
                    join(' ')}>
                    
                    <td className="relative py-4 pl-4">
                      {b.status === 'in-house' ?
                      <span className="absolute inset-y-0 left-0 w-[3px] bg-brand-gradient-v" aria-hidden="true" /> :
                      null}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                        setSelected((prev) => e.target.checked ? [...prev, b.id] : prev.filter((id) => id !== b.id))
                        }
                        aria-label={`Select booking ${b.confirmation}`}
                        className="h-3.5 w-3.5 rounded border-line text-brand-600 focus:ring-brand-500" />
                      
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        {b.avatar ?
                        <img src={b.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /> :

                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-panel text-[11px] font-bold text-white">
                            {b.guestName.
                          split(' ').
                          map((n) => n[0]).
                          join('')}
                          </span>
                        }
                        <span>
                          <span className="block text-[13px] font-semibold text-ink">{b.guestName}</span>
                          <span className="block text-[11px] text-ink-muted">{b.guestTag}</span>
                        </span>
                      </div>
                    </td>
                    <td className="tabular px-3 py-4 text-[12px] font-semibold text-ink-soft">{b.confirmation}</td>
                    <td className="px-3 py-4">
                      <span className="block text-[12px] font-medium text-ink">
                        {b.arrival} <span className="text-ink-muted">→</span> {b.departure}
                      </span>
                      <span className="block text-[11px] text-ink-muted">{b.nights} nights</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="block text-[12px] font-medium text-ink">{b.roomType}</span>
                      <span className="block text-[11px] text-ink-muted">
                        {b.roomNumber}
                        {b.roomReady ? <span className="ml-1 font-semibold text-brand-700">(Ready)</span> : null}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`rounded px-2 py-1 text-[10px] font-bold tracking-wide ${sourceTone[b.source] ?? 'bg-[#f1f2ef] text-ink-soft'}`}>
                        {b.source}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <StatusPill tone={statusTone(b.status)}>{statusLabel(b.status)}</StatusPill>
                    </td>
                    <td className="px-3 py-4 pr-4 text-right">
                      <span className="tabular block text-[13px] font-bold text-ink">
                        ${b.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={[
                        'block text-[11px] font-semibold',
                        b.payment === 'balance' ? 'text-[#c2740f]' : 'text-brand-700'].
                        join(' ')}>
                        
                        {b.payment === 'balance' ? `Bal: $${b.balance?.toFixed(2)}` : b.payment === 'prepaid' ? 'Prepaid' : 'Settled'}
                      </span>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>

          {rows.length === 0 ?
          <div className="flex flex-col items-center justify-center gap-2 bg-brand-wash py-14 text-center">
              <p className="text-[14px] font-semibold text-ink">No bookings match this view</p>
              <p className="text-[12px] text-ink-soft">Try clearing the filter or switching tabs.</p>
            </div> :
          null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-[12px] text-ink-muted">
            Showing 1 to {rows.length} of 42 results
          </p>
          <nav aria-label="Pagination" className="flex items-center gap-1">
            {['‹', '1', '2', '3', '…', '›'].map((p, i) =>
            <button
              key={`${p}-${i}`}
              type="button"
              aria-current={p === '1' ? 'page' : undefined}
              className={[
              'flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] font-semibold transition-colors duration-150',
              p === '1' ? 'bg-brand-gradient text-white' : 'text-ink-soft hover:bg-canvas'].
              join(' ')}>
              
                {p}
              </button>
            )}
          </nav>
        </div>
      </Card>
    </div>);

}