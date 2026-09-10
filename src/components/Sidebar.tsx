import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  Grid2x2Icon,
  CalendarDaysIcon,
  UsersIcon,
  BrushCleaningIcon,
  SettingsIcon,
  WrenchIcon } from
'lucide-react';

const primaryNav = [
{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
{ to: '/room-rack', label: 'Room Rack', icon: Grid2x2Icon },
{ to: '/bookings', label: 'Bookings', icon: CalendarDaysIcon },
{ to: '/guest-activity', label: 'Guest Activity', icon: UsersIcon },
{ to: '/housekeeping', label: 'Housekeeping', icon: BrushCleaningIcon }];


const systemNav = [
{ to: '/config', label: 'Config', icon: SettingsIcon },
{ to: '/setup', label: 'Setup', icon: WrenchIcon }];


function NavItem({ to, label, icon: Icon }: {to: string;label: string;icon: typeof SettingsIcon;}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
      [
      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
      isActive ?
      'bg-brand-gradient text-white shadow-[0_1px_3px_rgba(37,184,79,0.35)]' :
      'text-ink-soft hover:bg-brand-50 hover:text-ink'].
      join(' ')
      }>
      
      {({ isActive }) =>
      <>
          <Icon
          aria-hidden="true"
          className={['h-[18px] w-[18px] shrink-0', isActive ? 'text-white' : 'text-ink-muted group-hover:text-brand-700'].join(' ')}
          strokeWidth={1.9} />
        
          <span className="truncate">{label}</span>
        </>
      }
    </NavLink>);

}

export function Sidebar() {
  return (
    <aside className="flex w-[228px] shrink-0 flex-col border-r border-line bg-white">
      <div className="flex h-[68px] items-center gap-2.5 border-b border-line px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-brand-gradient">
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path d="M10 2.5 17 6v5.2c0 3.2-2.8 5.6-7 6.3-4.2-.7-7-3.1-7-6.3V6l7-3.5Z" fill="#fff" fillOpacity="0.92" />
            <path d="M10 6.5 13.2 12H6.8L10 6.5Z" fill="#1c9440" />
          </svg>
        </span>
        <span className="text-[17px] font-bold tracking-tight text-ink">Sentinel</span>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3 py-4">
        {primaryNav.map((item) =>
        <NavItem key={item.to} {...item} />
        )}

        <p className="px-3 pb-1 pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">System</p>
        {systemNav.map((item) =>
        <NavItem key={item.to} {...item} />
        )}
      </nav>

      <div className="mx-3 mb-4 rounded-lg border border-line bg-canvas px-3 py-3">
        <p className="text-[11px] font-semibold text-ink">Meridian Hotels</p>
        <p className="mt-0.5 text-[11px] text-ink-muted">120 rooms · Property 04</p>
      </div>
    </aside>);

}