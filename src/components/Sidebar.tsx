import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  RefreshCwIcon,
  SettingsIcon,
  UserCogIcon,
  UsersIcon,
  WrenchIcon
} from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { LodgelyLogo } from './LodgelyLogo';

function NavItem({
  to,
  label,
  icon: Icon,
  badge,
  badgeTone,
  collapsed
}: {
  to: string;
  label: string;
  icon: typeof SettingsIcon;
  badge?: number;
  badgeTone?: 'amber' | 'blue' | 'red' | 'green' | 'gray';
  collapsed?: boolean;
}) {
  const location = useLocation();

  const isCurrentActive = useMemo(() => {
    if (to === '/reports') {
      return location.pathname === '/reports' || location.pathname === '/billing';
    }
    return location.pathname === to;
  }, [location.pathname, to]);

  const getBadgeClass = (isActive: boolean) => {
    if (isActive) return 'bg-white/20 text-white';
    switch (badgeTone) {
      case 'amber':
        return 'bg-[#fef3c7] text-[#d97706]';
      case 'blue':
        return 'bg-[#e0f2fe] text-[#0284c7]';
      case 'red':
        return 'bg-[#fee2e2] text-[#ef4444]';
      case 'green':
        return 'bg-[#dcfce7] text-[#16a34a]';
      default:
        return 'bg-[#f1f5f9] text-[#64748b]';
    }
  };

  return (
    <NavLink
      to={to}
      title={collapsed ? `${label}${badge ? ` (${badge})` : ''}` : undefined}
      className={[
        'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150',
        collapsed ? 'justify-center px-2' : '',
        isCurrentActive
          ? 'bg-[#176938] text-white shadow-sm'
          : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]'
      ].join(' ')}
    >
      <Icon
        aria-hidden="true"
        className={[
          'h-[19px] w-[19px] shrink-0',
          isCurrentActive ? 'text-white' : 'text-[#64748b] group-hover:text-[#176938]'
        ].join(' ')}
        strokeWidth={2}
      />

      {!collapsed && <span className="truncate flex-1">{label}</span>}
      {badge !== undefined && badge > 0 ? (
        <span
          className={[
            'tabular rounded-full px-2 py-0.5 text-[11px] font-bold',
            collapsed
              ? 'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center p-0 text-[9px]'
              : 'ml-auto',
            getBadgeClass(isCurrentActive)
          ].join(' ')}
        >
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}

export function Sidebar() {
  const { settings, ops } = useHotel();
  const [collapsed, setCollapsed] = useState(false);

  const navigationItems: Array<{
    to: string;
    label: string;
    icon: typeof SettingsIcon;
    badge?: number;
    badgeTone?: 'amber' | 'blue' | 'red' | 'green' | 'gray';
  }> = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
    {
      to: '/front-desk',
      label: 'Front Desk',
      icon: ConciergeBellIcon,
      badge: 9,
      badgeTone: 'amber'
    },
    { to: '/guests', label: 'Guests', icon: UsersIcon },
    { to: '/reservations', label: 'Reservations', icon: CalendarDaysIcon },
    { to: '/guest-activity', label: 'Guest Activity', icon: ActivityIcon },
    { to: '/rooms', label: 'Rooms', icon: BedDoubleIcon },
    { to: '/housekeeping', label: 'Housekeeping', icon: BrushCleaningIcon, badge: 12, badgeTone: 'blue' },
    { to: '/maintenance', label: 'Maintenance', icon: WrenchIcon, badge: 4, badgeTone: 'red' },
    { to: '/reports', label: 'Reports', icon: ReceiptTextIcon, badge: 9, badgeTone: 'green' },
    { to: '/staff', label: 'Staff', icon: UserCogIcon },
    { to: '/settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-y-auto overflow-x-hidden no-scrollbar border-r border-white/80 bg-white/75 backdrop-blur-xl transition-all duration-200 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Top Header Logo */}
      <div
        className={`flex h-[60px] shrink-0 items-center border-b border-[#f1f5f9] ${
          collapsed ? 'justify-center px-1' : 'justify-between px-4'
        }`}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 hover:border-[#176938] transition-all"
          >
            <LodgelyLogo />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#176938] text-white shadow-sm ring-2 ring-white">
              <ChevronRightIcon className="h-3 w-3 stroke-[3]" />
            </span>
          </button>
        ) : (
          <>
            <LodgelyLogo />
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105 transition-all ml-1"
            >
              <ChevronLeftIcon className="h-4 w-4 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* Property Card */}
      {!collapsed && (
        <div className="mx-3.5 mt-3 mb-2 rounded-xl border border-slate-200 bg-[#f8fafc] p-3 shadow-sm">
          <p className="text-[13px] font-bold text-slate-900 truncate tracking-tight">
            {settings.propertyName || 'Lodgely Resort & Hotel'}
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
            {ops.counts.total || 40} rooms
          </p>
        </div>
      )}

      {/* Navigation List */}
      <nav aria-label="Main" className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navigationItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}