import React, { useMemo, useState } from 'react';
import { addDays, eachDayOfInterval, parseISO, subDays } from 'date-fns';
import { DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  Field,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  TextInput } from
'../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { isoDate, money, nightsBetween, percent, shortDate } from '../utils/format';

type ReportId = 'occupancy' | 'reservations' | 'guests' | 'revenue' | 'payments' | 'rooms';

const REPORTS: {id: ReportId;label: string;detail: string;}[] = [
{ id: 'occupancy', label: 'Occupancy', detail: 'Rooms sold, occupancy, ADR and RevPAR by date' },
{ id: 'reservations', label: 'Reservations', detail: 'Reservations arriving inside the date range' },
{ id: 'guests', label: 'Guests', detail: 'Guest production — stays, nights and spend' },
{ id: 'revenue', label: 'Revenue', detail: 'Posted charges grouped by charge code' },
{ id: 'payments', label: 'Payments', detail: 'Payments, deposits and refunds recorded' },
{ id: 'rooms', label: 'Rooms', detail: 'Room inventory with status and housekeeping' }];


interface ReportTable {
  columns: string[];
  rows: (string | number)[][];
}

export function Reports() {
  const { rooms, reservations, charges, payments, guests, guestName, getRoom, ops, folio, today } =
  useHotel();
  const [reportId, setReportId] = useState<ReportId>('occupancy');
  const [from, setFrom] = useState(isoDate(subDays(parseISO(today), 7)));
  const [to, setTo] = useState(isoDate(addDays(parseISO(today), 7)));
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const table = useMemo<ReportTable>(() => {
    const inRange = (date: string) => date >= from && date <= to;
    const active = reservations.filter(
      (r) => r.status !== 'cancelled' && r.status !== 'no-show' && r.includeInReport !== false
    );
    const validCharges = charges.filter((charge) => {
      const r = reservations.find((res) => res.id === charge.reservationId);
      return !r || r.includeInReport !== false;
    });
    const validPayments = payments.filter((payment) => {
      const r = reservations.find((res) => res.id === payment.reservationId);
      return !r || r.includeInReport !== false;
    });

    if (reportId === 'occupancy') {
      const days =
        from <= to ? eachDayOfInterval({ start: parseISO(from), end: parseISO(to) }).map(isoDate) : [];
      return {
        columns: ['Date', 'Rooms sold', 'Occupancy', 'Room revenue', 'ADR', 'RevPAR'],
        rows: days.map((day) => {
          const sold = active.filter((r) => r.roomId && r.arrival <= day && r.departure > day);
          const revenue = sold.reduce((sum, r) => sum + r.rate, 0);
          return [
            shortDate(day),
            sold.length,
            percent(rooms.length ? (sold.length / rooms.length) * 100 : 0),
            money(revenue),
            money(sold.length ? revenue / sold.length : 0),
            money(rooms.length ? revenue / rooms.length : 0)
          ];
        })
      };
    }

    if (reportId === 'reservations') {
      return {
        columns: ['Code', 'Guest', 'Arrival', 'Departure', 'Nights', 'Room', 'Status', 'Stay value'],
        rows: active
          .filter((r) => inRange(r.arrival))
          .sort((a, b) => a.arrival.localeCompare(b.arrival))
          .map((r) => [
            r.code,
            guestName(r.guestId),
            shortDate(r.arrival),
            shortDate(r.departure),
            nightsBetween(r.arrival, r.departure),
            getRoom(r.roomId)?.number ?? '—',
            r.status,
            money(r.rate * nightsBetween(r.arrival, r.departure))
          ])
      };
    }

    if (reportId === 'guests') {
      return {
        columns: ['Guest', 'Tier', 'Segment', 'Stays', 'Nights', 'Charges', 'Balance'],
        rows: guests
          .map((guest) => {
            const stays = active.filter((r) => r.guestId === guest.id && inRange(r.arrival));
            const nights = stays.reduce((sum, r) => sum + nightsBetween(r.arrival, r.departure), 0);
            const chargeTotal = stays.reduce((sum, r) => sum + folio(r.id).chargeTotal, 0);
            const balance = stays.reduce((sum, r) => sum + Math.max(0, folio(r.id).balance), 0);
            return { guest, stays: stays.length, nights, chargeTotal, balance };
          })
          .filter((row) => row.stays > 0)
          .sort((a, b) => b.chargeTotal - a.chargeTotal)
          .map((row) => [
            `${row.guest.firstName} ${row.guest.lastName}`,
            row.guest.tier,
            row.guest.segment,
            row.stays,
            row.nights,
            money(row.chargeTotal),
            money(row.balance)
          ])
      };
    }

    if (reportId === 'revenue') {
      const map = new Map<string, { count: number; total: number }>();
      validCharges
        .filter((charge) => inRange(charge.date))
        .forEach((charge) => {
          const current = map.get(charge.code) ?? { count: 0, total: 0 };
          map.set(charge.code, {
            count: current.count + charge.quantity,
            total: current.total + charge.quantity * charge.unitPrice
          });
        });
      const total = [...map.values()].reduce((sum, item) => sum + item.total, 0);
      return {
        columns: ['Charge code', 'Items posted', 'Revenue', 'Share'],
        rows: [...map.entries()]
          .sort((a, b) => b[1].total - a[1].total)
          .map(([code, item]) => [
            code,
            item.count,
            money(item.total),
            percent(total ? (item.total / total) * 100 : 0)
          ])
      };
    }

    if (reportId === 'payments') {
      return {
        columns: ['Date', 'Guest', 'Reservation', 'Type', 'Method', 'Reference', 'Amount'],
        rows: validPayments
          .filter((payment) => inRange(payment.date))
          .sort((a, b) => a.date.localeCompare(b.date) || a.reference.localeCompare(b.reference))
          .map((payment) => {
            const reservation = reservations.find((r) => r.id === payment.reservationId);
            return [
              isoDate(payment.date),
              reservation ? guestName(reservation.guestId) : '—',
              reservation?.code ?? '—',
              payment.kind,
              payment.method,
              payment.reference,
              money(payment.amount)
            ];
          })
      };
    }

    return {
      columns: ['Room', 'Type', 'Floor', 'Rate', 'Front office status', 'Housekeeping', 'Housekeeper'],
      rows: [...rooms]
        .sort((a, b) => a.number.localeCompare(b.number))
        .map((room) => [
          room.number,
          room.type,
          room.floor,
          money(room.rate),
          ops.statusByRoom[room.id],
          room.housekeeping,
          room.housekeeper ?? 'Unassigned'
        ])
    };
  }, [
    charges,
    folio,
    from,
    getRoom,
    guestName,
    guests,
    ops.statusByRoom,
    payments,
    reportId,
    reservations,
    rooms,
    to
  ]);

  const meta = REPORTS.find((report) => report.id === reportId);

  function exportCsv() {
    const escapeCell = (cell: string | number | undefined | null) => {
      if (cell === undefined || cell === null) return '""';
      const str = String(cell);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headerLine = table.columns.map(escapeCell).join(',');
    const rowLines = table.rows.map((row) => row.map(escapeCell).join(','));
    const csvString = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportId}-${from}-to-${to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Report exported', { description: `${table.rows.length} rows written to CSV.` });
  }

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
              Reports & Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#176938]">
              <span className="h-2 w-2 rounded-full bg-[#176938] animate-pulse" />
              LIVE REPORTING ENGINE
            </span>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 font-normal">
            Generated live from the operational state — rooms, reservations, folios and payments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrimaryButton onClick={exportCsv} disabled={table.rows.length === 0}>
            <DownloadIcon aria-hidden="true" className="h-4 w-4" />
            Export CSV
          </PrimaryButton>
        </div>
      </div>
      

      <Card className="mb-5 p-5 glass-card-premium border border-slate-200/80 shadow-sm rounded-2xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px_180px_auto]">
          <Field label="Report">
            <SelectInput
              value={reportId}
              onChange={(event) => setReportId(event.target.value as ReportId)}>
              
              {REPORTS.map((report) =>
              <option key={report.id} value={report.id}>
                  {report.label}
                </option>
              )}
            </SelectInput>
          </Field>
          <Field label="From">
            <TextInput type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </Field>
          <Field label="To">
            <TextInput type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </Field>
          <div className="flex items-end">
            <PrimaryButton onClick={() => setGeneratedAt(new Date().toLocaleTimeString())}>
              Generate report
            </PrimaryButton>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-ink-muted">
          {meta?.detail}
          {generatedAt ? ` · last generated ${generatedAt}` : ''}
        </p>
      </Card>

      <Card className="glass-card-premium p-0 border border-slate-200/80 shadow-md backdrop-blur-md rounded-2xl overflow-hidden">
        <CardHeader
          title={`${meta?.label} report`}
          subtitle={`${table.rows.length} rows · ${shortDate(from)} → ${shortDate(to)}`} />
        
        {table.rows.length === 0 ?
        <p className="border-t border-line px-5 py-12 text-center text-[12px] text-ink-muted">
            No data in this range. Widen the date range and generate again.
          </p> :

        <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  {table.columns.map((column, index) =>
                <th
                  key={column}
                  scope="col"
                  className={[
                  'py-2.5 font-semibold',
                  index === 0 ? 'pl-5 pr-3' : 'px-3',
                  index === table.columns.length - 1 ? 'pr-5 text-right' : ''].
                  join(' ')}>
                  
                      {column}
                    </th>
                )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {table.rows.map((row, rowIndex) =>
              <tr key={rowIndex} className="transition-colors duration-150 hover:bg-emerald-50/60">
                    {row.map((cell, cellIndex) =>
                <td
                  key={cellIndex}
                  className={[
                  'tabular py-2.5 text-[12px]',
                  cellIndex === 0 ? 'pl-5 pr-3 font-semibold text-ink' : 'px-3 text-ink-soft',
                  cellIndex === row.length - 1 ? 'pr-5 text-right font-semibold text-ink' : ''].
                  join(' ')}>
                  
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
    </div>);

}