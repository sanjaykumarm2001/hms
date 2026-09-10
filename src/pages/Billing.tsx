import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReceiptTextIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Badge, PaymentBadge } from '../components/ui/Badge';
import { money, shortDate } from '../utils/format';
import { roomTypeName } from '../data/property';

type Ledger = 'all' | 'open' | 'settled' | 'outstanding';

export function Billing() {
  const { reservations, guestById, roomById, folio, ops } = useHotel();
  const [ledger, setLedger] = useState<Ledger>('all');

  const rows = useMemo(
    () =>
    reservations.
    filter((r) => r.status !== 'cancelled').
    map((res) => ({ res, f: folio(res.id) })).
    filter(({ res, f }) => {
      if (ledger === 'open') return res.status === 'in_house';
      if (ledger === 'settled') return f.balance <= 1 && f.chargeTotal > 0;
      if (ledger === 'outstanding') return f.balance > 1;
      return true;
    }),
    [reservations, folio, ledger]
  );

  const tabs: {id: Ledger;label: string;}[] = [
  { id: 'all', label: 'All folios' },
  { id: 'open', label: 'Open folios' },
  { id: 'outstanding', label: 'Outstanding' },
  { id: 'settled', label: 'Settled' }];


  return (
    <Page>
      <PageHeader
        eyebrow="Finance"
        title="Billing & Folios"
        subtitle={`${money(ops.totalOutstanding)} outstanding across ${ops.outstanding.length} folios · ${money(ops.revenueToday)} collected today`} />
      

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <div className="inline-flex rounded-lg border border-line bg-slate-50 p-0.5">
            {tabs.map((t) =>
            <button
              key={t.id}
              type="button"
              onClick={() => setLedger(t.id)}
              className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out ${
              ledger === t.id ?
              'bg-white text-ink shadow-card' :
              'text-ink-muted hover:text-ink'}`
              }>
              
                {t.label}
              </button>
            )}
          </div>
          <p className="ml-auto text-[12px] text-ink-muted">
            {rows.length} folio{rows.length === 1 ? '' : 's'}
          </p>
        </div>

        {rows.length === 0 ?
        <EmptyState icon={ReceiptTextIcon} title="No folios in this ledger" /> :

        <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  <th className="px-4 py-2.5">Folio</th>
                  <th className="px-2 py-2.5">Guest</th>
                  <th className="px-2 py-2.5">Room</th>
                  <th className="px-2 py-2.5">Stay</th>
                  <th className="px-2 py-2.5">Status</th>
                  <th className="px-2 py-2.5 text-right">Charges</th>
                  <th className="px-2 py-2.5 text-right">Paid</th>
                  <th className="px-4 py-2.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ res, f }) => {
                const guest = guestById(res.guestId);
                const room = roomById(res.roomId);
                return (
                  <tr
                    key={res.id}
                    className="transition-colors duration-150 ease-out hover:bg-slate-50">
                    
                      <td className="px-4 py-3">
                        <Link
                        to={`/billing/${res.id}`}
                        className="tabular text-[13px] font-semibold text-brand-600">
                        
                          #{res.confirmation}
                        </Link>
                      </td>
                      <td className="px-2 py-3 text-[13px] text-ink">
                        {guest ? `${guest.firstName} ${guest.lastName}` : '—'}
                      </td>
                      <td className="px-2 py-3 text-[12px] text-ink-muted">
                        {room ? `${room.number} · ` : '— · '}
                        {roomTypeName(res.roomType)}
                      </td>
                      <td className="px-2 py-3 text-[12px] text-ink-muted">
                        {shortDate(res.arrival)} – {shortDate(res.departure)}
                      </td>
                      <td className="px-2 py-3">
                        {res.status === 'checked_out' && f.balance > 1 ?
                      <Badge tone="red">Overdue</Badge> :

                      <PaymentBadge status={res.paymentStatus} />
                      }
                      </td>
                      <td className="tabular px-2 py-3 text-right text-[13px] text-ink">
                        {money(f.chargeTotal)}
                      </td>
                      <td className="tabular px-2 py-3 text-right text-[13px] text-emerald-700">
                        {money(f.paidTotal)}
                      </td>
                      <td
                      className={`tabular px-4 py-3 text-right text-[13px] font-semibold ${
                      f.balance > 1 ? 'text-red-600' : 'text-ink'}`
                      }>
                      
                        {money(f.balance)}
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </Card>
    </Page>);

}