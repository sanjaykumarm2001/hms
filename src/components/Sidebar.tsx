import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ActivityIcon,
  BedDoubleIcon,
  BrushCleaningIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ConciergeBellIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  SettingsIcon,
  UserCogIcon,
  UsersIcon,
  WrenchIcon,
  ChartNoAxesColumnIcon
} from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { LodgelyLogo } from './LodgelyLogo';

function NavItem({
  to,
  label,
  icon: Icon,
  badge,
  collapsed
}: {
  to: string;
  label: string;
  icon: typeof SettingsIcon;
  badge?: number;
  collapsed?: boolean;
}) {
  return (
    <NavLink
      to={to}
      title={collapsed ? `${label}${badge ? ` (${badge})` : ''}` : undefined}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
          collapsed ? 'justify-center px-2' : '',
          isActive
            ? 'bg-brand-gradient text-white shadow-[0_1px_3px_rgba(37,184,79,0.35)]'
            : 'text-ink-soft hover:bg-brand-50 hover:text-ink'
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            aria-hidden="true"
            className={[
              'h-[18px] w-[18px] shrink-0',
              isActive ? 'text-white' : 'text-ink-muted group-hover:text-brand-700'
            ].join(' ')}
            strokeWidth={1.9}
          />

          {!collapsed && <span className="truncate">{label}</span>}
          {badge ? (
            <span
              className={[
                'tabular rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                collapsed
                  ? 'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center p-0 text-[9px]'
                  : 'ml-auto',
                isActive ? 'bg-white/25 text-white' : 'bg-canvas text-ink-soft'
              ].join(' ')}
            >
              {badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { ops, settings, tickets } = useHotel();
  const [collapsed, setCollapsed] = useState(false);
  const openTickets = tickets.filter((t) => t.status !== 'resolved').length;
  const hkLoad = ops.counts.dirty + ops.counts.cleaning;

  const operations = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
    {
      to: '/front-desk',
      label: 'Front Desk',
      icon: ConciergeBellIcon,
      badge: ops.arrivals.length + ops.departures.length
    },
    { to: '/reservations', label: 'Reservations', icon: CalendarDaysIcon },
    { to: '/guest-activity', label: 'Guest Activity', icon: ActivityIcon },
    { to: '/rooms', label: 'Rooms', icon: BedDoubleIcon },
    { to: '/guests', label: 'Guests', icon: UsersIcon },
    { to: '/housekeeping', label: 'Housekeeping', icon: BrushCleaningIcon, badge: hkLoad },
    { to: '/maintenance', label: 'Maintenance', icon: WrenchIcon, badge: openTickets },
    { to: '/billing', label: 'Billing', icon: ReceiptTextIcon, badge: ops.outstanding.length }
  ];

  const insights = [
    { to: '/reports', label: 'Reports', icon: ChartNoAxesColumnIcon },
    { to: '/staff', label: 'Staff', icon: UserCogIcon }
  ];

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-y-auto border-r border-line bg-white transition-all duration-200 ${
        collapsed ? 'w-[68px]' : 'w-[228px]'
      }`}
    >
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-line px-3.5">
        <LodgelyLogo compact={collapsed} />
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-2.5 py-4">
        {operations.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Insights
          </p>
        )}
        {collapsed && <div className="my-1.5 border-t border-gray-100" />}

        {insights.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            System
          </p>
        )}
        {collapsed && <div className="my-1.5 border-t border-gray-100" />}

        <NavItem to="/settings" label="Settings" icon={SettingsIcon} collapsed={collapsed} />
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-4 shrink-0 rounded-lg border border-line bg-canvas px-3 py-3">
          <p className="text-[11px] font-semibold text-ink">{settings.propertyName}</p>
          <p className="mt-0.5 text-[11px] text-ink-muted">
            {ops.counts.total} rooms · {settings.propertyCode}
          </p>
        </div>
      )}
    </aside>
  );
}