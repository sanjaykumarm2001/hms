import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BedDoubleIcon, ReceiptTextIcon, SearchIcon, UserIcon } from 'lucide-react';
import { useHotel } from '../../contexts/HotelContext';
import { roomTypeName } from '../../data/property';
import { shortDate } from '../../utils/format';

interface Result {
  id: string;
  kind: 'guest' | 'reservation' | 'room';
  title: string;
  subtitle: string;
  to: string;
}

export function GlobalSearch() {
  const { guests, reservations, rooms, guestName } = useHotel();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const guestHits: Result[] = guests.
    filter((g) =>
    `${g.firstName} ${g.lastName} ${g.email} ${g.phone}`.
    toLowerCase().
    includes(q)
    ).
    slice(0, 4).
    map((g) => ({
      id: g.id,
      kind: 'guest',
      title: `${g.firstName} ${g.lastName}`,
      subtitle: `${g.email} · ${g.stays} stays`,
      to: `/guests/${g.id}`
    }));
    const resHits: Result[] = reservations.
    filter((r) =>
    `${r.confirmation} ${guestName(r.guestId)}`.toLowerCase().includes(q)
    ).
    slice(0, 4).
    map((r) => ({
      id: r.id,
      kind: 'reservation',
      title: `#${r.confirmation}`,
      subtitle: `${guestName(r.guestId)} · ${shortDate(r.arrival)} – ${shortDate(r.departure)}`,
      to: `/bookings/${r.id}`
    }));
    const roomHits: Result[] = rooms.
    filter((r) => `${r.number} ${roomTypeName(r.type)}`.toLowerCase().includes(q)).
    slice(0, 4).
    map((r) => ({
      id: r.id,
      kind: 'room',
      title: `Room ${r.number}`,
      subtitle: `${roomTypeName(r.type)} · Floor ${r.floor}`,
      to: `/room-rack?room=${r.id}`
    }));
    return [...guestHits, ...resHits, ...roomHits];
  }, [query, guests, reservations, rooms, guestName]);

  const icons = {
    guest: UserIcon,
    reservation: ReceiptTextIcon,
    room: BedDoubleIcon
  };

  const select = (result: Result) => {
    navigate(result.to);
    setQuery('');
    setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full max-w-[520px]"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}>
      
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search guests, rooms, or confirmation numbers…"
        aria-label="Global search"
        className="h-9 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint transition-colors duration-150 ease-out focus:border-brand-500 focus:bg-white focus:outline-none" />
      
      <AnimatePresence>
        {open && query.trim().length >= 2 &&
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute left-0 right-0 top-11 z-40 overflow-hidden rounded-xl border border-line bg-white shadow-pop">
          
            {results.length === 0 ?
          <p className="px-4 py-6 text-center text-[13px] text-ink-muted">
                No matches for “{query}”
              </p> :

          <ul className="max-h-[340px] overflow-y-auto py-1">
                {results.map((result) => {
              const Icon = icons[result.kind];
              return (
                <li key={`${result.kind}-${result.id}`}>
                      <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(result)}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors duration-150 ease-out hover:bg-slate-50">
                    
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-ink-muted">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-ink">
                            {result.title}
                          </span>
                          <span className="block truncate text-[11px] text-ink-faint">
                            {result.subtitle}
                          </span>
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                          {result.kind}
                        </span>
                      </button>
                    </li>);

            })}
              </ul>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}