import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlusIcon } from 'lucide-react';
import {
  Card,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  SelectInput,
  StatusPill,
  TextInput } from
'../components/ui';
import { useHotel } from '../contexts/HotelContext';
import type { GuestSegment, GuestTier } from '../types/hotel';
import { money, shortDate } from '../utils/format';

const TIER_TONE: Record<GuestTier, 'gray' | 'blue' | 'citrus' | 'green'> = {
  Standard: 'gray',
  Silver: 'blue',
  Gold: 'citrus',
  Platinum: 'green'
};

export function Guests() {
  const navigate = useNavigate();
  const { guests, reservations, folio, createGuest } = useHotel();
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<'all' | GuestTier>('all');
  const [segment, setSegment] = useState<'all' | GuestSegment>('all');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    company: ''
  });
  const [error, setError] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.
    filter((guest) => tier === 'all' ? true : guest.tier === tier).
    filter((guest) => segment === 'all' ? true : guest.segment === segment).
    filter((guest) =>
    q ?
    [guest.firstName, guest.lastName, guest.email, guest.phone, guest.company ?? '', guest.country].
    join(' ').
    toLowerCase().
    includes(q) :
    true
    ).
    map((guest) => {
      const stays = reservations.filter((r) => r.guestId === guest.id);
      const balance = stays.reduce((sum, r) => sum + Math.max(0, folio(r.id).balance), 0);
      const last = [...stays].sort((a, b) => b.arrival.localeCompare(a.arrival))[0];
      return { guest, stays: stays.length, balance, last };
    }).
    sort((a, b) => a.guest.lastName.localeCompare(b.guest.lastName));
  }, [folio, guests, query, reservations, segment, tier]);

  function submit() {
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    const guest = createGuest(draft);
    setDraft({ firstName: '', lastName: '', email: '', phone: '', country: '', company: '' });
    setError('');
    setOpen(false);
    navigate(`/guests/${guest.id}`);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Guest database"
        title="Guests"
        subtitle={`${guests.length} guest profiles · searchable across the property`}
        actions={
        <PrimaryButton gradient onClick={() => setOpen(true)}>
            <UserPlusIcon aria-hidden="true" className="h-4 w-4" />
            New guest
          </PrimaryButton>
        } />
      

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name, email, phone, company…"
          className="w-[280px]" />
        
        <SelectInput
          value={tier}
          onChange={(event) => setTier(event.target.value as 'all' | GuestTier)}
          className="w-[150px]"
          aria-label="Filter by tier">
          
          <option value="all">All tiers</option>
          {(['Standard', 'Silver', 'Gold', 'Platinum'] as GuestTier[]).map((value) =>
          <option key={value} value={value}>
              {value}
            </option>
          )}
        </SelectInput>
        <SelectInput
          value={segment}
          onChange={(event) => setSegment(event.target.value as 'all' | GuestSegment)}
          className="w-[150px]"
          aria-label="Filter by segment">
          
          <option value="all">All segments</option>
          {(['Leisure', 'Corporate', 'Group', 'OTA'] as GuestSegment[]).map((value) =>
          <option key={value} value={value}>
              {value}
            </option>
          )}
        </SelectInput>
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ?
        <EmptyState title="No guests match" detail="Try a different search term or clear the filters." /> :

        <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Guest</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Contact</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Tier</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Segment</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Stays</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Last stay</th>
                  <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ guest, stays, balance, last }) =>
              <tr
                key={guest.id}
                onClick={() => navigate(`/guests/${guest.id}`)}
                className="cursor-pointer transition-colors duration-150 hover:bg-[#fafbf8]">
                
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800">
                          {guest.firstName.charAt(0)}
                          {guest.lastName.charAt(0)}
                        </span>
                        <span>
                          <span className="block text-[13px] font-semibold text-ink">
                            {guest.firstName} {guest.lastName}
                          </span>
                          <span className="block text-[11px] text-ink-muted">
                            {guest.company ?? guest.country}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[12px] text-ink-soft">{guest.email}</p>
                      <p className="text-[11px] text-ink-muted">{guest.phone}</p>
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill tone={TIER_TONE[guest.tier]} dot={false}>
                        {guest.tier}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-ink-soft">{guest.segment}</td>
                    <td className="tabular px-3 py-3 text-[13px] font-semibold text-ink">{stays}</td>
                    <td className="tabular px-3 py-3 text-[12px] text-ink-soft">
                      {last ? shortDate(last.arrival) : '—'}
                    </td>
                    <td className="tabular px-3 py-3 pr-5 text-right text-[13px] font-semibold text-ink">
                      {money(balance)}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create guest profile"
        subtitle="Guest records can be attached to reservations, folios and invoices."
        footer={
        <>
            <SecondaryButton onClick={() => setOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={submit}>Create guest</PrimaryButton>
          </>
        }>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="First name">
            <TextInput
              value={draft.firstName}
              onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} />
            
          </Field>
          <Field label="Last name">
            <TextInput
              value={draft.lastName}
              onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} />
            
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={draft.email}
              onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
            
          </Field>
          <Field label="Phone">
            <TextInput
              value={draft.phone}
              onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
            
          </Field>
          <Field label="Country">
            <TextInput
              value={draft.country}
              onChange={(event) => setDraft({ ...draft, country: event.target.value })} />
            
          </Field>
          <Field label="Company (optional)">
            <TextInput
              value={draft.company}
              onChange={(event) => setDraft({ ...draft, company: event.target.value })} />
            
          </Field>
        </div>
        {error ?
        <p role="alert" className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-[12px] font-semibold text-[#b3312a]">
            {error}
          </p> :
        null}
      </Modal>
    </div>);

}