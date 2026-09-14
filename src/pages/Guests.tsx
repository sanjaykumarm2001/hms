import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AwardIcon, CreditCardIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import {
  Field,
  Modal,
  PrimaryButton,
  SearchInput,
  SecondaryButton,
  SelectInput,
  TextInput
} from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import type { GuestSegment, GuestTier } from '../types/hotel';
import { money, shortDate } from '../utils/format';

export function Guests() {
  const navigate = useNavigate();
  const { guests, reservations, folio, createGuest } = useHotel();
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<'all' | GuestTier>('all');
  const [segment, setSegment] = useState<'all' | GuestSegment>('all');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    company: string;
    tier: GuestTier;
    segment: GuestSegment;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    company: '',
    tier: 'Standard',
    segment: 'Leisure'
  });
  const [error, setError] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests
      .filter((guest) => (tier === 'all' ? true : guest.tier === tier))
      .filter((guest) => (segment === 'all' ? true : guest.segment === segment))
      .filter((guest) =>
        q
          ? [guest.firstName, guest.lastName, guest.email, guest.phone, guest.company ?? '', guest.country]
              .join(' ')
              .toLowerCase()
              .includes(q)
          : true
      )
      .map((guest) => {
        const stays = reservations.filter((r) => r.guestId === guest.id);
        const balance = stays.reduce((sum, r) => sum + Math.max(0, folio(r.id).balance), 0);
        const last = [...stays].sort((a, b) => b.arrival.localeCompare(a.arrival))[0];
        return { guest, stays: stays.length, balance, last };
      })
      .sort((a, b) => a.guest.lastName.localeCompare(b.guest.lastName));
  }, [folio, guests, query, reservations, segment, tier]);

  const vipCount = guests.filter((g) => g.tier === 'Platinum' || g.tier === 'Gold').length;
  const totalBalance = rows.reduce((acc, r) => acc + r.balance, 0);

  function submit() {
    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    const guest = createGuest(draft);
    setDraft({ firstName: '', lastName: '', email: '', phone: '', country: '', company: '', tier: 'Standard', segment: 'Leisure' });
    setError('');
    setOpen(false);
    navigate(`/guests/${guest.id}`);
  }

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
              Guest Directory
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#176938]">
              <span className="h-2 w-2 rounded-full bg-[#176938] animate-pulse" />
              LIVE GUEST DATABASE
            </span>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 font-normal">
            Searchable CRM profiles, tier status, stay history, and folio balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrimaryButton onClick={() => setOpen(true)}>
            <UserPlusIcon className="h-4 w-4" />
            <span>New Guest Profile</span>
          </PrimaryButton>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-premium rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              TOTAL PROFILES
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] shadow-xs">
              <UsersIcon className="h-5 w-5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {guests.length}
            </span>
            <span className="text-[13px] font-bold text-slate-500">registered</span>
          </div>
        </div>

        <div className="glass-card-premium rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              VIP TIERS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fef3c7] text-[#b45309] shadow-xs">
              <AwardIcon className="h-5 w-5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {vipCount}
            </span>
            <span className="text-[13px] font-bold text-slate-500">Gold & Platinum</span>
          </div>
        </div>

        <div className="glass-card-premium rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              SEARCH RESULTS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7] shadow-xs">
              <UsersIcon className="h-5 w-5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {rows.length}
            </span>
            <span className="text-[13px] font-bold text-slate-500">matching filter</span>
          </div>
        </div>

        <div className="glass-card-premium rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              OPEN BALANCE
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] shadow-xs">
              <CreditCardIcon className="h-5 w-5 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {money(totalBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Glass Table Container */}
      <div className="glass-card-premium overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200/60 bg-white/40 backdrop-blur-xs">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search guest name, email, phone, company…"
              className="w-[280px]"
            />
            <SelectInput
              value={tier}
              onChange={(e) => setTier(e.target.value as 'all' | GuestTier)}
              className="w-[140px]"
            >
              <option value="all">All Tiers</option>
              <option value="Standard">Standard</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </SelectInput>
            <SelectInput
              value={segment}
              onChange={(e) => setSegment(e.target.value as 'all' | GuestSegment)}
              className="w-[140px]"
            >
              <option value="all">All Segments</option>
              <option value="Leisure">Leisure</option>
              <option value="Corporate">Corporate</option>
              <option value="Group">Group</option>
              <option value="OTA">OTA</option>
            </SelectInput>
          </div>

          <span className="text-xs font-bold text-slate-500">
            Showing {rows.length} of {guests.length} profiles
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-xs font-semibold text-slate-500">
            No guests match your filters. Try clearing your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-[#176938]">
                  <th scope="col" className="py-3 pl-5 pr-3">Guest</th>
                  <th scope="col" className="px-3 py-3">Contact</th>
                  <th scope="col" className="px-3 py-3">Tier / Segment</th>
                  <th scope="col" className="px-3 py-3">Stays</th>
                  <th scope="col" className="px-3 py-3">Last Stay</th>
                  <th scope="col" className="px-3 py-3 pr-5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {rows.map(({ guest, stays, balance, last }) => (
                  <tr
                    key={guest.id}
                    onClick={() => navigate(`/guests/${guest.id}`)}
                    className="cursor-pointer transition-colors hover:bg-[#176938]/[0.04]"
                  >
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcfce7] text-xs font-extrabold text-[#176938] shadow-xs">
                          {guest.firstName.charAt(0)}
                          {guest.lastName.charAt(0)}
                        </span>
                        <div>
                          <span className="block text-[14px] font-bold text-slate-900 leading-tight">
                            {guest.firstName} {guest.lastName}
                          </span>
                          <span className="block text-[11px] font-medium text-slate-400 mt-0.5">
                            {guest.company || guest.country}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3.5">
                      <p className="text-[13px] font-medium text-slate-800 leading-tight">{guest.email}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{guest.phone}</p>
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-800">
                          {guest.tier}
                        </span>
                        <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200/60">
                          {guest.segment}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3.5 text-[13px] font-bold text-slate-900 tabular-nums">
                      {stays}
                    </td>

                    <td className="px-3 py-3.5 text-[12px] font-medium text-slate-500 font-mono">
                      {last ? shortDate(last.arrival) : '—'}
                    </td>

                    <td className="px-3 py-3.5 pr-5 text-right text-[13px] font-extrabold text-slate-900 tabular-nums">
                      {money(balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Guest Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Guest Profile"
        subtitle="Register new guest record in the property management system."
        footer={
          <>
            <SecondaryButton onClick={() => setOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={submit}>Create Profile</PrimaryButton>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="First Name *">
            <TextInput
              value={draft.firstName}
              onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
            />
          </Field>
          <Field label="Last Name *">
            <TextInput
              value={draft.lastName}
              onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
            />
          </Field>
          <Field label="Guest Tier">
            <SelectInput
              value={draft.tier}
              onChange={(e) => setDraft({ ...draft, tier: e.target.value as GuestTier })}
            >
              <option value="Standard">Standard</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </SelectInput>
          </Field>
          <Field label="Guest Segment">
            <SelectInput
              value={draft.segment}
              onChange={(e) => setDraft({ ...draft, segment: e.target.value as GuestSegment })}
            >
              <option value="Leisure">Leisure</option>
              <option value="Corporate">Corporate</option>
              <option value="Group">Group</option>
              <option value="OTA">OTA</option>
            </SelectInput>
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <TextInput
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            />
          </Field>
          <Field label="Country">
            <TextInput
              value={draft.country}
              onChange={(e) => setDraft({ ...draft, country: e.target.value })}
            />
          </Field>
          <Field label="Company (Optional)">
            <TextInput
              value={draft.company}
              onChange={(e) => setDraft({ ...draft, company: e.target.value })}
            />
          </Field>
        </div>
        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-bold text-[#ef4444]">
            {error}
          </p>
        )}
      </Modal>
    </div>
  );
}