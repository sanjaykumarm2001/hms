import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDoubleIcon, BellIcon, CalendarDaysIcon, ClockIcon, SearchIcon, UserIcon, ChevronsUpDownIcon } from 'lucide-react';
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
  const { guests, reservations, rooms, guestName, ops, currentUser } = useHotel();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const guestHits: Result[] = guests
      .filter((g) =>
        [g.firstName, g.lastName, g.email, g.phone, g.company ?? ''].join(' ').toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((g) => ({
        id: g.id,
        kind: 'Guest',
        title: `${g.firstName} ${g.lastName}`,
        detail: `${g.tier} · ${g.email}`,
        to: `/guests/${g.id}`
      }));

    const reservationHits: Result[] = reservations
      .filter((r) => [r.code, guestName(r.guestId), r.roomType].join(' ').toLowerCase().includes(q))
      .slice(0, 4)
      .map((r) => ({
        id: r.id,
        kind: 'Reservation',
        title: `${r.code} · ${guestName(r.guestId)}`,
        detail: `${longDate(r.arrival)} → ${longDate(r.departure)}`,
        to: `/reservations/${r.id}`,
        pill: <StatusPill tone={reservationTone[r.status]}>{reservationLabel[r.status]}</StatusPill>
      }));

    const roomHits: Result[] = rooms
      .filter((room) => [room.number, room.type, room.view].join(' ').toLowerCase().includes(q))
      .slice(0, 4)
      .map((room) => ({
        id: room.id,
        kind: 'Room',
        title: `Room ${room.number}`,
        detail: `${room.type} · Floor ${room.floor}`,
        to: `/rooms?room=${room.number}`,
        pill: (
          <StatusPill tone={roomStatusTone[ops.statusByRoom[room.id]]}>
            {roomStatusLabel[ops.statusByRoom[room.id]]}
          </StatusPill>
        )
      }));

    return [...guestHits, ...reservationHits, ...roomHits];
  }, [guestName, guests, ops.statusByRoom, query, reservations, rooms]);

  function select(result: Result) {
    setOpen(false);
    setQuery('');
    navigate(result.to);
  }

  return (
    <header className="relative z-30 flex h-[60px] shrink-0 items-center justify-between border-b border-white/80 bg-white/75 px-6 shadow-xs backdrop-blur-xl">
      {/* Search Input Bar */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[480px]"
        onBlur={(event) => {
          if (!containerRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
        }}
      >
        <label className="relative block">
          <span className="sr-only">Search guests, reservations, or rooms</span>
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />

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
            className="h-9 w-full rounded-full border border-slate-200 bg-[#f8fafc] pl-10 pr-16 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-[#176938] focus:bg-white focus:outline-none transition-all shadow-sm"
          />

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 font-mono">
            &#8984;K
          </span>
        </label>

        <AnimatePresence>
          {open && query.trim().length >= 2 ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute left-0 right-0 top-[44px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              {results.length === 0 ? (
                <p className="px-4 py-4 text-[12px] text-slate-500">
                  No guests, reservations, or rooms match “{query}”.
                </p>
              ) : (
                <ul className="max-h-[380px] overflow-y-auto py-1">
                  {results.map((result) => (
                    <li key={`${result.kind}-${result.id}`}>
                      <button
                        type="button"
                        onClick={() => select(result)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-slate-50"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          {result.kind === 'Guest' ? (
                            <UserIcon aria-hidden="true" className="h-4 w-4" />
                          ) : result.kind === 'Reservation' ? (
                            <CalendarDaysIcon aria-hidden="true" className="h-4 w-4" />
                          ) : (
                            <BedDoubleIcon aria-hidden="true" className="h-4 w-4" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-slate-800">
                            {result.title}
                          </span>
                          <span className="block truncate text-[11px] text-slate-500">
                            {result.kind} · {result.detail}
                          </span>
                        </span>
                        {result.pill}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Right Controls: Shift Badge, Alerts, User Profile */}
      <div className="flex items-center gap-4">
        {/* Time / Shift Badge */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-200/80 bg-[#e8f8ee] px-3.5 py-1.5 text-[12px] font-bold text-[#176938] shadow-sm">
          <ClockIcon className="h-4 w-4 stroke-[2.2]" />
          <span>14:28 EST</span>
          <span className="text-emerald-400">•</span>
          <span>Day Shift</span>
        </div>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setAlertsOpen((prev) => !prev)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
            aria-label={`Operational alerts, ${ops.alerts.length} active`}
            aria-expanded={alertsOpen}
          >
            <BellIcon aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef4444] ring-2 ring-white"></span>
            </span>
          </button>

          <AnimatePresence>
            {alertsOpen ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                className="absolute right-0 top-11 w-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              >
                <p className="border-b border-slate-100 px-4 py-3 text-[13px] font-bold text-slate-800">
                  Operational alerts
                </p>
                {ops.alerts.length === 0 ? (
                  <p className="px-4 py-5 text-[12px] text-slate-500">Nothing needs attention.</p>
                ) : (
                  <ul className="max-h-[320px] divide-y divide-slate-100 overflow-y-auto">
                    {ops.alerts.map((alert) => (
                      <li key={alert.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setAlertsOpen(false);
                            navigate(alert.to);
                          }}
                          className="w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  alert.level === 'critical'
                                    ? '#ef4444'
                                    : alert.level === 'warning'
                                    ? '#f59e0b'
                                    : '#3b82f6'
                              }}
                            />
                            <span className="text-[12px] font-semibold text-slate-800">{alert.title}</span>
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-500">{alert.detail}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-[#f8fafc] py-1 pl-1 pr-2.5 shadow-sm transition-all hover:bg-slate-100 cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#176938] text-[12px] font-bold text-white shadow-sm">
            AR
          </div>
          <div className="text-left leading-tight pr-1">
            <p className="text-[13px] font-bold text-slate-900 leading-none">
              {currentUser.name || 'Alex Rivera'}
            </p>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-none">
              {currentUser.role || 'Duty Manager'}
            </p>
          </div>
          <ChevronsUpDownIcon className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}