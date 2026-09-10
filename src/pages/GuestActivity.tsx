import React, { useMemo, useState } from 'react';
import {
  CreditCardIcon,
  DoorOpenIcon,
  DownloadIcon,
  FlowerIcon,
  MousePointerClickIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  SquareArrowUpIcon,
  VideoIcon } from
'lucide-react';
import { Card, PageHeader, PrimaryButton, SecondaryButton } from '../components/ui';
import { activityEvents } from '../data/activity';
import { ActivityEvent } from '../types';

const eventIcons = {
  door: DoorOpenIcon,
  spa: FlowerIcon,
  pos: CreditCardIcon,
  elevator: SquareArrowUpIcon
};

const accessStyles: Record<ActivityEvent['access'], {chip: string;ring: string;icon: string;}> = {
  granted: { chip: 'bg-brand-50 text-brand-800', ring: 'bg-brand-50', icon: 'text-brand-700' },
  info: { chip: 'bg-[#f7f9d9] text-[#6b7112]', ring: 'bg-[#f7f9d9]', icon: 'text-[#8a9014]' },
  denied: { chip: 'bg-[#fdeceb] text-[#b3312a]', ring: 'bg-[#fdeceb]', icon: 'text-[#b3312a]' }
};

export function GuestActivity() {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const events = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activityEvents;
    return activityEvents.filter(
      (e) =>
      e.guest.toLowerCase().includes(q) ||
      e.room.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  }, [query]);

  const active = activityEvents.find((e) => e.id === activeId) ?? null;

  return (
    <div>
      <PageHeader
        title="Activity Pulse"
        subtitle="Real-time guest movements and access logs."
        actions={
        <>
            <SecondaryButton>
              <SlidersHorizontalIcon aria-hidden="true" className="h-4 w-4" />
              Filters
            </SecondaryButton>
            <PrimaryButton>
              <DownloadIcon aria-hidden="true" className="h-4 w-4" />
              Export Log
            </PrimaryButton>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <label className="relative block">
            <span className="sr-only">Filter by guest name, room number, or event type</span>
            <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by guest name, room #, or event type..."
              className="h-11 w-full rounded-card border border-line bg-white pl-10 pr-4 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none" />
            
          </label>

          <Card className="mt-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Live Feed</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                <span className="h-2 w-2 rounded-full bg-[#e0453c]" />
                Monitoring
              </span>
            </div>

            <ol className="border-t border-line px-5 py-4">
              {events.map((event, index) => {
                const Icon = eventIcons[event.icon];
                const styles = accessStyles[event.access];
                const isActive = activeId === event.id;
                return (
                  <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < events.length - 1 ?
                    <span className="absolute left-[17px] top-9 bottom-1 w-px bg-line" aria-hidden="true" /> :
                    null}
                    <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.ring}`}>
                      <Icon aria-hidden="true" className={`h-4 w-4 ${styles.icon}`} strokeWidth={1.9} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveId(event.id)}
                      className={[
                      'flex-1 rounded-lg border px-3 py-2 text-left transition-colors duration-150',
                      isActive ? 'border-brand-300 bg-brand-50' : 'border-transparent hover:bg-[#fafbf8]'].
                      join(' ')}>
                      
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-ink">{event.location}</span>
                          {event.access !== 'info' ?
                          <span className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${styles.chip}`}>
                              {event.access}
                            </span> :
                          null}
                        </span>
                        <span className="shrink-0 text-[11px] text-ink-muted">{event.time}</span>
                      </div>
                      {event.detail ? <p className="mt-1 text-[12px] text-ink-soft">{event.detail}</p> : null}
                      <p className="mt-1.5 flex items-center gap-2 text-[11.5px] text-ink-soft">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-panel text-[8.5px] font-bold text-white">
                          {event.guest.
                          split(' ').
                          map((n) => n[0]).
                          join('').
                          slice(0, 2)}
                        </span>
                        <span className="font-medium text-ink">{event.guest}</span>
                        {event.room ? <span className="text-ink-muted">· {event.room}</span> : null}
                      </p>
                    </button>
                  </li>);

              })}
            </ol>

            {events.length === 0 ?
            <p className="border-t border-line bg-brand-wash py-12 text-center text-[13px] text-ink-soft">
                No activity matches “{query}”.
              </p> :
            null}
          </Card>
        </div>

        <Card className="flex min-h-[420px] flex-col p-5">
          {active ?
          <>
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">{active.location}</h2>
              <p className="mt-1 text-[12px] text-ink-muted">{active.time}</p>

              <div className="mt-4 flex aspect-video items-center justify-center rounded-lg bg-panel">
                <span className="flex items-center gap-2 text-[11px] font-semibold text-white/60">
                  <VideoIcon aria-hidden="true" className="h-4 w-4" />
                  {active.camera}
                </span>
              </div>

              <dl className="mt-5 space-y-3 text-[12px]">
                <div className="flex justify-between gap-3 border-b border-line pb-3">
                  <dt className="text-ink-muted">Guest</dt>
                  <dd className="font-semibold text-ink">{active.guest}</dd>
                </div>
                <div className="flex justify-between gap-3 border-b border-line pb-3">
                  <dt className="text-ink-muted">Room</dt>
                  <dd className="font-semibold text-ink">{active.room || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Access</dt>
                  <dd className={`font-semibold uppercase ${accessStyles[active.access].icon}`}>{active.access}</dd>
                </div>
              </dl>

              <SecondaryButton className="mt-auto w-full">Open full audit trail</SecondaryButton>
            </> :

          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-wash">
                <MousePointerClickIcon aria-hidden="true" className="h-6 w-6 text-brand-700" strokeWidth={1.7} />
              </span>
              <p className="mt-4 text-[14px] font-semibold text-ink">Select an event</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
                Click on any activity in the timeline to view detailed logs and camera feeds.
              </p>
            </div>
          }
        </Card>
      </div>
    </div>);

}