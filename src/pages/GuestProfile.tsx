import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, FileTextIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Avatar } from '../components/ui/Avatar';
import { Badge, PaymentBadge, ReservationBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Field';
import { money, shortDate, timeAgo, titleize } from '../utils/format';
import { roomTypeName } from '../data/property';

export function GuestProfile() {
  const { id = '' } = useParams();
  const { guestById, reservations, folio, roomById, addGuestNote, payments } =
  useHotel();
  const [note, setNote] = useState('');
  const guest = guestById(id);

  if (!guest) {
    return (
      <Page>
        <PageHeader title="Guest not found" />
        <Link to="/guests">
          <Button variant="primary">Back to directory</Button>
        </Link>
      </Page>);

  }

  const guestReservations = reservations.filter((r) => r.guestId === guest.id);
  const guestPayments = payments.filter((p) =>
  guestReservations.some((r) => r.id === p.reservationId)
  );
  const lifetime = guestReservations.reduce(
    (sum, r) => sum + folio(r.id).chargeTotal,
    0
  );

  return (
    <Page>
      <Link
        to="/guests"
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-muted transition-colors duration-150 ease-out hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" /> Guest directory
      </Link>

      <PageHeader
        eyebrow="Guest profile"
        title={`${guest.firstName} ${guest.lastName}`}
        subtitle={`${titleize(guest.tier)} tier · ${titleize(guest.segment)} · ${guest.country}`}
        actions={
        <>
            {guest.tier === 'vip' && <Badge tone="violet">VIP</Badge>}
            <Badge tone="neutral">{guestReservations.length} reservations</Badge>
          </>
        } />
      

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar
                firstName={guest.firstName}
                lastName={guest.lastName}
                size="lg" />
              
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink">
                  {guest.firstName} {guest.lastName}
                </p>
                <p className="text-[12px] text-ink-muted">
                  {guest.stays} lifetime stays · {money(lifetime)} spend
                </p>
              </div>
            </div>
            <dl className="mt-4 space-y-2.5 border-t border-line pt-4">
              {[
              { label: 'Email', value: guest.email },
              { label: 'Phone', value: guest.phone },
              { label: 'Country', value: guest.country },
              {
                label: 'ID document',
                value: guest.idNumber ?
                `${guest.idType} · ${guest.idNumber}` :
                'Not captured'
              }].
              map((row) =>
              <div key={row.label} className="flex justify-between gap-3">
                  <dt className="text-[12px] text-ink-faint">{row.label}</dt>
                  <dd className="truncate text-[12px] font-medium text-ink">
                    {row.value}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card title="Preferences">
            {guest.preferences.length === 0 ?
            <p className="text-[13px] text-ink-muted">No preferences recorded.</p> :

            <div className="flex flex-wrap gap-1.5">
                {guest.preferences.map((p) =>
              <Badge key={p} tone="blue">
                    {p}
                  </Badge>
              )}
              </div>
            }
          </Card>

          <Card title="Documents">
            {guest.idNumber ?
            <ul className="space-y-2">
                <li className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5">
                  <FileTextIcon className="h-4 w-4 text-ink-faint" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">
                      {guest.idType}
                    </span>
                    <span className="block text-[11px] text-ink-faint">
                      {guest.idNumber}
                    </span>
                  </span>
                  <Badge tone="green">On file</Badge>
                </li>
              </ul> :

            <EmptyState
              icon={FileTextIcon}
              title="No documents on file"
              detail="ID is captured during check-in." />

            }
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card title="Stay history" padded={false}>
            {guestReservations.length === 0 ?
            <EmptyState icon={FileTextIcon} title="No reservations yet" /> :

            <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                    <th className="px-4 py-2">Confirmation</th>
                    <th className="px-2 py-2">Stay</th>
                    <th className="px-2 py-2">Room</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Folio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {guestReservations.map((res) => {
                  const f = folio(res.id);
                  const room = roomById(res.roomId);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5">
                          <Link
                          to={`/bookings/${res.id}`}
                          className="tabular text-[13px] font-medium text-brand-600">
                          
                            #{res.confirmation}
                          </Link>
                        </td>
                        <td className="px-2 py-2.5 text-[12px] text-ink-muted">
                          {shortDate(res.arrival)} – {shortDate(res.departure)}
                        </td>
                        <td className="px-2 py-2.5 text-[12px] text-ink">
                          {room ? `${room.number} · ` : ''}
                          {roomTypeName(res.roomType)}
                        </td>
                        <td className="px-2 py-2.5">
                          <ReservationBadge status={res.status} />
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <p className="tabular text-[13px] font-semibold text-ink">
                            {money(f.chargeTotal)}
                          </p>
                          <span className="mt-1 inline-block">
                            <PaymentBadge status={res.paymentStatus} />
                          </span>
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            }
          </Card>

          <Card title="Payments" padded={false}>
            {guestPayments.length === 0 ?
            <EmptyState icon={FileTextIcon} title="No payments recorded" /> :

            <ul className="divide-y divide-line">
                {guestPayments.map((p) =>
              <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                    <Badge tone={p.kind === 'refund' ? 'red' : 'green'}>
                      {titleize(p.kind)}
                    </Badge>
                    <span className="flex-1 text-[13px] text-ink">
                      {titleize(p.method)}
                    </span>
                    <span className="text-[11px] text-ink-faint">
                      {timeAgo(p.at)}
                    </span>
                    <span className="tabular text-[13px] font-semibold text-ink">
                      {money(p.amount)}
                    </span>
                  </li>
              )}
              </ul>
            }
          </Card>

          <Card title="Internal notes">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Visible to front office staff only…" />
            
            <div className="mt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={() => {
                  if (!note.trim()) {
                    toast.error('Write a note before saving');
                    return;
                  }
                  addGuestNote(guest.id, note.trim());
                  setNote('');
                }}>
                
                Save note
              </Button>
            </div>
            {guest.notes.length > 0 &&
            <ul className="mt-4 space-y-2.5 border-t border-line pt-4">
                {guest.notes.map((n) =>
              <li key={n.id} className="rounded-lg bg-slate-50 px-3 py-2.5">
                    <p className="text-[13px] text-ink">{n.text}</p>
                    <p className="mt-0.5 text-[11px] text-ink-faint">
                      {n.by} · {timeAgo(n.at)}
                    </p>
                  </li>
              )}
              </ul>
            }
          </Card>
        </div>
      </div>
    </Page>);

}