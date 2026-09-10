import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckSquare, Eye, EyeOff, RefreshCw, XCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  SearchInput,
  StatusPill,
  Tabs
} from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { money, shortDate } from '../utils/format';
import { paymentLabel, paymentTone, reservationLabel, reservationTone } from '../utils/tone';

type Ledger = 'open' | 'outstanding' | 'settled' | 'all';

export function Billing() {
  const navigate = useNavigate();
  const { reservations, folio, guestName, getRoom, ops } = useHotel();
  const [ledger, setLedger] = useState<Ledger>('open');
  const [query, setQuery] = useState('');

  // Customer Exclusion & Selection States
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hideExcluded, setHideExcluded] = useState<boolean>(false);

  const folios = useMemo(
    () =>
      reservations
        .filter((r) => r.status !== 'cancelled')
        .map((reservation) => ({ reservation, folio: folio(reservation.id) }))
        .filter((row) => row.folio.charges.length > 0 || row.folio.payments.length > 0),
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

  // Dynamic calculations: exclude customer folios in excludedIds
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

  const visibleIds = useMemo(() => rows.map((r) => r.reservation.id), [rows]);
  const isAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const selectedCount = selectedIds.size;

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

  const handleExcludeSelected = () => {
    const next = new Set(excludedIds);
    selectedIds.forEach((id) => next.add(id));
    setExcludedIds(next);
    setSelectedIds(new Set());
  };

  const handleIncludeSelected = () => {
    const next = new Set(excludedIds);
    selectedIds.forEach((id) => next.delete(id));
    setExcludedIds(next);
    setSelectedIds(new Set());
  };

  const handleToggleExcludeSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(excludedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExcludedIds(next);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title="Billing"
        subtitle={`${money(ops.outstandingTotal)} outstanding across ${ops.outstanding.length} folios`}
      />

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
              <span className="font-semibold">{excludedIds.size} customer folio(s) excluded</span> from billing totals ({money(totals.excludedBalance)} excluded balance).
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

          {/* Batch Actions Bar when rows are selected */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-brand-light/60 px-3 py-1.5 text-[12px]">
              <span className="font-semibold text-brand">{selectedCount} selected</span>
              <div className="h-4 w-px bg-brand/20" />
              <button
                onClick={handleExcludeSelected}
                className="inline-flex items-center gap-1 rounded bg-amber-600 px-2 py-1 font-medium text-white hover:bg-amber-700 transition"
              >
                <XCircle className="h-3.5 w-3.5" />
                Exclude Selected
              </button>
              <button
                onClick={handleIncludeSelected}
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
                      title="Select / Deselect All"
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
                          : 'hover:bg-[#fafbf8]'
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
                        <div className="flex items-center gap-2">
                          <div>
                            <p className={`text-[13px] font-semibold ${isExcluded ? 'text-ink-muted line-through' : 'text-ink'}`}>
                              {guestName(reservation.guestId)}
                            </p>
                            <p className="text-[11px] text-ink-muted">
                              {shortDate(reservation.arrival)} → {shortDate(reservation.departure)}
                            </p>
                          </div>
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
                          onClick={(e) => handleToggleExcludeSingle(reservation.id, e)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                            isExcluded
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={isExcluded ? 'Click to Include' : 'Click to Exclude'}
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
    </div>
  );
}