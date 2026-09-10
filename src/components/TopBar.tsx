import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDoubleIcon, BellIcon, CalendarDaysIcon, SearchIcon, UserIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHotel } from '../contexts/HotelContext';
import { StatusPill } from './ui';
import { reservationLabel, reservationTone, roomStatusLabel, roomStatusTone } from '../utils/tone';
import { longDate } from '../utils/format';

interface Result {
  id: string;
  kind: 'Guest' | 'Reservation' | 'Room';
  title: string;
  detail: string;
  to: string;
  pill?: React.ReactNode;
}

export function TopBar() {
  const navigate = useNavigate();
  const { guests, reservations, rooms, guestName, ops, currentUser, settings } = useHotel();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const guestHits: Result[] = guests.
    filter((g) =>
    [g.firstName, g.lastName, g.email, g.phone, g.company ?? ''].
    join(' ').
    toLowerCase().
    includes(q)
    ).
    slice(0, 4).
    map((g) => ({
      id: g.id,
      kind: 'Guest',
      title: `${g.firstName} ${g.lastName}`,
      detail: `${g.tier} · ${g.email}`,
      to: `/guests/${g.id}`
    }));

    const reservationHits: Result[] = reservations.
    filter((r) =>
    [r.code, guestName(r.guestId), r.roomType].join(' ').toLowerCase().includes(q)
    ).
    slice(0, 4).
    map((r) => ({
      id: r.id,
      kind: 'Reservation',
      title: `${r.code} · ${guestName(r.guestId)}`,
      detail: `${longDate(r.arrival)} → ${longDate(r.departure)}`,
      to: `/reservations/${r.id}`,
      pill: <StatusPill tone={reservationTone[r.status]}>{reservationLabel[r.status]}</StatusPill>
    }));

    const roomHits: Result[] = rooms.
    filter((room) => [room.number, room.type, room.view].join(' ').toLowerCase().includes(q)).
    slice(0, 4).
    map((room) => ({
      id: room.id,
      kind: 'Room',
      title: `Room ${room.number}`,
      detail: `${room.type} · Floor ${room.floor}`,
      to: `/rooms?room=${room.number}`,
      pill:
      <StatusPill tone={roomStatusTone[ops.statusByRoom[room.id]]}>
            {roomStatusLabel[ops.statusByRoom[room.id]]}
          </StatusPill>

    }));

    return [...guestHits, ...reservationHits, ...roomHits];
  }, [guestName, guests, ops.statusByRoom, query, reservations, rooms]);

  function select(result: Result) {
    setOpen(false);
    setQuery('');
    navigate(result.to);
  }

  const criticalCount = ops.alerts.filter((a) => a.level !== 'info').length;

  return (
    <header className="relative z-30 flex h-[68px] shrink-0 items-center gap-6 border-b border-line bg-white px-6">
      <div
        ref={containerRef}
        className="relative w-full max-w-[460px]"
        onBlur={(event) => {
          if (!containerRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
        }}>
        
        <label className="relative block">
          <span className="sr-only">Search guests, reservations, or rooms</span>
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpen(false);
              if (event.key === 'Enter' && results.length) select(results[0]);
            }}
            placeholder="Search guests, reservations, or room numbers..."
            className="h-10 w-full rounded-full border border-transparent bg-[#f1f3ee] pl-10 pr-4 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-300 focus:bg-white focus:outline-none" />
          
        </label>

        <AnimatePresence>
          {open && query.trim().length >= 2 ?
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 right-0 top-[46px] overflow-hidden rounded-card border border-line bg-white shadow-panel">
            
              {results.length === 0 ?
            <p className="px-4 py-5 text-[12px] text-ink-muted">
                  No guests, reservations, or rooms match “{query}”.
                </p> :

            <ul className="max-h-[380px] overflow-y-auto py-1">
                  {results.map((result) =>
              <li key={`${result.kind}-${result.id}`}>
                      <button
                  type="button"
                  onClick={() => select(result)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-[#fafbf8]">
                  
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-ink-soft">
                          {result.kind === 'Guest' ?
                    <UserIcon aria-hidden="true" className="h-4 w-4" /> :
                    result.kind === 'Reservation' ?
                    <CalendarDaysIcon aria-hidden="true" className="h-4 w-4" /> :

                    <BedDoubleIcon aria-hidden="true" className="h-4 w-4" />
                    }
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-ink">
                            {result.title}
                          </span>
                          <span className="block truncate text-[11px] text-ink-muted">
                            {result.kind} · {result.detail}
                          </span>
                        </span>
                        {result.pill}
                      </button>
                    </li>
              )}
                </ul>
            }
            </motion.div> :
          null}
        </AnimatePresence>
      </div>

      <div className="ml-auto flex items-center gap-5">
        <p className="hidden text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft lg:block">
          {longDate(ops.today)} · Check-in {settings.checkInTime}
        </p>

        <div className="relative">
          <button
            type="button"
            onClick={() => setAlertsOpen((prev) => !prev)}
            className="relative rounded-full p-2 text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink"
            aria-label={`Operational alerts, ${ops.alerts.length} active`}
            aria-expanded={alertsOpen}>
            
            <BellIcon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.9} />
            {criticalCount > 0 ?
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e0453c] ring-2 ring-white" /> :
            null}
          </button>

          <AnimatePresence>
            {alertsOpen ?
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-11 w-[320px] overflow-hidden rounded-card border border-line bg-white shadow-panel">
              
                <p className="border-b border-line px-4 py-3 text-[12px] font-semibold text-ink">
                  Operational alerts
                </p>
                {ops.alerts.length === 0 ?
              <p className="px-4 py-5 text-[12px] text-ink-muted">Nothing needs attention.</p> :

              <ul className="max-h-[320px] divide-y divide-line overflow-y-auto">
                    {ops.alerts.map((alert) =>
                <li key={alert.id}>
                        <button
                    type="button"
                    onClick={() => {
                      setAlertsOpen(false);
                      navigate(alert.to);
                    }}
                    className="w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-[#fafbf8]">
                    
                          <span className="flex items-center gap-2">
                            <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                          alert.level === 'critical' ?
                          '#e0453c' :
                          alert.level === 'warning' ?
                          '#f0a72a' :
                          '#2f74e0'
                        }} />
                      
                            <span className="text-[12px] font-semibold text-ink">{alert.title}</span>
                          </span>
                          <span className="mt-1 block text-[11px] text-ink-muted">{alert.detail}</span>
                        </button>
                      </li>
                )}
                  </ul>
              }
              </motion.div> :
            null}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 border-l border-line pl-5">
          <div className="text-right leading-tight">
            <p className="text-[13px] font-semibold text-ink">{currentUser.name}</p>
            <p className="text-[11px] text-ink-muted">{currentUser.role}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-[12px] font-bold text-brand-800 ring-2 ring-brand-100">
            AR
          </span>
        </div>
      </div>
    </header>);

}