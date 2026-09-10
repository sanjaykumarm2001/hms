import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, ChevronDownIcon, LogOutIcon } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { useHotel } from '../../contexts/HotelContext';
import { currentUser } from '../../data/property';
import { Avatar } from '../ui/Avatar';

export function TopBar({ onSignOut }: {onSignOut: () => void;}) {
  const { ops } = useHotel();
  const [showAlerts, setShowAlerts] = useState(false);
  const critical = ops.alerts.filter((a) => a.level === 'critical').length;

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-white px-5">
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAlerts((v) => !v)}
            aria-label={`Alerts (${ops.alerts.length})`}
            className="relative rounded-lg p-2 text-ink-muted transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-ink">
            
            <BellIcon className="h-4 w-4" />
            {ops.alerts.length > 0 &&
            <span
              className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white ${
              critical ? 'bg-red-500' : 'bg-amber-500'}`
              } />

            }
          </button>
          <AnimatePresence>
            {showAlerts &&
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-11 z-40 w-[320px] overflow-hidden rounded-xl border border-line bg-white shadow-pop">
              
                <p className="border-b border-line px-4 py-2.5 text-[12px] font-semibold text-ink">
                  Operational alerts
                </p>
                {ops.alerts.length === 0 ?
              <p className="px-4 py-5 text-[13px] text-ink-muted">
                    Nothing needs attention.
                  </p> :

              <ul className="max-h-[320px] divide-y divide-line overflow-y-auto">
                    {ops.alerts.map((alert) =>
                <li key={alert.id}>
                        <Link
                    to={alert.to}
                    onClick={() => setShowAlerts(false)}
                    className="block px-4 py-3 transition-colors duration-150 ease-out hover:bg-slate-50">
                    
                          <span className="flex items-center gap-2">
                            <span
                        className={`h-1.5 w-1.5 rounded-full ${
                        alert.level === 'critical' ?
                        'bg-red-500' :
                        alert.level === 'warning' ?
                        'bg-amber-500' :
                        'bg-brand-500'}`
                        } />
                      
                            <span className="text-[13px] font-medium text-ink">
                              {alert.title}
                            </span>
                          </span>
                          <span className="mt-0.5 block pl-3.5 text-[12px] text-ink-muted">
                            {alert.detail}
                          </span>
                        </Link>
                      </li>
                )}
                  </ul>
              }
              </motion.div>
            }
          </AnimatePresence>
        </div>

        <div className="mx-1 h-6 w-px bg-line" />

        <div className="flex items-center gap-2.5 pl-1">
          <div className="text-right leading-tight">
            <p className="text-[12px] font-semibold text-ink">{currentUser.name}</p>
            <p className="text-[11px] text-ink-faint">{currentUser.role}</p>
          </div>
          <Avatar firstName="Alex" lastName="Rivera" />
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="rounded-lg p-2 text-ink-faint transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-ink">
            
            <LogOutIcon className="h-4 w-4" />
          </button>
          <ChevronDownIcon className="hidden h-3.5 w-3.5 text-ink-faint" />
        </div>
      </div>
    </header>);

}