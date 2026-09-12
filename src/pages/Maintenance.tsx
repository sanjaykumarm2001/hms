import React, { useMemo, useState } from 'react';
import { AlertTriangleIcon, PlusIcon, WrenchIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  EmptyState,
  Field,
  KeyValue,
  Modal,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  StatusPill,
  Tabs,
  TextArea
} from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { TECHNICIANS } from '../data/seed';
import type { TicketPriority, TicketStatus } from '../types/hotel';
import {
  ticketPriorityTone,
  ticketStatusLabel,
  ticketStatusTone,
  roomStatusLabel,
  roomStatusTone
} from '../utils/tone';
import { shortDate } from '../utils/format';

const FLOW: TicketStatus[] = ['open', 'in-progress', 'awaiting-parts', 'resolved'];

export function Maintenance() {
  const { tickets, rooms, getRoom, updateTicket, addTicket, ops, staff } = useHotel();
  const [status, setStatus] = useState<'all' | TicketStatus>('all');
  const [priority, setPriority] = useState<'all' | TicketPriority>('all');
  const [selectedId, setSelectedId] = useState<string | null>(tickets[0]?.id ?? null);

  const technicianOptions = useMemo(() => {
    const fromStaff = staff
      .filter((s) => s.department === 'Maintenance' || s.role.toLowerCase().includes('mainten') || s.role.toLowerCase().includes('tech') || s.role.toLowerCase().includes('engineer'))
      .map((s) => s.name);
    return Array.from(new Set([...TECHNICIANS, ...fromStaff]));
  }, [staff]);

  const [createOpen, setCreateOpen] = useState(false);
  const [newRoomId, setNewRoomId] = useState(rooms[0]?.id ?? '');
  const [newCategory, setNewCategory] = useState<'HVAC' | 'Plumbing' | 'Electrical' | 'Carpentry' | 'Appliance' | 'Other'>('HVAC');
  const [newPriority, setNewPriority] = useState<TicketPriority>('normal');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    const targetRoomId = newRoomId || rooms[0]?.id;
    if (!targetRoomId) return;
    const targetRoom = getRoom(targetRoomId);
    const created = addTicket({
      roomId: targetRoomId,
      title: `${newCategory} Issue — ${targetRoom ? `Room ${targetRoom.number}` : 'Room'}`,
      category: newCategory,
      priority: newPriority,
      description: newDesc.trim(),
      blocksSale: newPriority === 'urgent' || newPriority === 'high'
    });
    setSelectedId(created.id);
    setCreateOpen(false);
    setNewDesc('');
  };

  const list = useMemo(
    () =>
      tickets
        .filter((ticket) => (status === 'all' ? true : ticket.status === status))
        .filter((ticket) => (priority === 'all' ? true : ticket.priority === priority))
        .sort((a, b) => {
          const rank = (value: TicketPriority) =>
            value === 'urgent' ? 0 : value === 'high' ? 1 : value === 'normal' ? 2 : 3;
          return rank(a.priority) - rank(b.priority) || a.code.localeCompare(b.code);
        }),
    [priority, status, tickets]
  );

  const selected = tickets.find((ticket) => ticket.id === selectedId) ?? list[0];
  const selectedRoom = selected ? getRoom(selected.roomId) : undefined;
  const counts = tickets.reduce<Record<string, number>>((acc, ticket) => {
    acc[ticket.status] = (acc[ticket.status] ?? 0) + 1;
    return acc;
  }, {});
  const blocking = tickets.filter((ticket) => ticket.blocksSale && ticket.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold leading-none tracking-tight text-slate-900">
              Work Orders & Maintenance
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1 text-[11px] font-bold text-[#176938]">
              <span className="h-2 w-2 rounded-full bg-[#176938] animate-pulse" />
              LIVE WORK ORDER SYSTEM
            </span>
          </div>
          <p className="mt-2 text-[13px] text-slate-500 font-normal">
            {blocking.length} out-of-service rooms · {tickets.filter((t) => t.status === 'open').length} open tickets
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrimaryButton onClick={() => setCreateOpen(true)}>
            <PlusIcon aria-hidden="true" className="h-4 w-4" />
            New ticket
          </PrimaryButton>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              TOTAL TICKETS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-xs">
              <WrenchIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {tickets.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">All Time</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              OPEN TICKETS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800 shadow-xs">
              <WrenchIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {tickets.filter((t) => t.status === 'open').length}
            </span>
            <span className="text-xs font-semibold text-blue-700">Active</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              BLOCKING ROOMS
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-800 shadow-xs">
              <AlertTriangleIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {blocking.length}
            </span>
            <span className="text-xs font-semibold text-red-600">Out of Service</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              RESOLVED
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dcfce7] text-[#176938] shadow-xs">
              <WrenchIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {tickets.filter((t) => t.status === 'resolved').length}
            </span>
            <span className="text-xs font-semibold text-[#176938]">Completed</span>
          </div>
        </div>
      </div>

      {blocking.some((ticket) => ticket.priority === 'urgent') ?
      <div className="mb-5 flex items-start gap-3 rounded-card border border-[#f3ceca] bg-[#fdeceb] px-4 py-3">
          <AlertTriangleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#b3312a]" />
          <p className="text-[12px] text-[#b3312a]">
            Urgent unresolved work orders are raising critical operational alerts and blocking room sale.
          </p>
        </div> :
      null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          tabs={[
          { id: 'all', label: 'All', count: tickets.length },
          { id: 'open', label: 'Open', count: counts.open ?? 0 },
          { id: 'in-progress', label: 'In progress', count: counts['in-progress'] ?? 0 },
          { id: 'awaiting-parts', label: 'Awaiting parts', count: counts['awaiting-parts'] ?? 0 },
          { id: 'resolved', label: 'Resolved', count: counts.resolved ?? 0 }]
          }
          active={status}
          onChange={(next) => setStatus(next as 'all' | TicketStatus)} />
        
        <SelectInput
          value={priority}
          onChange={(event) => setPriority(event.target.value as 'all' | TicketPriority)}
          className="w-[170px]"
          aria-label="Filter by priority">
          
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </SelectInput>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="glass-card-premium p-0 border border-slate-200/80 shadow-md backdrop-blur-md rounded-2xl overflow-hidden">
          <CardHeader title="Work orders" subtitle={`${list.length} in this view`} />
          {list.length === 0 ?
          <EmptyState title="No work orders" detail="Nothing matches the current filters." /> :

          <ul className="divide-y divide-line border-t border-line">
              {list.map((ticket) => {
              const room = getRoom(ticket.roomId);
              return (
                <li key={ticket.id}>
                    <button
                    type="button"
                    onClick={() => setSelectedId(ticket.id)}
                    aria-pressed={selected?.id === ticket.id}
                    className={[
                    'flex w-full flex-wrap items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150',
                    selected?.id === ticket.id ? 'bg-brand-50' : 'hover:bg-emerald-50/60'].
                    join(' ')}>
                    
                      <span className="w-[76px]">
                        <span className="tabular block text-[13px] font-semibold text-ink">
                          {room?.number ?? '—'}
                        </span>
                        <span className="block text-[11px] text-ink-muted">{ticket.code}</span>
                      </span>
                      <span className="min-w-[200px] flex-1">
                        <span className="block text-[13px] font-semibold text-ink">{ticket.title}</span>
                        <span className="block text-[11px] text-ink-muted">
                          Reported {shortDate(ticket.createdAt)} by {ticket.reportedBy}
                        </span>
                      </span>
                      <StatusPill tone={ticketPriorityTone[ticket.priority]} dot={false}>
                        {ticket.priority}
                      </StatusPill>
                      <StatusPill tone={ticketStatusTone[ticket.status]}>
                        {ticketStatusLabel[ticket.status]}
                      </StatusPill>
                      <span className="w-[120px] text-[11px] text-ink-muted">
                        {ticket.assignee ?? 'Unassigned'}
                      </span>
                    </button>
                  </li>);

            })}
            </ul>
          }
        </Card>

        <div className="space-y-5">
          {selected ?
          <>
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                      {selected.code}
                    </p>
                    <h2 className="mt-1 text-[16px] font-bold tracking-tight text-ink">
                      {selected.title}
                    </h2>
                  </div>
                  <StatusPill tone={ticketStatusTone[selected.status]}>
                    {ticketStatusLabel[selected.status]}
                  </StatusPill>
                </div>
                <p className="mt-3 text-[12px] text-ink-soft">{selected.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <KeyValue label="Room" value={selectedRoom ? `Room ${selectedRoom.number}` : '—'} />
                  <KeyValue label="Priority" value={selected.priority} />
                  <KeyValue label="Reported" value={shortDate(selected.createdAt)} />
                  <KeyValue label="Blocks sale" value={selected.blocksSale ? 'Yes' : 'No'} />
                </div>
                {selectedRoom ?
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                    <span className="text-[12px] text-ink-muted">Room status</span>
                    <StatusPill tone={roomStatusTone[ops.statusByRoom[selectedRoom.id]]}>
                      {roomStatusLabel[ops.statusByRoom[selectedRoom.id]]}
                    </StatusPill>
                  </div> :
              null}
              </Card>

              <Card className="p-5">
                <h2 className="text-[15px] font-semibold tracking-tight text-ink">Update work order</h2>
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-ink-soft">
                      Assigned technician
                    </span>
                    <SelectInput
                    value={selected.assignee ?? ''}
                    onChange={(event) =>
                    updateTicket(selected.id, { assignee: event.target.value || null })
                    }>
                    
                      <option value="">Unassigned</option>
                      {technicianOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </SelectInput>
                  </label>

                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold text-ink-soft">Workflow</p>
                    <div className="grid grid-cols-2 gap-2">
                      {FLOW.map((step) =>
                    <SecondaryButton
                      key={step}
                      className={[
                      'px-3 py-2',
                      selected.status === step ? 'border-brand-400 bg-brand-50' : ''].
                      join(' ')}
                      onClick={() => updateTicket(selected.id, { status: step })}>
                      
                          {ticketStatusLabel[step]}
                        </SecondaryButton>
                    )}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
                    <input
                    type="checkbox"
                    checked={selected.blocksSale}
                    onChange={(event) =>
                    updateTicket(selected.id, { blocksSale: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400" />
                  
                    <span className="text-[12px] text-ink">
                      Remove room from sellable inventory while open
                    </span>
                  </label>

                  {selected.status !== 'resolved' ?
                <PrimaryButton
                  className="w-full"
                  onClick={() => updateTicket(selected.id, { status: 'resolved' })}>
                  
                      Mark resolved
                    </PrimaryButton> :
                null}
                </div>
              </Card>
            </> :
          null}
        </div>
      </div>

      <Modal
        open={createOpen}
        title="Create Maintenance Ticket"
        subtitle="Report an issue or work order for a room."
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <SecondaryButton onClick={() => setCreateOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton gradient onClick={handleCreateTicket}>
              Create Ticket
            </PrimaryButton>
          </>
        }
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <Field label="Target Room">
            <SelectInput value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)}>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.number} ({r.type} · Floor {r.floor})
                </option>
              ))}
            </SelectInput>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <SelectInput
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
              >
                <option value="HVAC">HVAC / AC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Appliance">Appliance</option>
                <option value="Other">Other</option>
              </SelectInput>
            </Field>

            <Field label="Priority">
              <SelectInput
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </SelectInput>
            </Field>
          </div>

          <Field label="Issue Description">
            <TextArea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe the maintenance issue or work required…"
              required
            />
          </Field>
        </form>
      </Modal>
    </div>);
}