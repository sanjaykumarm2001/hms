import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CreditCardIcon,
  DoorClosedIcon,
  DownloadIcon,
  FingerprintIcon,
  SearchIcon,
  ShieldAlertIcon,
  SparklesIcon } from
'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { clockTime, timeAgo } from '../utils/format';
import type { ActivityKind } from '../types';

const kindIcon: Record<ActivityKind, React.ElementType> = {
  door: DoorClosedIcon,
  amenity: SparklesIcon,
  pos: CreditCardIcon,
  security: ShieldAlertIcon
};

const kindTint: Record<ActivityKind, string> = {
  door: 'bg-emerald-50 text-emerald-600',
  amenity: 'bg-brand-50 text-brand-600',
  pos: 'bg-amber-50 text-amber-600',
  security: 'bg-red-50 text-red-600'
};

export function GuestActivity() {
  const { activity, guestById } = useHotel();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | ActivityKind>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activity.filter((event) => {
      if (kind !== 'all' && event.kind !== kind) return false;
      if (!q) return true;
      const guest = event.guestId ? guestById(event.guestId) : undefined;
      return `${event.title} ${event.location} ${event.roomNumber ?? ''} ${guest?.firstName ?? ''} ${guest?.lastName ?? ''}`.
      toLowerCase().
      includes(q);
    });
  }, [activity, kind, query, guestById]);

  const selected = activity.find((e) => e.id === selectedId) ?? null;
  const selectedGuest = selected?.guestId ? guestById(selected.guestId) : undefined;

  const filters: {id: 'all' | ActivityKind;label: string;}[] = [
  { id: 'all', label: 'All events' },
  { id: 'door', label: 'Door access' },
  { id: 'amenity', label: 'Amenities' },
  { id: 'pos', label: 'Folio charges' },
  { id: 'security', label: 'Security' }];


  return (
    <Page>
      <PageHeader
        eyebrow="Security & access"
        title="Activity Pulse"
        subtitle="Real-time guest movements and access logs."
        actions={
        <Button
          onClick={() => toast.success(`Exported ${filtered.length} log entries`)}>
          
            <DownloadIcon className="h-4 w-4" /> Export log
          </Button>
        } />
      

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-line bg-slate-50 p-0.5">
          {filters.map((f) =>
          <button
            key={f.id}
            type="button"
            onClick={() => setKind(f.id)}
            className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out ${
            kind === f.id ?
            'bg-white text-ink shadow-card' :
            'text-ink-muted hover:text-ink'}`
            }>
            
              {f.label}
            </button>
          )}
        </div>
        <div className="relative ml-auto w-full max-w-[320px]">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by guest name, room #, or event type…"
            aria-label="Filter activity"
            className="h-9 w-full rounded-lg border border-line bg-white pl-8 pr-3 text-[13px] focus:border-brand-500 focus:outline-none" />
          
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card
          title="Live feed"
          padded={false}
          action={
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Monitoring
            </span>
          }>
          
          {filtered.length === 0 ?
          <EmptyState icon={FingerprintIcon} title="No events match this filter" /> :

          <ul className="divide-y divide-line">
              {filtered.map((event) => {
              const Icon = kindIcon[event.kind];
              const guest = event.guestId ? guestById(event.guestId) : undefined;
              const active = selectedId === event.id;
              return (
                <li key={event.id}>
                    <button
                    type="button"
                    onClick={() => setSelectedId(event.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 ease-out ${
                    active ? 'bg-brand-50' : 'hover:bg-slate-50'}`
                    }>
                    
                      <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${kindTint[event.kind]}`}>
                      
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-ink">
                            {event.title}
                          </span>
                          {event.result !== 'info' &&
                        <Badge tone={event.result === 'granted' ? 'green' : 'red'}>
                              {event.result === 'granted' ? 'Granted' : 'Denied'}
                            </Badge>
                        }
                        </span>
                        <span className="mt-1 flex items-center gap-2">
                          {guest ?
                        <>
                              <Avatar
                            firstName={guest.firstName}
                            lastName={guest.lastName}
                            size="sm" />
                          
                              <span className="text-[12px] text-ink-muted">
                                {guest.firstName} {guest.lastName}
                                {event.roomNumber && ` · Room ${event.roomNumber}`}
                              </span>
                            </> :

                        <span className="text-[12px] text-ink-muted">
                              {event.detail}
                            </span>
                        }
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] text-ink-faint">
                        {timeAgo(event.at)}
                      </span>
                    </button>
                  </li>);

            })}
            </ul>
          }
        </Card>

        <aside>
          {selected ?
          <Card title="Event detail">
              <div className="flex items-center gap-2">
                <Badge
                tone={
                selected.result === 'granted' ?
                'green' :
                selected.result === 'denied' ?
                'red' :
                'neutral'
                }>
                
                  {selected.result === 'info' ? 'Logged' : selected.result}
                </Badge>
                <span className="text-[11px] text-ink-faint">
                  {clockTime(selected.at)} · {timeAgo(selected.at)}
                </span>
              </div>
              <p className="mt-3 text-[15px] font-semibold text-ink">
                {selected.title}
              </p>
              <p className="text-[12px] text-ink-muted">{selected.location}</p>
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-[13px] text-ink">
                {selected.detail}
              </p>
              {selectedGuest ?
            <div className="mt-4 border-t border-line pt-4">
                  <p className="text-[11px] font-medium text-ink-faint">Guest</p>
                  <div className="mt-1.5 flex items-center gap-2.5">
                    <Avatar
                  firstName={selectedGuest.firstName}
                  lastName={selectedGuest.lastName} />
                
                    <div className="min-w-0">
                      <Link
                    to={`/guests/${selectedGuest.id}`}
                    className="block truncate text-[13px] font-medium text-ink hover:text-brand-600">
                    
                        {selectedGuest.firstName} {selectedGuest.lastName}
                      </Link>
                      <p className="text-[11px] text-ink-faint">
                        {selected.roomNumber ?
                    `Room ${selected.roomNumber}` :
                    'No room linked'}
                      </p>
                    </div>
                  </div>
                </div> :

            <p className="mt-4 border-t border-line pt-4 text-[12px] text-ink-muted">
                  No guest profile linked to this event.
                </p>
            }
            </Card> :

          <Card>
              <EmptyState
              icon={FingerprintIcon}
              title="Select an event"
              detail="Click any activity in the timeline to view detailed logs and camera feeds." />
            
            </Card>
          }
        </aside>
      </div>
    </Page>);

}