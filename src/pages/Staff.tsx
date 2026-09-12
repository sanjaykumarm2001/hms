import React, { useMemo, useState } from 'react';
import { BriefcaseIcon, ClockIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  Field,
  Modal,
  PageHeader,
  PrimaryButton,
  ProgressBar,
  SecondaryButton,
  SelectInput,
  StatusPill,
  TextInput
} from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import type { Department } from '../types/hotel';

const DEPARTMENTS: Department[] = ['Front Office', 'Housekeeping', 'Maintenance', 'F&B', 'Management'];

const STAFF_ROLES: { label: string; department: Department }[] = [
  { label: 'Housekeeping', department: 'Housekeeping' },
  { label: 'Front Office', department: 'Front Office' },
  { label: 'Maintenance', department: 'Maintenance' },
  { label: 'F&B', department: 'F&B' },
  { label: 'General Manager', department: 'Management' }
];

export function Staff() {
  const { staff, rooms, tickets, addStaffMember } = useHotel();
  const [department, setDepartment] = useState<'all' | Department>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState(STAFF_ROLES[0].label);
  const [shift, setShift] = useState('Morning (07:00 - 15:30)');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const selectedRoleObj = STAFF_ROLES.find((r) => r.label === role);
    const dept = selectedRoleObj?.department ?? 'Housekeeping';
    addStaffMember({ name: name.trim(), role, department: dept, shift, email, phone });
    setAddOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const rows = useMemo(() => {
    return staff
      .filter((member) => (department === 'all' ? true : member.department === department))
      .map((member) => {
        const hkRooms = rooms.filter((room) => room.housekeeper === member.name).length;
        const openTickets = tickets.filter(
          (ticket) => ticket.assignee === member.name && ticket.status !== 'resolved'
        ).length;
        return { member, hkRooms, openTickets };
      });
  }, [department, rooms, staff, tickets]);

  const onDuty = staff.filter((member) => member.status === 'On Duty').length;
  const offDuty = staff.filter((member) => member.status !== 'On Duty').length;

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
              Staff Workspace & Directory
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#176938]">
              <span className="h-2 w-2 rounded-full bg-[#176938] animate-pulse" />
              LIVE TEAM DIRECTORY
            </span>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 font-normal">
            {staff.length} team members · {onDuty} on duty right now across property operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <SelectInput
            value={department}
            onChange={(event) => setDepartment(event.target.value as 'all' | Department)}
            className="w-[170px]"
            aria-label="Filter by department"
          >
            <option value="all">All departments</option>
            {DEPARTMENTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectInput>
          <PrimaryButton gradient onClick={() => setAddOpen(true)}>
            <UserPlusIcon aria-hidden="true" className="h-4 w-4" />
            Add staff
          </PrimaryButton>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              TOTAL STAFF
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-xs">
              <UsersIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {staff.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Employees</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              ON DUTY NOW
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] shadow-xs">
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {onDuty}
            </span>
            <span className="text-xs font-semibold text-[#176938]">Active Shift</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              OFF DUTY / BREAK
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fef3c7] text-[#b45309] shadow-xs">
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {offDuty}
            </span>
            <span className="text-xs font-semibold text-[#b45309]">Standby / Leave</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              DEPARTMENTS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7] shadow-xs">
              <BriefcaseIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {DEPARTMENTS.length}
            </span>
            <span className="text-xs font-semibold text-[#0284c7]">Operational Units</span>
          </div>
        </div>
      </div>

      <Card className="glass-card-premium border border-slate-200/80 shadow-md backdrop-blur-md rounded-2xl overflow-hidden">
        <CardHeader title="Roster" subtitle={`${rows.length} team members in this view`} />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Team member</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Department</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Shift</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Contact</th>
                <th scope="col" className="px-3 py-2.5 pr-5 font-semibold">Current workload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ member, hkRooms, openTickets }) =>
              <tr key={member.id} className="transition-colors duration-150 hover:bg-emerald-50/60">
                  <td className="py-3 pl-5 pr-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-800">
                        {member.name.
                      split(' ').
                      map((part) => part.charAt(0)).
                      join('')}
                      </span>
                      <span>
                        <span className="block text-[13px] font-semibold text-ink">{member.name}</span>
                        <span className="block text-[11px] text-ink-muted">{member.role}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12px] text-ink-soft">{member.department}</td>
                  <td className="tabular px-3 py-3 text-[12px] text-ink-soft">{member.shift}</td>
                  <td className="px-3 py-3">
                    <StatusPill
                    tone={
                    member.status === 'On Duty' ?
                    'green' :
                    member.status === 'On Break' ?
                    'amber' :
                    member.status === 'Leave' ?
                    'red' :
                    'gray'
                    }>
                    
                      {member.status}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-[12px] text-ink-soft">{member.email}</p>
                    <p className="text-[11px] text-ink-muted">{member.phone}</p>
                  </td>
                  <td className="px-3 py-3 pr-5">
                    <div className="w-[180px]">
                      <div className="flex items-center justify-between text-[11px] text-ink-muted">
                        <span>
                          {member.department === 'Housekeeping' ?
                        `${hkRooms} rooms assigned` :
                        member.department === 'Maintenance' ?
                        `${openTickets} open work orders` :
                        'Desk & guest coverage'}
                        </span>
                        <span className="tabular font-semibold text-ink-soft">{member.workload}%</span>
                      </div>
                      <ProgressBar
                      className="mt-1.5"
                      value={member.workload}
                      label={`${member.name} workload`} />
                    
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={addOpen}
        title="Add Staff Member"
        subtitle="Add a new employee to the property team directory."
        onClose={() => setAddOpen(false)}
        footer={
          <>
            <SecondaryButton onClick={() => setAddOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton gradient onClick={handleAddStaff}>
              Add Member
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleAddStaff} className="space-y-3.5">
          <Field label="Full Name">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <SelectInput value={role} onChange={(e) => setRole(e.target.value)}>
                {STAFF_ROLES.map((r) => (
                  <option key={r.label} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Shift">
              <SelectInput value={shift} onChange={(e) => setShift(e.target.value)}>
                <option value="Morning (07:00 - 15:30)">Morning (07:00 - 15:30)</option>
                <option value="Evening (15:00 - 23:30)">Evening (15:00 - 23:30)</option>
                <option value="Night (23:00 - 07:30)">Night (23:00 - 07:30)</option>
              </SelectInput>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@lodgely.com"
              />
            </Field>

            <Field label="Phone">
              <TextInput
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}