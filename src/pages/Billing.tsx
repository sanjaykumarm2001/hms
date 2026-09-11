import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addDays, eachDayOfInterval, parseISO, subDays } from 'date-fns';
import {
  AlertCircle,
  CheckSquare,
  DownloadIcon,
  Eye,
  EyeOff,
  FileSpreadsheetIcon,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  PrimaryButton,
  SearchInput,
  StatusPill,
  Tabs
} from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { isoDate, money, nightsBetween, percent, shortDate } from '../utils/format';
import { paymentLabel, paymentTone, reservationLabel, reservationTone } from '../utils/tone';

type Ledger = 'open' | 'outstanding' | 'settled' | 'all';
type MainTab = 'ledger' | 'reports';
type ReportId = 'occupancy' | 'reservations' | 'guests' | 'revenue' | 'payments' | 'rooms';

const REPORTS: { id: ReportId; label: string; detail: string }[] = [
  { id: 'occupancy', label: 'Occupancy', detail: 'Rooms sold, occupancy, ADR and RevPAR by date' },
  { id: 'reservations', label: 'Reservations', detail: 'Reservations arriving inside the date range' },
  { id: 'guests', label: 'Guests', detail: 'Guest production — stays, nights and spend' },
  { id: 'revenue', label: 'Revenue', detail: 'Posted charges grouped by charge code' },
  { id: 'payments', label: 'Payments', detail: 'Payments, deposits and refunds recorded' },
  { id: 'rooms', label: 'Rooms', detail: 'Room inventory with status and housekeeping' }
];

interface ReportTable {
  columns: string[];
  rows: (string | number)[][];
}

export function Billing() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'reports' ? 'reports' : 'ledger';

  const {
    reservations,
    rooms,
    charges,
    payments,
    guests,
    folio,
    guestName,
    getRoom,
    ops,
    today,
    toggleIncludeInReport
  } = useHotel();

  const [mainTab, setMainTab] = useState<MainTab>(initialTab);
  const [ledger, setLedger] = useState<Ledger>('open');
  const [query, setQuery] = useState('');

  // Date Range Filters & Reports State (Safely initialized)
  const [fromDate, setFromDate] = useState<string>(() => {
    try {
      const base = today ? parseISO(today) : new Date();
      const valid = isNaN(base.getTime()) ? new Date() : base;
      return isoDate(subDays(valid, 7));
    } catch {
      return isoDate(subDays(new Date(), 7));
    }
  });

  const [toDate, setToDate] = useState<string>(() => {
    try {
      const base = today ? parseISO(today) : new Date();
      const valid = isNaN(base.getTime()) ? new Date() : base;
      return isoDate(addDays(valid, 7));
    } catch {
      return isoDate(addDays(new Date(), 7));
    }
  });

  const [reportId, setReportId] = useState<ReportId>('occupancy');

  // Customer Exclusion & Selection States
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hideExcluded, setHideExcluded] = useState<boolean>(false);

  // Folio Rows Calculation
  const folios = useMemo(
    () =>
      (reservations || [])
        .filter((r) => r && r.status !== 'cancelled' && r.includeInReport !== false)
        .map((reservation) => ({ reservation, folio: folio(reservation.id) }))
        .filter(
          (row) =>
            row.folio &&
            ((row.folio.charges || []).length > 0 || (row.folio.payments || []).length > 0)
        ),
    [folio, reservations]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return folios
      .filter((row) => {
        if (hideExcluded && excludedIds.has(row.reservation.id)) return false;
        if (ledger === 'open') return row.reservation.status === 'in-house';
        if (ledger === 'outstanding') return row.folio.balance > 0.5;
        if (ledger === 'settled') return row.folio.balance <= 0.5;
        return true;
      })
      .filter((row) =>
        q
          ? [row.reservation.code, guestName(row.reservation.guestId)].join(' ').toLowerCase().includes(q)
          : true
      )
      .sort((a, b) => b.folio.balance - a.folio.balance);
  }, [folios, guestName, ledger, query, hideExcluded, excludedIds]);

  const counts = {
    open: folios.filter((row) => row.reservation.status === 'in-house').length,
    outstanding: folios.filter((row) => row.folio.balance > 0.5).length,
    settled: folios.filter((row) => row.folio.balance <= 0.5).length,
    all: folios.length
  };

  // Dynamic Ledger Totals
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const isExcluded = excludedIds.has(row.reservation.id);
        if (!isExcluded) {
          acc.charges += row.folio.chargeTotal;
          acc.paid += row.folio.paidTotal;
          acc.balance += row.folio.balance;
        } else {
          acc.excludedCount += 1;
          acc.excludedBalance += row.folio.balance;
        }
        return acc;
      },
      { charges: 0, paid: 0, balance: 0, excludedCount: 0, excludedBalance: 0 }
    );
  }, [rows, excludedIds]);

  // Report Selection & Generation Logic
  const [selectedReportIds, setSelectedReportIds] = useState<Set<ReportId>>(
    new Set(['occupancy', 'reservations', 'guests', 'payments'])
  );

  const isAllReportsSelected = selectedReportIds.size === REPORTS.length;

  const toggleSelectAllReports = () => {
    if (isAllReportsSelected) {
      setSelectedReportIds(new Set());
    } else {
      setSelectedReportIds(new Set(REPORTS.map((r) => r.id)));
    }
  };

  const toggleReportCard = (id: ReportId) => {
    const next = new Set(selectedReportIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedReportIds(next);
  };

  const getReportTableFor = useCallback(
    (id: ReportId): ReportTable => {
      const inRange = (date: string) => date >= fromDate && date <= toDate;
      const activeRes = reservations.filter(
        (r) =>
          r.status !== 'cancelled' &&
          r.status !== 'no-show' &&
          r.includeInReport !== false &&
          !excludedIds.has(r.id)
      );

      if (id === 'occupancy') {
        let days: string[] = [];
        try {
          if (fromDate && toDate && fromDate <= toDate) {
            days = eachDayOfInterval({ start: parseISO(fromDate), end: parseISO(toDate) }).map(isoDate);
          }
        } catch {
          days = [];
        }
        return {
          columns: ['Date', 'Rooms sold', 'Occupancy', 'Room revenue', 'ADR', 'RevPAR'],
          rows: days.map((day) => {
            const sold = activeRes.filter((r) => r.roomId && r.arrival <= day && r.departure > day);
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

      if (id === 'reservations') {
        const list = activeRes.filter((r) => inRange(r.arrival));
        return {
          columns: ['Code', 'Guest', 'Arrival', 'Departure', 'Nights', 'Status', 'Rate/night', 'Action'],
          rows: list.map((r) => [
            r.code,
            guestName(r.guestId),
            shortDate(r.arrival),
            shortDate(r.departure),
            nightsBetween(r.arrival, r.departure),
            reservationLabel[r.status],
            money(r.rate),
            r.id
          ])
        };
      }

      if (id === 'guests') {
        return {
          columns: ['Guest name', 'Stays', 'Nights', 'Total spent', 'Last stay', 'Action'],
          rows: guests.map((g) => {
            const gRes = activeRes.filter((r) => r.guestId === g.id);
            const nights = gRes.reduce((sum, r) => sum + nightsBetween(r.arrival, r.departure), 0);
            const spent = gRes.reduce((sum, r) => sum + folio(r.id).chargeTotal, 0);
            const sortedRes = [...gRes].sort((a, b) => b.arrival.localeCompare(a.arrival));
            const last = sortedRes[0];
            const resId = sortedRes[0]?.id || '';
            return [
              `${g.firstName} ${g.lastName}`,
              gRes.length,
              nights,
              money(spent),
              last ? shortDate(last.arrival) : '—',
              resId
            ];
          })
        };
      }

      if (id === 'revenue') {
        const activeResIds = new Set(activeRes.map((r) => r.id));
        const list = charges.filter((c) => inRange(c.date) && activeResIds.has(c.reservationId));
        const grouped = list.reduce<Record<string, { count: number; total: number }>>((acc, c) => {
          const item = acc[c.code] ?? { count: 0, total: 0 };
          item.count += c.quantity;
          item.total += c.quantity * c.unitPrice;
          acc[c.code] = item;
          return acc;
        }, {});
        return {
          columns: ['Charge code', 'Items posted', 'Total revenue'],
          rows: Object.entries(grouped).map(([code, val]) => [code, val.count, money(val.total)])
        };
      }

      if (id === 'payments') {
        const activeResIds = new Set(activeRes.map((r) => r.id));
        const list = payments.filter((p) => inRange(p.date) && activeResIds.has(p.reservationId));
        return {
          columns: ['Ref #', 'Date', 'Type', 'Method', 'Amount'],
          rows: list.map((p) => [p.reference, shortDate(p.date), p.kind, p.method, money(p.amount)])
        };
      }

      return {
        columns: ['Room #', 'Type', 'Floor', 'Status', 'Housekeeping'],
        rows: rooms.map((r) => [
          r.number,
          r.type,
          `Floor ${r.floor}`,
          ops.statusByRoom[r.id] ?? 'available',
          r.housekeeping
        ])
      };
    },
    [fromDate, toDate, reservations, excludedIds, rooms, guestName, guests, charges, payments, folio, ops.statusByRoom]
  );

  // Grand Total Calculation for Financial & Property Reports
  const grandTotals = useMemo(() => {
    const activeRes = reservations.filter(
      (r) =>
        r.status !== 'cancelled' &&
        r.status !== 'no-show' &&
        r.includeInReport !== false &&
        !excludedIds.has(r.id)
    );
    const activeResIds = new Set(activeRes.map((r) => r.id));

    const totalEstimatedRevenue = activeRes.reduce(
      (sum, r) => sum + r.rate * nightsBetween(r.arrival, r.departure),
      0
    );

    const activeCharges = charges.filter((c) => activeResIds.has(c.reservationId));
    const totalPostedCharges = activeCharges.reduce((sum, c) => sum + c.quantity * c.unitPrice, 0);

    const activePayments = payments.filter((p) => activeResIds.has(p.reservationId));
    const totalPaymentsCollected = activePayments.reduce(
      (sum, p) => sum + (p.kind === 'Refund' ? -p.amount : p.amount),
      0
    );

    const netOutstanding = Math.max(0, totalPostedCharges - totalPaymentsCollected);
    const uniqueGuests = new Set(activeRes.map((r) => r.guestId)).size;

    return {
      totalBookings: activeRes.length,
      uniqueGuests,
      totalEstimatedRevenue,
      totalPostedCharges,
      totalPaymentsCollected,
      netOutstanding
    };
  }, [reservations, excludedIds, charges, payments]);

  // Bulk Selection Handlers
  const visibleIds = useMemo(() => rows.map((r) => r.reservation.id), [rows]);
  const isAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleIds));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (mainTab === 'ledger') {
      csvContent += "Guest,Code,Room,Status,Charges,Paid,Balance\n";
      rows.forEach(({ reservation, folio: f }) => {
        csvContent += `"${guestName(reservation.guestId)}","${reservation.code}","${getRoom(reservation.roomId)?.number ?? ''}","${reservation.status}",${f.chargeTotal},${f.paidTotal},${f.balance}\n`;
      });
    } else {
      const selectedReports = REPORTS.filter((r) => selectedReportIds.has(r.id));
      selectedReports.forEach((rep) => {
        const table = getReportTableFor(rep.id);
        csvContent += `--- ${rep.label} Report ---\n`;
        csvContent += table.columns.filter((c) => c !== 'Action').join(",") + "\n";
        table.rows.forEach((row) => {
          csvContent += row.slice(0, table.columns.length - (table.columns.includes('Action') ? 1 : 0)).map((cell) => `"${cell}"`).join(",") + "\n";
        });
        csvContent += "\n";
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lodgely_${mainTab}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded successfully');
  };

  return (
    <div>
      <PageHeader
        eyebrow="Finance & Reports"
        title="Report"
        subtitle={`${money(ops.outstandingTotal)} outstanding across ${ops.outstanding.length} folios`}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 rounded-lg border border-line bg-white/80 px-2.5 py-1 text-[12px]">
              <span className="font-semibold text-ink-muted">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-ink font-medium outline-none"
              />
              <span className="font-semibold text-ink-muted">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-ink font-medium outline-none"
              />
            </div>
            <PrimaryButton gradient onClick={handleExportCSV}>
              <DownloadIcon aria-hidden="true" className="h-4 w-4" />
              Export CSV
            </PrimaryButton>
          </div>
        }
      />

      {/* Main Tab Navigation: Folio Ledger vs Reports */}
      <div className="mb-5 flex border-b border-line">
        <button
          onClick={() => { setMainTab('ledger'); setSearchParams({ tab: 'ledger' }); }}
          className={`px-5 py-3 text-[14px] font-bold transition-all border-b-2 ${
            mainTab === 'ledger'
              ? 'border-brand text-brand bg-brand-light/30'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Folio Ledger
        </button>
        <button
          onClick={() => { setMainTab('reports'); setSearchParams({ tab: 'reports' }); }}
          className={`px-5 py-3 text-[14px] font-bold transition-all border-b-2 ${
            mainTab === 'reports'
              ? 'border-brand text-brand bg-brand-light/30'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Financial & Property Reports
        </button>
      </div>

      {mainTab === 'ledger' ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Tabs
              tabs={[
                { id: 'open', label: 'Open folios', count: counts.open },
                { id: 'outstanding', label: 'Outstanding', count: counts.outstanding },
                { id: 'settled', label: 'Settled', count: counts.settled },
                { id: 'all', label: 'All folios', count: counts.all }
              ]}
              active={ledger}
              onChange={(next) => setLedger(next as Ledger)}
            />

            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search guest or reservation code…"
              className="w-[260px]"
            />
          </div>

          {/* Active Exclusion Alert Banner */}
          {excludedIds.size > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-[13px] text-amber-900 shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <span className="font-semibold">{excludedIds.size} customer folio(s) excluded</span> from totals ({money(totals.excludedBalance)} excluded balance).
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHideExcluded(!hideExcluded)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[12px] font-medium text-amber-900 hover:bg-amber-100 transition"
                >
                  {hideExcluded ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {hideExcluded ? 'Show Excluded' : 'Hide Excluded'}
                </button>
                <button
                  onClick={() => setExcludedIds(new Set())}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-amber-700 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset All Exclusions
                </button>
              </div>
            </div>
          )}

          {/* Summary Cards with Dynamic Totals */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Charges in view', value: money(totals.charges) },
              { label: 'Payments in view', value: money(totals.paid) },
              {
                label: 'Balance in view',
                value: money(totals.balance),
                isHighlighted: excludedIds.size > 0
              }
            ].map((item) => (
              <Card key={item.label} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-ink-soft">{item.label}</p>
                  {item.isHighlighted && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                      Exclusions Applied
                    </span>
                  )}
                </div>
                <p className="tabular mt-2 text-[24px] font-bold leading-none text-ink">{item.value}</p>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
              <CardHeader
                title="Folio ledger"
                subtitle={`${rows.length} folios in this view ${excludedIds.size > 0 ? `(${excludedIds.size} excluded)` : ''}`}
              />

              {/* Batch Actions Bar */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-brand-light/60 px-3 py-1.5 text-[12px]">
                  <span className="font-semibold text-brand">{selectedIds.size} selected</span>
                  <div className="h-4 w-px bg-brand/20" />
                  <button
                    onClick={() => {
                      const next = new Set(excludedIds);
                      selectedIds.forEach((id) => next.add(id));
                      setExcludedIds(next);
                      setSelectedIds(new Set());
                    }}
                    className="inline-flex items-center gap-1 rounded bg-amber-600 px-2 py-1 font-medium text-white hover:bg-amber-700 transition"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Exclude Selected
                  </button>
                  <button
                    onClick={() => {
                      const next = new Set(excludedIds);
                      selectedIds.forEach((id) => next.delete(id));
                      setExcludedIds(next);
                      setSelectedIds(new Set());
                    }}
                    className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 font-medium text-white hover:bg-emerald-700 transition"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    Include Selected
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-ink-muted hover:text-ink transition pl-1"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {rows.length === 0 ? (
              <EmptyState title="No folios" detail="Nothing matches this ledger filter." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left">
                  <thead>
                    <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted border-b border-line">
                      <th scope="col" className="py-2.5 pl-4 pr-2 w-10">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                        />
                      </th>
                      <th scope="col" className="py-2.5 pl-2 pr-3 font-semibold">Guest</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Reservation</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Room</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Charges</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Paid</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Folio</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-semibold">Balance</th>
                      <th scope="col" className="py-2.5 pl-3 pr-5 text-center font-semibold">Exclusion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map(({ reservation, folio: f }) => {
                      const isSelected = selectedIds.has(reservation.id);
                      const isExcluded = excludedIds.has(reservation.id);

                      return (
                        <tr
                          key={reservation.id}
                          onClick={() => navigate(`/billing/${reservation.id}`)}
                          className={`cursor-pointer transition-colors duration-150 ${
                            isExcluded
                              ? 'bg-amber-50/30 hover:bg-amber-50/60 text-ink-muted'
                              : isSelected
                              ? 'bg-brand-light/20 hover:bg-brand-light/30'
                              : 'hover:bg-emerald-50/60'
                          }`}
                        >
                          <td className="py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleSelectRow(reservation.id, e as any)}
                              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                            />
                          </td>
                          <td className="py-3 pl-2 pr-3">
                            <div>
                              <p className={`text-[13px] font-semibold ${isExcluded ? 'text-ink-muted line-through' : 'text-ink'}`}>
                                {guestName(reservation.guestId)}
                              </p>
                              <p className="text-[11px] text-ink-muted">
                                {shortDate(reservation.arrival)} → {shortDate(reservation.departure)}
                              </p>
                            </div>
                          </td>
                          <td className="tabular px-3 py-3 text-[12px] font-semibold text-ink-soft">
                            {reservation.code}
                          </td>
                          <td className="tabular px-3 py-3 text-[13px] font-semibold text-ink">
                            {getRoom(reservation.roomId)?.number ?? '—'}
                          </td>
                          <td className="px-3 py-3">
                            <StatusPill tone={reservationTone[reservation.status]}>
                              {reservationLabel[reservation.status]}
                            </StatusPill>
                          </td>
                          <td className="tabular px-3 py-3 text-[12px] text-ink-soft">
                            {money(f.chargeTotal)}
                          </td>
                          <td className="tabular px-3 py-3 text-[12px] text-ink-soft">{money(f.paidTotal)}</td>
                          <td className="px-3 py-3">
                            <StatusPill tone={paymentTone[reservation.paymentStatus]} dot={false}>
                              {paymentLabel[reservation.paymentStatus]}
                            </StatusPill>
                          </td>
                          <td className={`tabular px-3 py-3 text-right text-[13px] font-bold ${isExcluded ? 'text-ink-muted line-through' : 'text-ink'}`}>
                            {money(f.balance)}
                          </td>
                          <td className="py-3 pl-3 pr-5 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const next = new Set(excludedIds);
                                if (next.has(reservation.id)) next.delete(reservation.id);
                                else next.add(reservation.id);
                                setExcludedIds(next);
                              }}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                                isExcluded
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {isExcluded ? (
                                <>
                                  <XCircle className="h-3 w-3 text-amber-600" />
                                  Excluded
                                </>
                              ) : (
                                <>
                                  <CheckSquare className="h-3 w-3 text-gray-400" />
                                  Active
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Reports Sub-view */
        <div className="space-y-6">
          {/* Card Selection Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">Select Report Cards to Display</h3>
              <p className="text-[12px] text-gray-500">
                Multi-select card modules to combine reports and view aggregate totals below.
              </p>
            </div>

            <button
              onClick={toggleSelectAllReports}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-all shadow-sm ${
                isAllReportsSelected
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100'
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              {isAllReportsSelected ? 'Deselect All Cards' : 'Select All Cards'}
            </button>
          </div>

          {/* Multi-Select Cards Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REPORTS.map((r) => {
              const isSelected = selectedReportIds.has(r.id);
              return (
                <div key={r.id} onClick={() => toggleReportCard(r.id)}>
                  <Card
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-light/30 ring-2 ring-brand-500/20 shadow-sm'
                        : 'hover:bg-emerald-50/40 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleReportCard(r.id)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 accent-brand-600 cursor-pointer"
                        />
                        <p className="text-[14px] font-bold text-ink">{r.label}</p>
                      </div>
                      <FileSpreadsheetIcon className={`h-4 w-4 ${isSelected ? 'text-brand-600' : 'text-ink-muted'}`} />
                    </div>
                    <p className="mt-1.5 ml-6 text-[11px] text-ink-muted">{r.detail}</p>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Active Guest Removal / Exclusion Manager Banner */}
          {excludedIds.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-[13px] text-amber-900 shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <span className="font-bold">{excludedIds.size} guest(s) manually removed</span> from Financial Reports calculations.
                </div>
              </div>
              <button
                onClick={() => setExcludedIds(new Set())}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-amber-700 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset & Re-include All Guests
              </button>
            </div>
          )}

          {/* Selected Report Tables Render Loop */}
          {selectedReportIds.size === 0 ? (
            <Card className="p-12 text-center">
              <EmptyState
                title="No report cards selected"
                detail="Click on one or more report cards above or click 'Select All Cards' to generate financial reports."
              />
            </Card>
          ) : (
            REPORTS.filter((r) => selectedReportIds.has(r.id)).map((rep) => {
              const table = getReportTableFor(rep.id);
              return (
                <Card key={rep.id} className="overflow-hidden">
                  <CardHeader
                    title={`${rep.label} Report`}
                    subtitle={`Showing calculations from ${shortDate(fromDate)} to ${shortDate(toDate)}`}
                  />

                  <div className="overflow-x-auto border-t border-line">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted border-b border-line">
                          {table.columns.map((col) => (
                            <th key={col} scope="col" className="px-4 py-3 font-semibold">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {table.rows.map((row, idx) => (
                          <tr key={idx} className="transition-colors hover:bg-emerald-50/60">
                            {row.map((cell, cIdx) => {
                              const isActionColumn = table.columns[cIdx] === 'Action';
                              if (isActionColumn) {
                                const resId = String(cell);
                                return (
                                  <td key={cIdx} className="px-4 py-3 text-[12px] text-ink">
                                    {resId ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = new Set(excludedIds);
                                          next.add(resId);
                                          setExcludedIds(next);
                                          toggleIncludeInReport(resId, false);
                                        }}
                                        className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 border border-red-200 transition"
                                      >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Remove Guest
                                      </button>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>
                                );
                              }
                              return (
                                <td key={cIdx} className="px-4 py-3 text-[12px] text-ink">
                                  {cell}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              );
            })
          )}

          {/* GRAND TOTAL BELOW (Summarized at the bottom) */}
          {selectedReportIds.size > 0 && (
            <div className="rounded-2xl border border-brand-200 bg-white p-6 text-gray-900 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                    REPORT GRAND TOTAL SUMMARY
                  </p>
                  <h3 className="text-xl font-extrabold text-gray-900">Financial & Property Totals Below</h3>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 border border-brand-200">
                  {selectedReportIds.size} Cards Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 pt-2">
                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100">
                  <span className="block text-[11px] font-semibold text-gray-500">Total Bookings</span>
                  <span className="mt-1 block text-2xl font-extrabold text-gray-900">
                    {grandTotals.totalBookings}
                  </span>
                </div>

                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100">
                  <span className="block text-[11px] font-semibold text-gray-500">Included Guests</span>
                  <span className="mt-1 block text-2xl font-extrabold text-gray-900">
                    {grandTotals.uniqueGuests}
                  </span>
                </div>

                <div className="rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100">
                  <span className="block text-[11px] font-semibold text-emerald-800">Estimated Revenue</span>
                  <span className="mt-1 block text-2xl font-extrabold text-emerald-600">
                    {money(grandTotals.totalEstimatedRevenue)}
                  </span>
                </div>

                <div className="rounded-xl bg-blue-50/60 p-3.5 border border-blue-100">
                  <span className="block text-[11px] font-semibold text-blue-800">Posted Charges</span>
                  <span className="mt-1 block text-2xl font-extrabold text-blue-600">
                    {money(grandTotals.totalPostedCharges)}
                  </span>
                </div>

                <div className="rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100">
                  <span className="block text-[11px] font-semibold text-emerald-800">Payments Collected</span>
                  <span className="mt-1 block text-2xl font-extrabold text-emerald-600">
                    {money(grandTotals.totalPaymentsCollected)}
                  </span>
                </div>

                <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-100">
                  <span className="block text-[11px] font-semibold text-amber-800">Net Outstanding</span>
                  <span className="mt-1 block text-2xl font-extrabold text-amber-600">
                    {money(grandTotals.netOutstanding)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}