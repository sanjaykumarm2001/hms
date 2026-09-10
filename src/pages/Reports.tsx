import React, { useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { DownloadIcon, FileBarChartIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { money, titleize } from '../utils/format';
import { roomTypeName } from '../data/property';

type ReportId =
'occupancy' |
'reservations' |
'revenue' |
'payments' |
'rooms' |
'guests';

interface ReportTable {
  columns: string[];
  rows: string[][];
  summary: {label: string;value: string;}[];
}

const reportList: {id: ReportId;label: string;detail: string;}[] = [
{ id: 'occupancy', label: 'Occupancy', detail: 'Rooms sold, availability and RevPAR' },
{ id: 'reservations', label: 'Reservations', detail: 'Bookings by status and source' },
{ id: 'revenue', label: 'Revenue', detail: 'Charges posted by revenue centre' },
{ id: 'payments', label: 'Payments', detail: 'Settlements by method and type' },
{ id: 'rooms', label: 'Room status', detail: 'Front office and housekeeping state' },
{ id: 'guests', label: 'Guests', detail: 'Profiles, tiers and stay counts' }];


export function Reports() {
  const { ops, reservations, charges, payments, rooms, guests, guestById, folio } =
  useHotel();
  const [report, setReport] = useState<ReportId>('occupancy');
  const [from, setFrom] = useState(format(addDays(new Date(), -7), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));

  const table = useMemo<ReportTable>(() => {
    const inRange = (iso: string) => iso >= from && iso <= to;

    if (report === 'occupancy') {
      return {
        columns: ['Metric', 'Value'],
        rows: [
        ['Rooms in inventory', String(rooms.length)],
        ['Occupied', String(ops.counts.occupied)],
        ['Reserved', String(ops.counts.reserved)],
        ['Available', String(ops.counts.available)],
        ['Out of order', String(ops.counts.maintenance + ops.counts.outOfService)],
        ['Occupancy', `${ops.occupancy}%`],
        ['ADR', money(ops.adr)],
        ['RevPAR', money(ops.revpar)]],

        summary: [
        { label: 'Occupancy', value: `${ops.occupancy}%` },
        { label: 'ADR', value: money(ops.adr) },
        { label: 'RevPAR', value: money(ops.revpar) }]

      };
    }

    if (report === 'reservations') {
      const rows = reservations.
      filter((r) => inRange(r.arrival)).
      map((r) => [
      r.confirmation,
      guestById(r.guestId) ?
      `${guestById(r.guestId)!.firstName} ${guestById(r.guestId)!.lastName}` :
      '—',
      r.arrival,
      r.departure,
      r.source,
      titleize(r.status),
      money(folio(r.id).chargeTotal)]
      );
      return {
        columns: [
        'Confirmation',
        'Guest',
        'Arrival',
        'Departure',
        'Source',
        'Status',
        'Charges'],

        rows,
        summary: [
        { label: 'Reservations', value: String(rows.length) },
        {
          label: 'Cancelled',
          value: String(
            reservations.filter((r) => inRange(r.arrival) && r.status === 'cancelled').
            length
          )
        },
        { label: 'In-house now', value: String(ops.inHouse.length) }]

      };
    }

    if (report === 'revenue') {
      const byCode = new Map<string, number>();
      charges.
      filter((c) => inRange(c.postedAt.slice(0, 10))).
      forEach((c) =>
      byCode.set(c.code, (byCode.get(c.code) ?? 0) + c.qty * c.unitPrice)
      );
      const total = [...byCode.values()].reduce((a, b) => a + b, 0);
      return {
        columns: ['Revenue centre', 'Amount', 'Share'],
        rows: [...byCode.entries()].
        sort((a, b) => b[1] - a[1]).
        map(([code, amount]) => [
        titleize(code),
        money(amount),
        `${total ? Math.round(amount / total * 100) : 0}%`]
        ),
        summary: [
        { label: 'Total charges', value: money(total) },
        { label: 'Revenue centres', value: String(byCode.size) }]

      };
    }

    if (report === 'payments') {
      const rows = payments.
      filter((p) => inRange(p.at.slice(0, 10))).
      map((p) => [
      p.at.slice(0, 10),
      titleize(p.kind),
      titleize(p.method),
      p.by,
      money(p.amount)]
      );
      const total = payments.
      filter((p) => inRange(p.at.slice(0, 10))).
      reduce((sum, p) => sum + (p.kind === 'refund' ? -p.amount : p.amount), 0);
      return {
        columns: ['Date', 'Type', 'Method', 'Posted by', 'Amount'],
        rows,
        summary: [
        { label: 'Net settlements', value: money(total) },
        { label: 'Transactions', value: String(rows.length) },
        { label: 'Outstanding', value: money(ops.totalOutstanding) }]

      };
    }

    if (report === 'rooms') {
      return {
        columns: ['Room', 'Type', 'Floor', 'Front office', 'Housekeeping', 'Priority'],
        rows: rooms.map((r) => [
        r.number,
        roomTypeName(r.type),
        String(r.floor),
        titleize(ops.statusOf(r.id)),
        titleize(r.housekeeping),
        titleize(r.hkPriority)]
        ),
        summary: [
        { label: 'Dirty', value: String(ops.counts.dirty) },
        { label: 'Inspected', value: String(ops.counts.inspected) },
        { label: 'Sellable & ready', value: String(ops.vacantReady.length) }]

      };
    }

    return {
      columns: ['Guest', 'Tier', 'Segment', 'Country', 'Stays'],
      rows: guests.map((g) => [
      `${g.firstName} ${g.lastName}`,
      titleize(g.tier),
      titleize(g.segment),
      g.country,
      String(g.stays)]
      ),
      summary: [
      { label: 'Profiles', value: String(guests.length) },
      {
        label: 'VIP',
        value: String(guests.filter((g) => g.tier === 'vip').length)
      }]

    };
  }, [
  report,
  from,
  to,
  rooms,
  ops,
  reservations,
  charges,
  payments,
  guests,
  guestById,
  folio]
  );

  const exportCsv = () => {
    const csv = [table.columns.join(','), ...table.rows.map((r) => r.join(','))].join(
      '\n'
    );
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentinel-${report}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        subtitle="Generated live from current operational state."
        actions={
        <Button variant="primary" onClick={exportCsv}>
            <DownloadIcon className="h-4 w-4" /> Export CSV
          </Button>
        } />
      

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card title="Report" padded={false}>
            <ul className="divide-y divide-line">
              {reportList.map((item) =>
              <li key={item.id}>
                  <button
                  type="button"
                  onClick={() => setReport(item.id)}
                  className={`w-full px-4 py-3 text-left transition-colors duration-150 ease-out ${
                  report === item.id ? 'bg-brand-50' : 'hover:bg-slate-50'}`
                  }>
                  
                    <span
                    className={`block text-[13px] font-medium ${
                    report === item.id ? 'text-brand-700' : 'text-ink'}`
                    }>
                    
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-ink-faint">
                      {item.detail}
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </Card>

          <Card title="Date range">
            <Field label="From">
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)} />
              
            </Field>
            <Field label="To" className="mt-3">
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {table.summary.map((item) =>
            <div
              key={item.label}
              className="rounded-xl border border-line bg-white p-4 shadow-card">
              
                <p className="text-[11px] font-medium text-ink-faint">{item.label}</p>
                <p className="tabular mt-1 text-[22px] font-semibold text-ink">
                  {item.value}
                </p>
              </div>
            )}
          </div>

          <Card
            title={`${reportList.find((r) => r.id === report)?.label} · ${from} → ${to}`}
            padded={false}>
            
            {table.rows.length === 0 ?
            <EmptyState
              icon={FileBarChartIcon}
              title="No data in this range"
              detail="Widen the date range to include more activity." /> :


            <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                      {table.columns.map((col) =>
                    <th key={col} className="px-4 py-2.5">
                          {col}
                        </th>
                    )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {table.rows.map((row, i) =>
                  <tr key={i} className="hover:bg-slate-50">
                        {row.map((cell, j) =>
                    <td
                      key={j}
                      className={`px-4 py-2.5 text-[13px] ${
                      j === 0 ?
                      'font-medium text-ink' :
                      'tabular text-ink-muted'}`
                      }>
                      
                            {cell}
                          </td>
                    )}
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            }
          </Card>
        </div>
      </div>
    </Page>);

}