import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BedDoubleIcon,
  BrushIcon,
  ClipboardListIcon,
  CogIcon,
  FileBarChartIcon,
  GaugeIcon,
  ReceiptTextIcon,
  ScanFaceIcon,
  UsersIcon,
  UsersRoundIcon,
  WrenchIcon } from
'lucide-react';
import { useHotel } from '../../contexts/HotelContext';
import { property } from '../../data/property';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export function Sidebar() {
  const { ops, rooms, tickets } = useHotel();

  const groups: {title: string;items: NavItem[];}[] = [
  {
    title: 'Operations',
    items: [
    { to: '/dashboard', label: 'Dashboard', icon: GaugeIcon },
    {
      to: '/front-desk',
      label: 'Front Desk',
      icon: ClipboardListIcon,
      badge: ops.arrivals.length + ops.departures.length
    },
    { to: '/bookings', label: 'Bookings', icon: ReceiptTextIcon },
    { to: '/room-rack', label: 'Room Rack', icon: BedDoubleIcon },
    {
      to: '/housekeeping',
      label: 'Housekeeping',
      icon: BrushIcon,
      badge: rooms.filter((r) => r.housekeeping === 'dirty').length
    },
    {
      to: '/maintenance',
      label: 'Maintenance',
      icon: WrenchIcon,
      badge: tickets.filter((t) => t.status !== 'resolved').length
    }]

  },
  {
    title: 'Guests',
    items: [
    { to: '/guests', label: 'Guest Directory', icon: UsersIcon },
    { to: '/guest-activity', label: 'Guest Activity', icon: ScanFaceIcon }]

  },
  {
    title: 'Finance',
    items: [
    { to: '/billing', label: 'Billing & Folios', icon: ReceiptTextIcon },
    { to: '/reports', label: 'Reports', icon: FileBarChartIcon }]

  },
  {
    title: 'System',
    items: [
    { to: '/staff', label: 'Staff', icon: UsersRoundIcon },
    { to: '/config', label: 'Config', icon: CogIcon }]

  }];


  return (
    <aside className="flex h-full w-[228px] shrink-0 flex-col border-r border-line bg-white">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-[13px] font-bold text-white">
          S
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          Sentinel
        </span>
      </div>

      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-2.5 pb-4">
        {groups.map((group) =>
        <div key={group.title} className="mb-4">
            <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-ink-faint">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) =>
            <li key={item.to}>
                  <NavLink
                to={item.to}
                className={({ isActive }) =>
                [
                'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors duration-150 ease-out',
                isActive ?
                'bg-brand-600 text-white' :
                'text-ink-muted hover:bg-slate-100 hover:text-ink'].
                join(' ')
                }>
                
                    {({ isActive }) =>
                <>
                        <item.icon
                    className={`h-4 w-4 ${isActive ? 'text-white' : 'text-ink-faint group-hover:text-ink-muted'}`} />
                  
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge ?
                  <span
                    className={`tabular rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive ?
                    'bg-white/20 text-white' :
                    'bg-slate-100 text-ink-muted'}`
                    }>
                    
                            {item.badge}
                          </span> :
                  null}
                      </>
                }
                  </NavLink>
                </li>
            )}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-line px-5 py-3">
        <p className="text-[12px] font-medium text-ink">{property.name}</p>
        <p className="text-[11px] text-ink-faint">
          {property.rooms} rooms · {property.timezone.split('/')[1]}
        </p>
      </div>
    </aside>);

}