import React, { useMemo, useState } from 'react';
import { WrenchIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, EmptyState, Page, PageHeader } from '../components/layout/PageHeader';
import { Badge, PriorityBadge, TicketBadge } from '../components/ui/Badge';
import { Select } from '../components/ui/Field';
import { timeAgo } from '../utils/format';
import { roomTypeName } from '../data/property';
import type { TicketPriority, TicketStatus } from '../types';

export function Maintenance() {
  const { tickets, rooms, staff, updateTicket } = useHotel();
  const [status, setStatus] = useState<'all' | TicketStatus>('all');
  const [priority, setPriority] = useState<'all' | TicketPriority>('all');
  const technicians = staff.filter((s) => s.department === 'maintenance');

  const filtered = useMemo(
    () =>
    tickets.filter(
      (t) =>
      (status === 'all' || t.status === status) && (
      priority === 'all' || t.priority === priority)
    ),
    [tickets, status, priority]
  );

  const blocked = tickets.filter((t) => t.blocksSale && t.status !== 'resolved');

  return (
    <Page>
      <PageHeader
        eyebrow="Engineering"
        title="Work Orders"
        subtitle={`${tickets.filter((t) => t.status !== 'resolved').length} open · ${blocked.length} blocking room sales`} />
      

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus | 'all')}
              aria-label="Filter by status"
              className="w-auto">
              
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="awaiting_parts">Awaiting parts</option>
              <option value="resolved">Resolved</option>
            </Select>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority | 'all')}
              aria-label="Filter by priority"
              className="w-auto">
              
              <option value="all">All priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </Select>
          </div>

          {filtered.length === 0 ?
          <EmptyState icon={WrenchIcon} title="No work orders match" /> :

          <ul className="divide-y divide-line">
              {filtered.map((ticket) => {
              const room = rooms.find((r) => r.id === ticket.roomId);
              return (
                <li key={ticket.id} className="px-4 py-3.5">
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="tabular w-14 text-[15px] font-semibold text-ink">
                        {room?.number ?? '—'}
                      </span>
                      <div className="min-w-[220px] flex-1">
                        <p className="text-[13px] font-medium text-ink">
                          {ticket.title}
                        </p>
                        <p className="mt-0.5 text-[12px] text-ink-muted">
                          {ticket.detail}
                        </p>
                        <p className="mt-1 text-[11px] text-ink-faint">
                          {room ? roomTypeName(room.type) : ''} · raised{' '}
                          {timeAgo(ticket.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={ticket.priority} />
                        <TicketBadge status={ticket.status} />
                        {ticket.blocksSale && <Badge tone="red">Blocks sale</Badge>}
                      </div>
                      <div className="ml-auto grid gap-1.5">
                        <Select
                        aria-label={`Assign technician for ${ticket.title}`}
                        value={ticket.assignee ?? ''}
                        onChange={(e) =>
                        updateTicket(ticket.id, {
                          assignee: e.target.value || null
                        })
                        }
                        className="h-8 w-[170px] text-[12px]">
                        
                          <option value="">Unassigned</option>
                          {technicians.map((t) =>
                        <option key={t.id} value={t.name}>
                              {t.name}
                            </option>
                        )}
                        </Select>
                        <Select
                        aria-label={`Status for ${ticket.title}`}
                        value={ticket.status}
                        onChange={(e) =>
                        updateTicket(ticket.id, {
                          status: e.target.value as TicketStatus
                        })
                        }
                        className="h-8 w-[170px] text-[12px]">
                        
                          <option value="open">Open</option>
                          <option value="in_progress">In progress</option>
                          <option value="awaiting_parts">Awaiting parts</option>
                          <option value="resolved">Resolved</option>
                        </Select>
                      </div>
                    </div>
                  </li>);

            })}
            </ul>
          }
        </Card>

        <div className="space-y-4">
          <Card title="Blocked inventory">
            {blocked.length === 0 ?
            <EmptyState
              icon={WrenchIcon}
              title="Full inventory sellable"
              detail="No work order is currently holding a room out of sale." /> :


            <ul className="space-y-3">
                {blocked.map((ticket) => {
                const room = rooms.find((r) => r.id === ticket.roomId);
                return (
                  <li key={ticket.id} className="rounded-lg bg-red-50 p-3">
                      <p className="text-[13px] font-semibold text-red-900">
                        Room {room?.number}
                      </p>
                      <p className="text-[12px] text-red-800">{ticket.title}</p>
                      <p className="mt-1 text-[11px] text-red-700">
                        {ticket.assignee ?? 'Unassigned'} · {ticket.status}
                      </p>
                    </li>);

              })}
              </ul>
            }
          </Card>

          <Card title="Technicians on shift">
            <ul className="space-y-2.5">
              {technicians.map((t) =>
              <li key={t.id} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">
                      {t.name}
                    </span>
                    <span className="block text-[11px] text-ink-faint">
                      {t.shift} · {t.phone}
                    </span>
                  </span>
                  <Badge tone={t.onDuty ? 'green' : 'neutral'}>
                    {t.onDuty ? 'On duty' : 'Off shift'}
                  </Badge>
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </Page>);

}