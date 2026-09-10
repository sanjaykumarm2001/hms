import React, { useState } from 'react';
import { ClipboardCheckIcon, RefreshCwIcon } from 'lucide-react';
import { Card, PageHeader, PrimaryButton, ProgressBar, SecondaryButton } from '../components/ui';
import { attendants, housekeepingTasks } from '../data/housekeeping';
import { HousekeepingState } from '../types';

const stateMeta: Record<HousekeepingState, {label: string;chip: string;dot: string;}> = {
  dirty: { label: 'Dirty', chip: 'bg-[#fdf3e2] text-[#8d5a10]', dot: '#f0a72a' },
  cleaning: { label: 'Cleaning', chip: 'bg-[#f7f9d9] text-[#6b7112]', dot: '#c3c72f' },
  clean: { label: 'Clean', chip: 'bg-brand-50 text-brand-800', dot: '#60c64a' },
  inspected: { label: 'Inspected', chip: 'bg-brand-100 text-brand-900', dot: '#1c9440' },
  maintenance: { label: 'Maintenance', chip: 'bg-[#f1f2ef] text-ink-soft', dot: '#9ca3af' }
};

const filters: Array<{id: 'all' | HousekeepingState;label: string;}> = [
{ id: 'all', label: 'All Rooms' },
{ id: 'dirty', label: 'Dirty' },
{ id: 'cleaning', label: 'Cleaning' },
{ id: 'clean', label: 'Clean' },
{ id: 'inspected', label: 'Inspected' },
{ id: 'maintenance', label: 'Maintenance' }];


export function Housekeeping() {
  const [filter, setFilter] = useState<'all' | HousekeepingState>('all');
  const rows = housekeepingTasks.filter((t) => filter === 'all' || t.state === filter);
  const cleaned = housekeepingTasks.filter((t) => t.state === 'clean' || t.state === 'inspected').length;

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Housekeeping"
        subtitle="Track board status, attendant assignments, and turnaround progress."
        actions={
        <>
            <SecondaryButton>
              <RefreshCwIcon aria-hidden="true" className="h-4 w-4" />
              Sync board
            </SecondaryButton>
            <PrimaryButton>
              <ClipboardCheckIcon aria-hidden="true" className="h-4 w-4" />
              Assign tasks
            </PrimaryButton>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_296px]">
        <div className="min-w-0">
          <Card className="relative overflow-hidden bg-brand-wash p-5 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand-gradient-v">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold text-ink-soft">Board Turnaround</p>
                <p className="tabular mt-2 text-[30px] font-bold leading-none tracking-tight text-ink">
                  {cleaned}
                  <span className="text-[16px] font-semibold text-ink-muted"> / {housekeepingTasks.length} rooms ready</span>
                </p>
              </div>
              <p className="text-[12px] text-ink-soft">Avg. turnaround 24 min</p>
            </div>
            <ProgressBar className="mt-4" value={cleaned / housekeepingTasks.length * 100} label="Board turnaround" />
          </Card>

          <div className="mt-4 flex flex-wrap items-center gap-1 rounded-lg bg-[#f3f4f0] p-1">
            {filters.map((f) =>
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={[
              'rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors duration-150',
              filter === f.id ? 'bg-white text-ink shadow-card' : 'text-ink-soft hover:text-ink'].
              join(' ')}>
              
                {f.label}
              </button>
            )}
          </div>

          <Card className="mt-4 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Room</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Type</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Attendant</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Priority</th>
                  <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Elapsed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((task) => {
                  const meta = stateMeta[task.state];
                  return (
                    <tr key={task.room} className="transition-colors duration-150 hover:bg-[#fafbf8]">
                      <td className="py-3 pl-5 pr-3">
                        <span className="tabular text-[13px] font-bold text-ink">{task.room}</span>
                        <span className="block text-[11px] text-ink-muted">Floor {task.floor}</span>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-ink-soft">{task.type}</td>
                      <td className="px-3 py-3 text-[12px] font-medium text-ink">{task.attendant}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[12px] font-semibold capitalize text-ink-soft">{task.priority}</td>
                      <td className="tabular px-3 py-3 pr-5 text-right text-[12px] text-ink-soft">
                        {task.minutes > 0 ? `${task.minutes} min` : '—'}
                      </td>
                    </tr>);

                })}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Attendant Load</h2>
            <ul className="mt-4 space-y-4">
              {attendants.map((a) =>
              <li key={a.name}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-ink">{a.name}</span>
                    <span className="tabular font-semibold text-ink-soft">
                      {a.done}/{a.total}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{a.zone}</p>
                  <ProgressBar className="mt-2" value={a.done / a.total * 100} label={`${a.name} progress`} />
                </li>
              )}
            </ul>
          </Card>

          <section className="rounded-card bg-panel p-5 shadow-panel">
            <h2 className="text-[15px] font-semibold tracking-tight text-white">Status Key</h2>
            <ul className="mt-4 space-y-2.5">
              {(Object.keys(stateMeta) as HousekeepingState[]).map((key) =>
              <li key={key} className="flex items-center justify-between text-[12px] text-white/70">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stateMeta[key].dot }} />
                    {stateMeta[key].label}
                  </span>
                  <span className="tabular font-semibold text-white">
                    {housekeepingTasks.filter((t) => t.state === key).length}
                  </span>
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>);

}