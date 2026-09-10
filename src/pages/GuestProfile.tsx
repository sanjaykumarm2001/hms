import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, FileTextIcon, PlusIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  KeyValue,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  StatusPill,
  TextArea } from
'../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { money, nightsBetween, shortDate } from '../utils/format';
import { paymentLabel, paymentTone, reservationLabel, reservationTone } from '../utils/tone';

export function GuestProfile() {
  const { guestId = '' } = useParams();
  const navigate = useNavigate();
  const { getGuest, reservations, payments, folio, getRoom, addGuestNote } = useHotel();
  const [note, setNote] = useState('');

  const guest = getGuest(guestId);

  if (!guest) {
    return (
      <Card className="p-10 text-center">
        <p className="text-[14px] font-semibold text-ink">Guest not found</p>
        <div className="mt-4 flex justify-center">
          <SecondaryButton onClick={() => navigate('/guests')}>Back to guests</SecondaryButton>
        </div>
      </Card>);

  }

  const stays = reservations.
  filter((r) => r.guestId === guest.id).
  sort((a, b) => b.arrival.localeCompare(a.arrival));
  const guestPayments = payments.filter((payment) =>
  stays.some((stay) => stay.id === payment.reservationId)
  );
  const totalSpend = stays.reduce((sum, stay) => sum + folio(stay.id).chargeTotal, 0);
  const openBalance = stays.reduce((sum, stay) => sum + Math.max(0, folio(stay.id).balance), 0);
  const totalNights = stays.
  filter((stay) => stay.status === 'checked-out' || stay.status === 'in-house').
  reduce((sum, stay) => sum + nightsBetween(stay.arrival, stay.departure), 0);

  function saveNote() {
    if (!note.trim()) return;
    addGuestNote(guest.id, note.trim());
    setNote('');
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/guests')}
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft transition-colors duration-150 hover:text-ink">
        
        <ArrowLeftIcon aria-hidden="true" className="h-3.5 w-3.5" />
        All guests
      </button>

      <PageHeader
        eyebrow="Guest profile"
        title={`${guest.firstName} ${guest.lastName}`}
        subtitle={`${guest.segment} · ${guest.country}${guest.company ? ` · ${guest.company}` : ''}`}
        badge={<StatusPill tone="green">{guest.tier}</StatusPill>} />
      

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <Card className="p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KeyValue label="Stays" value={stays.length} />
              <KeyValue label="Nights" value={totalNights} />
              <KeyValue label="Lifetime spend" value={money(totalSpend)} />
              <KeyValue label="Open balance" value={money(openBalance)} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Stay history & reservations" subtitle={`${stays.length} reservations on file`} />
            {stays.length === 0 ?
            <p className="border-t border-line px-5 py-8 text-center text-[12px] text-ink-muted">
                This guest has no reservations yet.
              </p> :

            <div className="overflow-x-auto border-t border-line">
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Reservation</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Stay</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Room</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">Folio</th>
                      <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {stays.map((stay) => {
                    const room = getRoom(stay.roomId);
                    const f = folio(stay.id);
                    return (
                      <tr key={stay.id} className="transition-colors duration-150 hover:bg-emerald-50/60">
                          <td className="py-3 pl-5 pr-3">
                            <Link
                            to={`/reservations/${stay.id}`}
                            className="tabular text-[12px] font-semibold text-ink hover:text-brand-700">
                            
                              {stay.code}
                            </Link>
                            <p className="text-[11px] text-ink-muted">{stay.source}</p>
                          </td>
                          <td className="tabular px-3 py-3 text-[12px] text-ink-soft">
                            {shortDate(stay.arrival)} → {shortDate(stay.departure)}
                          </td>
                          <td className="tabular px-3 py-3 text-[13px] font-semibold text-ink">
                            {room?.number ?? '—'}
                          </td>
                          <td className="px-3 py-3">
                            <StatusPill tone={reservationTone[stay.status]}>
                              {reservationLabel[stay.status]}
                            </StatusPill>
                          </td>
                          <td className="tabular px-3 py-3 text-[12px] text-ink-soft">
                            {money(f.chargeTotal)}
                            <span className="block text-[11px] text-ink-muted">
                              Balance {money(f.balance)}
                            </span>
                          </td>
                          <td className="px-3 py-3 pr-5 text-right">
                            <Link
                            to={`/billing/${stay.id}`}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700 hover:text-brand-800">
                            
                              <FileTextIcon aria-hidden="true" className="h-3.5 w-3.5" />
                              Open
                            </Link>
                          </td>
                        </tr>);

                  })}
                  </tbody>
                </table>
              </div>
            }
          </Card>

          <Card className="overflow-hidden">
            <CardHeader title="Payments" subtitle={`${guestPayments.length} transactions recorded`} />
            {guestPayments.length === 0 ?
            <p className="border-t border-line px-5 py-8 text-center text-[12px] text-ink-muted">
                No payments recorded for this guest.
              </p> :

            <ul className="divide-y divide-line border-t border-line">
                {guestPayments.map((payment) =>
              <li key={payment.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span>
                      <span className="block text-[13px] font-semibold text-ink">
                        {payment.kind} · {payment.method}
                      </span>
                      <span className="block text-[11px] text-ink-muted">
                        {shortDate(payment.date)} · {payment.reference}
                      </span>
                    </span>
                    <span className="tabular text-[13px] font-semibold text-ink">
                      {money(payment.amount)}
                    </span>
                  </li>
              )}
              </ul>
            }
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Internal notes</h2>
            <p className="mt-1 text-[12px] text-ink-muted">
              Notes are stored with the date and staff member, and flagged to the front office team.
            </p>
            <div className="mt-3">
              <TextArea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add an internal note about this guest…"
                aria-label="New internal note" />
              
              <div className="mt-2 flex justify-end">
                <PrimaryButton onClick={saveNote} disabled={!note.trim()}>
                  <PlusIcon aria-hidden="true" className="h-4 w-4" />
                  Save note
                </PrimaryButton>
              </div>
            </div>
            {guest.notes.length ?
            <ul className="mt-4 space-y-3 border-t border-line pt-4">
                {guest.notes.map((entry) =>
              <li key={entry.id}>
                    <p className="text-[13px] text-ink">{entry.content}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {shortDate(entry.date)} · {entry.staff}
                    </p>
                  </li>
              )}
              </ul> :

            <p className="mt-4 border-t border-line pt-4 text-[12px] text-ink-muted">
                No internal notes yet.
              </p>
            }
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Contact & identity</h2>
            <div className="mt-3 space-y-3">
              <KeyValue label="Email" value={guest.email} />
              <KeyValue label="Phone" value={guest.phone} />
              <KeyValue label="Country" value={guest.country} />
              <KeyValue label="Company" value={guest.company ?? '—'} />
              <KeyValue label="Identification" value={`${guest.idType} ${guest.idNumber || '—'}`} />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  ID status
                </p>
                <div className="mt-1">
                  <StatusPill tone={guest.idVerified ? 'green' : 'red'}>
                    {guest.idVerified ? 'Verified' : 'Not verified'}
                  </StatusPill>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Preferences</h2>
            {guest.preferences.length ?
            <ul className="mt-3 flex flex-wrap gap-2">
                {guest.preferences.map((preference) =>
              <li
                key={preference}
                className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                
                    {preference}
                  </li>
              )}
              </ul> :

            <p className="mt-3 text-[12px] text-ink-muted">No preferences recorded.</p>
            }
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Documents</h2>
            {guest.documents.length ?
            <ul className="mt-3 space-y-2">
                {guest.documents.map((document) =>
              <li
                key={document.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2.5">
                
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-ink">
                        {document.name}
                      </span>
                      <span className="block text-[11px] text-ink-muted">
                        Uploaded {shortDate(document.uploadedAt)}
                      </span>
                    </span>
                    <FileTextIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-muted" />
                  </li>
              )}
              </ul> :

            <p className="mt-3 text-[12px] text-ink-muted">No documents on file.</p>
            }
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Payment standing</h2>
            <div className="mt-3 space-y-2">
              {stays.slice(0, 4).map((stay) =>
              <div key={stay.id} className="flex items-center justify-between gap-2">
                  <span className="tabular text-[12px] text-ink-soft">{stay.code}</span>
                  <StatusPill tone={paymentTone[stay.paymentStatus]} dot={false}>
                    {paymentLabel[stay.paymentStatus]}
                  </StatusPill>
                </div>
              )}
              {stays.length === 0 ?
              <p className="text-[12px] text-ink-muted">No folios yet.</p> :
              null}
            </div>
          </Card>
        </div>
      </div>
    </div>);

}