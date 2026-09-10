import React, { useMemo, useState } from 'react';
import { useHotel } from '../contexts/HotelContext';
import { Card, Page, PageHeader } from '../components/layout/PageHeader';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { titleize } from '../utils/format';
import type { Department } from '../types';

const departments: {id: 'all' | Department;label: string;}[] = [
{ id: 'all', label: 'All departments' },
{ id: 'front_office', label: 'Front office' },
{ id: 'housekeeping', label: 'Housekeeping' },
{ id: 'maintenance', label: 'Maintenance' },
{ id: 'fnb', label: 'F&B' },
{ id: 'management', label: 'Management' }];


export function Staff() {
  const { staff, rooms, tickets } = useHotel();
  const [department, setDepartment] = useState<'all' | Department>('all');

  const filtered = useMemo(
    () =>
    department === 'all' ?
    staff :
    staff.filter((s) => s.department === department),
    [staff, department]
  );

  const workloadFor = (name: string, dept: Department) => {
    if (dept === 'housekeeping')
    return `${rooms.filter((r) => r.housekeeper === name && r.housekeeping !== 'inspected').length} rooms`;
    if (dept === 'maintenance')
    return `${tickets.filter((t) => t.assignee === name && t.status !== 'resolved').length} work orders`;
    return `${staff.find((s) => s.name === name)?.workload ?? 0} tasks`;
  };

  return (
    <Page>
      <PageHeader
        eyebrow="People"
        title="Staff Roster"
        subtitle={`${staff.filter((s) => s.onDuty).length} of ${staff.length} on duty`} />
      

      <div className="mb-4 inline-flex flex-wrap rounded-lg border border-line bg-slate-50 p-0.5">
        {departments.map((d) =>
        <button
          key={d.id}
          type="button"
          onClick={() => setDepartment(d.id)}
          className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out ${
          department === d.id ?
          'bg-white text-ink shadow-card' :
          'text-ink-muted hover:text-ink'}`
          }>
          
            {d.label}
          </button>
        )}
      </div>

      <Card padded={false}>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
              <th className="px-4 py-2.5">Team member</th>
              <th className="px-2 py-2.5">Department</th>
              <th className="px-2 py-2.5">Shift</th>
              <th className="px-2 py-2.5">Contact</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Workload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((member) => {
              const [first, ...rest] = member.name.split(' ');
              return (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        firstName={first}
                        lastName={rest.join(' ') || first}
                        size="sm" />
                      
                      <div>
                        <p className="text-[13px] font-semibold text-ink">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-ink-faint">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-[12px] text-ink-muted">
                    {titleize(member.department)}
                  </td>
                  <td className="px-2 py-3 text-[12px] text-ink-muted">
                    {member.shift}
                  </td>
                  <td className="px-2 py-3 text-[12px] text-ink-muted">
                    {member.phone}
                  </td>
                  <td className="px-2 py-3">
                    <Badge tone={member.onDuty ? 'green' : 'neutral'} dot>
                      {member.onDuty ? 'On duty' : 'Off shift'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-[12px] font-medium text-ink">
                    {workloadFor(member.name, member.department)}
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </Card>
    </Page>);

}