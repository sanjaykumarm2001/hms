import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, UsersIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Field';
import { titleize } from '../utils/format';
import type { GuestSegment, GuestTier } from '../types';

export function Guests() {
  const { guests, reservations } = useHotel();
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<'all' | GuestTier>('all');
  const [segment, setSegment] = useState<'all' | GuestSegment>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (tier !== 'all' && g.tier !== tier) return false;
      if (segment !== 'all' && g.segment !== segment) return false;
      if (
      q &&
      !`${g.firstName} ${g.lastName} ${g.email} ${g.phone} ${g.country}`.
      toLowerCase().
      includes(q))

      return false;
      return true;
    });
  }, [guests, query, tier, segment]);

  return (
    <Page>
      <PageHeader
        eyebrow="CRM"
        title="Guest Directory"
        subtitle={`${guests.length} profiles · ${guests.filter((g) => g.tier === 'vip').length} VIP`} />
      

      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <Select
            value={tier}
            onChange={(e) => setTier(e.target.value as GuestTier | 'all')}
            aria-label="Filter by tier"
            className="w-auto">
            
            <option value="all">All tiers</option>
            <option value="vip">VIP</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="standard">Standard</option>
          </Select>
          <Select
            value={segment}
            onChange={(e) => setSegment(e.target.value as GuestSegment | 'all')}
            aria-label="Filter by segment"
            className="w-auto">
            
            <option value="all">All segments</option>
            <option value="leisure">Leisure</option>
            <option value="corporate">Corporate</option>
            <option value="group">Group</option>
            <option value="ota">OTA</option>
          </Select>
          <div className="relative ml-auto w-full max-w-[280px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guests…"
              aria-label="Search guests"
              className="h-9 w-full rounded-lg border border-line bg-white pl-8 pr-3 text-[13px] focus:border-brand-500 focus:outline-none" />
            
          </div>
        </div>

        {filtered.length === 0 ?
        <EmptyState icon={UsersIcon} title="No guests match this search" /> :

        <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                <th className="px-4 py-2.5">Guest</th>
                <th className="px-2 py-2.5">Contact</th>
                <th className="px-2 py-2.5">Country</th>
                <th className="px-2 py-2.5">Tier</th>
                <th className="px-2 py-2.5">Segment</th>
                <th className="px-4 py-2.5 text-right">Stays</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((guest) => {
              const count = reservations.filter(
                (r) => r.guestId === guest.id && r.status !== 'cancelled'
              ).length;
              return (
                <tr
                  key={guest.id}
                  className="transition-colors duration-150 ease-out hover:bg-slate-50">
                  
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                        firstName={guest.firstName}
                        lastName={guest.lastName}
                        size="sm" />
                      
                        <Link
                        to={`/guests/${guest.id}`}
                        className="text-[13px] font-semibold text-ink hover:text-brand-600">
                        
                          {guest.firstName} {guest.lastName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <p className="text-[12px] text-ink">{guest.email}</p>
                      <p className="text-[11px] text-ink-faint">{guest.phone}</p>
                    </td>
                    <td className="px-2 py-3 text-[12px] text-ink-muted">
                      {guest.country}
                    </td>
                    <td className="px-2 py-3">
                      <Badge tone={guest.tier === 'vip' ? 'violet' : 'neutral'}>
                        {titleize(guest.tier)}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 text-[12px] text-ink-muted">
                      {titleize(guest.segment)}
                    </td>
                    <td className="tabular px-4 py-3 text-right text-[13px] font-semibold text-ink">
                      {count || guest.stays}
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
        }
      </Card>
    </Page>);

}