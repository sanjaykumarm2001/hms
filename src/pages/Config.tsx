import React, { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheckIcon } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Field';
import { Badge } from '../components/ui/Badge';
import { cancellationRules, property, roomTypes } from '../data/property';
import { money } from '../utils/format';

export function Config() {
  const { rooms, staff } = useHotel();
  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address);
  const [checkIn, setCheckIn] = useState(property.checkIn);
  const [checkOut, setCheckOut] = useState(property.checkOut);
  const [rule, setRule] = useState('std');
  const [depositPercent, setDepositPercent] = useState(25);
  const [comms, setComms] = useState({
    confirmation: true,
    preArrival: true,
    folioEmail: true,
    postStay: false
  });

  return (
    <Page>
      <PageHeader
        eyebrow="System"
        title="Property Configuration"
        subtitle="Rates, policies and communication defaults used across the property."
        actions={
        <Button
          variant="primary"
          onClick={() => toast.success('Configuration saved for this session')}>
          
            Save changes
          </Button>
        } />
      

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Property details">
          <div className="grid gap-3">
            <Field label="Property name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Address">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Check-in time">
                <Input
                  type="time"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)} />
                
              </Field>
              <Field label="Check-out time">
                <Input
                  type="time"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)} />
                
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Currency">
                <Input value={property.currency} readOnly />
              </Field>
              <Field label="Time zone">
                <Input value={property.timezone} readOnly />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="Room types & rates" padded={false}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                <th className="px-4 py-2.5">Type</th>
                <th className="px-2 py-2.5">Beds</th>
                <th className="px-2 py-2.5 text-right">Max</th>
                <th className="px-2 py-2.5 text-right">Rooms</th>
                <th className="px-4 py-2.5 text-right">Rack rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {roomTypes.map((type) =>
              <tr key={type.id}>
                  <td className="px-4 py-2.5">
                    <p className="text-[13px] font-medium text-ink">{type.name}</p>
                    <p className="text-[11px] text-ink-faint">{type.short}</p>
                  </td>
                  <td className="px-2 py-2.5 text-[12px] text-ink-muted">
                    {type.beds}
                  </td>
                  <td className="tabular px-2 py-2.5 text-right text-[13px] text-ink-muted">
                    {type.maxOccupancy}
                  </td>
                  <td className="tabular px-2 py-2.5 text-right text-[13px] text-ink-muted">
                    {rooms.filter((r) => r.type === type.id).length}
                  </td>
                  <td className="tabular px-4 py-2.5 text-right text-[13px] font-semibold text-ink">
                    {money(type.rate)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card title="Cancellation & deposit rules">
          <Field label="Default cancellation policy">
            <Select value={rule} onChange={(e) => setRule(e.target.value)}>
              {cancellationRules.map((r) =>
              <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              )}
            </Select>
          </Field>
          <p className="mt-1.5 text-[12px] text-ink-muted">
            {cancellationRules.find((r) => r.id === rule)?.detail}
          </p>
          <Field label="Deposit required at booking" className="mt-4">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={depositPercent}
                onChange={(e) => setDepositPercent(Number(e.target.value))}
                className="h-1.5 flex-1 accent-brand-600"
                aria-label="Deposit percentage" />
              
              <span className="tabular w-12 text-right text-[13px] font-semibold text-ink">
                {depositPercent}%
              </span>
            </div>
          </Field>
          <p className="mt-1.5 text-[12px] text-ink-muted">
            A {depositPercent}% deposit is requested on confirmed reservations; walk-ins
            settle in full at check-in.
          </p>
        </Card>

        <Card title="Guest communication">
          <ul className="space-y-2.5">
            {(
            [
            { id: 'confirmation', label: 'Booking confirmation email' },
            { id: 'preArrival', label: 'Pre-arrival reminder (24h before)' },
            { id: 'folioEmail', label: 'Email folio at check-out' },
            { id: 'postStay', label: 'Post-stay feedback request' }] as
            {id: keyof typeof comms;label: string;}[]).
            map((item) =>
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
              
                <span className="text-[13px] text-ink">{item.label}</span>
                <button
                type="button"
                role="switch"
                aria-checked={comms[item.id]}
                aria-label={item.label}
                onClick={() =>
                setComms((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                }
                className={`relative h-5 w-9 rounded-full transition-colors duration-150 ease-out ${
                comms[item.id] ? 'bg-brand-600' : 'bg-slate-200'}`
                }>
                
                  <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[left] duration-150 ease-out ${
                  comms[item.id] ? 'left-[18px]' : 'left-0.5'}`
                  } />
                
                </button>
              </li>
            )}
          </ul>
        </Card>

        <Card title="System access" className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
            <p className="text-[12px] text-ink-muted">
              Sentinel Access Layer v2.4 · session encrypted end to end. This prototype
              stores state in the browser only, so a refresh restores seed data.
            </p>
          </div>
          <table className="mt-4 w-full text-left">
            <thead>
              <tr className="border-b border-line text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                <th className="py-2">User</th>
                <th className="py-2">Role</th>
                <th className="py-2">Access level</th>
                <th className="py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {staff.map((member) =>
              <tr key={member.id}>
                  <td className="py-2.5 text-[13px] font-medium text-ink">
                    {member.name}
                  </td>
                  <td className="py-2.5 text-[12px] text-ink-muted">{member.role}</td>
                  <td className="py-2.5">
                    <Badge
                    tone={
                    member.department === 'management' ?
                    'violet' :
                    member.department === 'front_office' ?
                    'blue' :
                    'neutral'
                    }>
                    
                      {member.department === 'management' ?
                    'Full access' :
                    member.department === 'front_office' ?
                    'Front office' :
                    'Operations'}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right">
                    <Badge tone={member.onDuty ? 'green' : 'neutral'}>
                      {member.onDuty ? 'Active' : 'Idle'}
                    </Badge>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </Page>);

}