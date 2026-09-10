import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  SearchInput,
  StatusPill,
  Tabs } from
'../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { money, shortDate } from '../utils/format';
import { paymentLabel, paymentTone, reservationLabel, reservationTone } from '../utils/tone';

type Ledger = 'open' | 'outstanding' | 'settled' | 'all';

export function Billing() {
  const navigate = useNavigate();
  const { reservations, folio, guestName, getRoom, ops } = useHotel();
  const [ledger, setLedger] = useState<Ledger>('open');
  const [query, setQuery] = useState('');

  const folios = useMemo(
    () =>
    reservations.
    filter((r) => r.status !== 'cancelled').
    map((reservation) => ({ reservation, folio: folio(reservation.id) })).
    filter((row) => row.folio.charges.length > 0 || row.folio.payments.length > 0),
    [folio, reservations]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return folios.
    filter((row) => {
      if (ledger === 'open') return row.reservation.status === 'in-house';
      if (ledger === 'outstanding') return row.folio.balance > 0.5;
      if (ledger === 'settled') return row.folio.balance <= 0.5;
      return true;
    }).
    filter((row) =>
    q ?
    [row.reservation.code, guestName(row.reservation.guestId)].join(' ').toLowerCase().includes(q) :
    true
    ).
    sort((a, b) => b.folio.balance - a.folio.balance);
  }, [folios, guestName, ledger, query]);

  const counts = {
    open: folios.filter((row) => row.reservation.status === 'in-house').length,
    outstanding: folios.filter((row) => row.folio.balance > 0.5).length,
    settled: folios.filter((row) => row.folio.balance <= 0.5).length,
    all: folios.length
  };

  const totals = rows.reduce(
    (acc, row) => {
      acc.charges += row.folio.chargeTotal;
      acc.paid += row.folio.paidTotal;
      acc.balance += row.folio.balance;
      return acc;
    },
    { charges: 0, paid: 0, balance: 0 }
  );

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title="Billing"
        subtitle={`${money(ops.outstandingTotal)} outstanding across ${ops.outstanding.length} folios`} />
      

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
          { id: 'open', label: 'Open folios', count: counts.open },
          { id: 'outstanding', label: 'Outstanding', count: counts.outstanding },
          { id: 'settled', label: 'Settled', count: counts.settled },
          { id: 'all', label: 'All folios', count: counts.all }]
          }
          active={ledger}
          onChange={(next) => setLedger(next as Ledger)} />
        
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search guest or reservation code…"
          className="w-[260px]" />
        
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
        { label: 'Charges in view', value: money(totals.charges) },
        { label: 'Payments in view', value: money(totals.paid) },
        { label: 'Balance in view', value: money(totals.balance) }].
        map((item) =>
        <Card key={item.label} className="p-4">
            <p className="text-[12px] font-semibold text-ink-soft">{item.label}</p>
            <p className="tabular mt-2 text-[24px] font-bold leading-none text-ink">{item.value}</p>
          </Card>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Folio ledger" subtitle={`${rows.length} folios in this view`} />
        {rows.length === 0 ?
        <EmptyState title="No folios" detail="Nothing matches this ledger filter." /> :

        <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Guest</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Reservation</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Room</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Charges</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Paid</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Folio</th>
                  <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ reservation, folio: f }) =>
              <tr
                key={reservation.id}
                onClick={() => navigate(`/billing/${reservation.id}`)}
                className="cursor-pointer transition-colors duration-150 hover:bg-[#fafbf8]">
                
                    <td className="py-3 pl-5 pr-3">
                      <p className="text-[13px] font-semibold text-ink">
                        {guestName(reservation.guestId)}
                      </p>
                      <p className="text-[11px] text-ink-muted">
                        {shortDate(reservation.arrival)} → {shortDate(reservation.departure)}
                      </p>
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
                    <td className="tabular px-3 py-3 pr-5 text-right text-[13px] font-bold text-ink">
                      {money(f.balance)}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </Card>
    </div>);

}