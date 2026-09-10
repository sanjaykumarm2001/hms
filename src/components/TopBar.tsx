import React from 'react';
import { BellIcon, SearchIcon } from 'lucide-react';

export function TopBar() {
  return (
    <header className="flex h-[68px] shrink-0 items-center gap-6 border-b border-line bg-white px-6">
      <label className="relative w-full max-w-[420px]">
        <span className="sr-only">Search guests, rooms, or confirmation numbers</span>
        <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          placeholder="Search guests, rooms, or confirmation numbers..."
          className="h-10 w-full rounded-full border border-transparent bg-[#f1f3ee] pl-10 pr-4 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-300 focus:bg-white focus:outline-none" />
        
      </label>

      <div className="ml-auto flex items-center gap-5">
        <button
          type="button"
          className="relative rounded-full p-2 text-ink-soft transition-colors duration-150 hover:bg-canvas hover:text-ink"
          aria-label="Notifications, 3 unread">
          
          <BellIcon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.9} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#e0453c] ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 border-l border-line pl-5">
          <div className="text-right leading-tight">
            <p className="text-[13px] font-semibold text-ink">Alex Rivera</p>
            <p className="text-[11px] text-ink-muted">Duty Manager</p>
          </div>
          <img
            src="/984db9d8-d360-4973-ba3a-47bf2848df32.jpg"
            alt="Alex Rivera"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-100" />
          
        </div>
      </div>
    </header>);

}