import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BedDoubleIcon,
  DownloadIcon,
  LogInIcon,
  PlaneIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon } from
'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge, PaymentBadge, ReservationBadge } from '../components/ui/Badge';
import { BookingModal } from '../components/workflows/BookingModal';
import { money, nights, shortDate } from '../utils/format';
import { roomTypeName } from '../data/property';
import type { Reservation } from '../types';

type Tab = 'all' | 'arrivals' | 'in_house' | 'departures';

const PAGE_SIZE = 8;

export function Bookings() {
  const { reservations, guestById, roomById, folio, ops, today } = useHotel();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);

  const totalFor = (res: Reservation) => {
    const f = folio(res.id);
    return f.chargeTotal > 0 ?
    f.chargeTotal :
    res.rate * nights(res.arrival, res.departure);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byTab = reservations.filter((res) => {
      if (tab === 'arrivals')
      return res.arrival === today && res.status === 'confirmed';
      if (tab === 'in_house') return res.status === 'in_house';
      if (tab === 'departures')
      return res.status === 'in_house' && res.departure <= today;
      return true;
    });
    if (!q) return byTab;
    return byTab.filter((res) => {
      const guest = guestById(res.guestId);
      const room = roomById(res.roomId);
      return `${res.confirmation} ${guest?.firstName ?? ''} ${guest?.lastName ?? ''} ${room?.number ?? ''} ${res.source}`.
      toLowerCase().
      includes(q);
    });
  }, [reservations, tab, query, today, guestById, roomById]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const exportCsv = () => {
    const header = [
    'Confirmation',
    'Guest',
    'Arrival',
    'Departure',
    'Room',
    'Room type',
    'Source',
    'Status',
    'Total'];

    const lines = filtered.map((res) => {
      const guest = guestById(res.guestId);
      const room = roomById(res.roomId);
      return [
      res.confirmation,
      guest ? `${guest.firstName} ${guest.lastName}` : '',
      res.arrival,
      res.departure,
      room?.number ?? '',
      roomTypeName(res.roomType),
      res.source,
      res.status,
      totalFor(res).toFixed(2)].
      join(',');
    });
    const csv = [header.join(','), ...lines].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sentinel-bookings.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} bookings`);
  };

  const tabs: {id: Tab;label: string;count?: number;}[] = [
  { id: 'all', label: 'All bookings' },
  { id: 'arrivals', label: 'Arrivals', count: ops.arrivals.length },
  { id: 'in_house', label: 'In-house', count: ops.inHouse.length },
  { id: 'departures', label: 'Departures', count: ops.departures.length }];


  const stats = [
  {
    label: 'Arrivals today',
    value: ops.arrivals.length,
    meta: `${ops.arrivals.filter((r) => r.roomId).length} rooms assigned`,
    icon: LogInIcon
  },
  {
    label: 'In-house',
    value: ops.inHouse.length,
    meta: `${ops.occupancy}% occupancy`,
    icon: BedDoubleIcon
  },
  {
    label: 'Departures today',
    value: ops.departures.length,
    meta: `${ops.outstanding.length} with balances`,
    icon: PlaneIcon
  }];


  return (
    <Page>
      <PageHeader
        eyebrow="Reservations"
        title="Bookings"
        subtitle="Manage reservations, track incoming arrivals, and review departure statuses."
        actions={
        <>
            <Button onClick={exportCsv}>
              <DownloadIcon className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="primary" onClick={() => setBookingOpen(true)}>
              <PlusIcon className="h-4 w-4" /> New booking
            </Button>
          </>
        } />
      

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) =>
        <div
          key={stat.label}
          className="rounded-xl border border-line bg-white p-4 shadow-card">
          
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-faint">
                {stat.label}
              </p>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-ink-muted">
                <stat.icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="tabular mt-2 text-[30px] font-semibold leading-none text-ink">
              {stat.value}
            </p>
            <p className="mt-2 text-[11px] text-ink-muted">{stat.meta}</p>
          </div>
        )}
        <div className="rounded-xl bg-slate-900 p-4 text-white shadow-card">
          <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-white/60">
            Avg daily rate
          </p>
          <p className="tabular mt-2 text-[30px] font-semibold leading-none">
            {money(ops.adr)}
          </p>
          <p className="mt-2 text-[11px] text-white/60">
            RevPAR {money(ops.revpar)} · {ops.inHouse.length} rooms sold
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <div className="inline-flex rounded-lg border border-line bg-slate-50 p-0.5">
              {tabs.map((t) =>
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out ${
                tab === t.id ?
                'bg-white text-ink shadow-card' :
                'text-ink-muted hover:text-ink'}`
                }>
                
                  {t.label}
                  {typeof t.count === 'number' && t.count > 0 &&
                <span className="tabular rounded bg-slate-200 px-1 text-[10px] font-semibold text-ink-muted">
                      {t.count}
                    </span>
                }
                </button>
              )}
            </div>
            <div className="relative ml-auto w-full max-w-[260px]">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter current view…"
                aria-label="Filter bookings"
                className="h-9 w-full rounded-lg border border-line bg-white pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none" />
              
            </div>
            <Button
              size="sm"
              onClick={() => {
                setQuery('');
                setTab('all');
                toast.success('Filters cleared');
              }}
              aria-label="Reset filters">
              
              <SlidersHorizontalIcon className="h-3.5 w-3.5" />
            </Button>
          </div>

          {rows.length === 0 ?
          <EmptyState
            icon={SearchIcon}
            title="No bookings match this view"
            detail="Try a different tab or clear the filter." /> :


          <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                    <th className="w-10 px-4 py-2.5">
                      <input
                      type="checkbox"
                      aria-label="Select all rows"
                      checked={rows.every((r) => selected.includes(r.id))}
                      onChange={(e) =>
                      setSelected(e.target.checked ? rows.map((r) => r.id) : [])
                      }
                      className="h-3.5 w-3.5 rounded border-line text-brand-600 focus:ring-brand-500" />
                    
                    </th>
                    <th className="px-2 py-2.5">Guest</th>
                    <th className="px-2 py-2.5">Confirmation</th>
                    <th className="px-2 py-2.5">Stay dates</th>
                    <th className="px-2 py-2.5">Room</th>
                    <th className="px-2 py-2.5">Source</th>
                    <th className="px-2 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((res) => {
                  const guest = guestById(res.guestId);
                  const room = roomById(res.roomId);
                  const stayNights = nights(res.arrival, res.departure);
                  const isToday = res.arrival === today;
                  return (
                    <tr
                      key={res.id}
                      className="group transition-colors duration-150 ease-out hover:bg-slate-50">
                      
                        <td className="px-4 py-3 align-top">
                          <input
                          type="checkbox"
                          aria-label={`Select ${res.confirmation}`}
                          checked={selected.includes(res.id)}
                          onChange={(e) =>
                          setSelected((prev) =>
                          e.target.checked ?
                          [...prev, res.id] :
                          prev.filter((id) => id !== res.id)
                          )
                          }
                          className="h-3.5 w-3.5 rounded border-line text-brand-600 focus:ring-brand-500" />
                        
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-2.5">
                            {guest &&
                          <Avatar
                            firstName={guest.firstName}
                            lastName={guest.lastName}
                            size="sm" />

                          }
                            <div>
                              <Link
                              to={`/bookings/${res.id}`}
                              className="block text-[13px] font-semibold text-ink hover:text-brand-600">
                              
                                {guest ?
                              `${guest.firstName} ${guest.lastName}` :
                              'Unknown'}
                              </Link>
                              <span className="text-[11px] text-ink-faint">
                                {guest?.tier === 'vip' ?
                              'VIP guest' :
                              guest?.segment === 'corporate' ?
                              'Corporate rate' :
                              'Leisure'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <Link
                          to={`/bookings/${res.id}`}
                          className="tabular text-[13px] font-medium text-brand-600">
                          
                            #{res.confirmation}
                          </Link>
                        </td>
                        <td className="px-2 py-3">
                          <p className="text-[12px] font-medium text-ink">
                            {isToday ? 'Today' : shortDate(res.arrival)} ·{' '}
                            {shortDate(res.departure)}
                          </p>
                          <p className="text-[11px] text-ink-faint">
                            {stayNights} night{stayNights > 1 ? 's' : ''}
                          </p>
                        </td>
                        <td className="px-2 py-3">
                          <p className="text-[12px] text-ink">
                            {roomTypeName(res.roomType)}
                          </p>
                          <p className="text-[11px] text-ink-faint">
                            {room ? `Room ${room.number}` : 'Unassigned'}
                            {room && (
                          room.housekeeping === 'inspected' ||
                          room.housekeeping === 'clean') &&
                          <span className="text-emerald-600"> · ready</span>
                          }
                          </p>
                        </td>
                        <td className="px-2 py-3">
                          <Badge tone="neutral">{res.source.toUpperCase()}</Badge>
                        </td>
                        <td className="px-2 py-3">
                          <ReservationBadge status={res.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="tabular text-[13px] font-semibold text-ink">
                            {money(totalFor(res))}
                          </p>
                          <span className="mt-1 inline-block">
                            <PaymentBadge status={res.paymentStatus} />
                          </span>
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            </div>
          }

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            <p className="text-[12px] text-ink-muted">
              Showing {rows.length ? (current - 1) * PAGE_SIZE + 1 : 0} to{' '}
              {(current - 1) * PAGE_SIZE + rows.length} of {filtered.length} results
              {selected.length > 0 && ` · ${selected.length} selected`}
            </p>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}>
                
                Prev
              </Button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) =>
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === current ? 'page' : undefined}
                className={`tabular h-8 w-8 rounded-lg text-[12px] font-medium transition-colors duration-150 ease-out ${
                n === current ?
                'bg-brand-600 text-white' :
                'text-ink-muted hover:bg-slate-100'}`
                }>
                
                  {n}
                </button>
              )}
              <Button
                size="sm"
                disabled={current === pageCount}
                onClick={() => setPage(current + 1)}>
                
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </Page>);

}