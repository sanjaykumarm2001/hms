import React, { useState } from 'react';
import { Card, CardHeader, Field, PageHeader, PrimaryButton, SelectInput, StatusPill, TextInput } from '../components/ui';
import { useHotel } from '../contexts/HotelContext';
import { money } from '../utils/format';

export function Settings() {
  const { settings, updateSettings, ops } = useHotel();
  const [draft, setDraft] = useState(settings);

  function save() {
    updateSettings(draft);
  }

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Settings"
        subtitle="Property configuration used across reservations, rates, folios and guest communication."
        actions={<PrimaryButton gradient onClick={save}>Save changes</PrimaryButton>} />
      

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Property details</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Property name" className="sm:col-span-2">
              <TextInput
                value={draft.propertyName}
                onChange={(event) => setDraft({ ...draft, propertyName: event.target.value })} />
              
            </Field>
            <Field label="Property code">
              <TextInput
                value={draft.propertyCode}
                onChange={(event) => setDraft({ ...draft, propertyCode: event.target.value })} />
              
            </Field>
            <Field label="Currency">
              <SelectInput
                value={draft.currency}
                onChange={(event) => setDraft({ ...draft, currency: event.target.value })}>
                
                {['USD', 'EUR', 'GBP', 'AED'].map((value) =>
                <option key={value} value={value}>
                    {value}
                  </option>
                )}
              </SelectInput>
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <TextInput
                value={draft.address}
                onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
              
            </Field>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Operating times</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Check-in from">
              <TextInput
                type="time"
                value={draft.checkInTime}
                onChange={(event) => setDraft({ ...draft, checkInTime: event.target.value })} />
              
            </Field>
            <Field label="Check-out by">
              <TextInput
                type="time"
                value={draft.checkOutTime}
                onChange={(event) => setDraft({ ...draft, checkOutTime: event.target.value })} />
              
            </Field>
            <Field label="Night audit">
              <TextInput
                type="time"
                value={draft.auditTime}
                onChange={(event) => setDraft({ ...draft, auditTime: event.target.value })} />
              
            </Field>
          </div>
          <p className="mt-4 rounded-lg bg-canvas px-3 py-2.5 text-[12px] text-ink-soft">
            {ops.departures.length} departures are measured against the {draft.checkOutTime} checkout
            time for late-departure alerts.
          </p>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Room types & rates" subtitle="Base rates drive new reservation pricing" />
          <table className="w-full border-t border-line text-left">
            <thead>
              <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Room type</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Max occupancy</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Rooms</th>
                <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Base rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {draft.roomTypes.map((type, index) =>
              <tr key={type.name}>
                  <td className="py-2.5 pl-5 pr-3 text-[13px] font-semibold text-ink">{type.name}</td>
                  <td className="tabular px-3 py-2.5 text-[12px] text-ink-soft">{type.maxOccupancy}</td>
                  <td className="tabular px-3 py-2.5 text-[12px] text-ink-soft">{type.count}</td>
                  <td className="px-3 py-2.5 pr-5 text-right">
                    <TextInput
                    type="number"
                    min={0}
                    value={type.baseRate}
                    aria-label={`${type.name} base rate`}
                    className="ml-auto h-9 w-[110px] text-right"
                    onChange={(event) => {
                      const next = [...draft.roomTypes];
                      next[index] = { ...type, baseRate: Number(event.target.value) };
                      setDraft({ ...draft, roomTypes: next });
                    }} />
                  
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Cancellation & deposits</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Free cancellation window (hours)">
              <TextInput
                type="number"
                min={0}
                value={draft.cancellationWindowHours}
                onChange={(event) =>
                setDraft({ ...draft, cancellationWindowHours: Number(event.target.value) })
                } />
              
            </Field>
            <Field label="Late cancellation fee (%)">
              <TextInput
                type="number"
                min={0}
                max={100}
                value={draft.cancellationFeePercent}
                onChange={(event) =>
                setDraft({ ...draft, cancellationFeePercent: Number(event.target.value) })
                } />
              
            </Field>
            <Field label="Deposit at check-in (%)">
              <TextInput
                type="number"
                min={0}
                max={100}
                value={draft.depositPercent}
                onChange={(event) => setDraft({ ...draft, depositPercent: Number(event.target.value) })} />
              
            </Field>
            <div className="flex items-end">
              <label className="flex w-full items-center gap-3 rounded-lg border border-line px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={draft.depositRequired}
                  onChange={(event) => setDraft({ ...draft, depositRequired: event.target.checked })}
                  className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400" />
                
                <span className="text-[12px] text-ink">Deposit required for new arrivals</span>
              </label>
            </div>
          </div>
          <p className="mt-4 text-[12px] text-ink-muted">
            A {draft.depositPercent}% deposit on an average 3-night Deluxe stay is about{' '}
            {money((draft.roomTypes[1]?.baseRate ?? 0) * 3 * draft.depositPercent / 100)}.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Guest communication</h2>
          <div className="mt-4 space-y-2">
            {[
            { key: 'confirmationEmail' as const, label: 'Send booking confirmation email' },
            { key: 'preArrivalEmail' as const, label: 'Send pre-arrival email 24h before check-in' },
            { key: 'departureSurvey' as const, label: 'Send post-departure survey' }].
            map((item) =>
            <label
              key={item.key}
              className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5">
              
                <input
                type="checkbox"
                checked={draft[item.key]}
                onChange={(event) => setDraft({ ...draft, [item.key]: event.target.checked })}
                className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400" />
              
                <span className="text-[12px] text-ink">{item.label}</span>
              </label>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">System access</h2>
          <p className="mt-1 text-[12px] text-ink-muted">
            This build runs entirely in the browser — data resets on refresh and no external systems are
            connected.
          </p>
          <ul className="mt-4 space-y-2">
            {[
            { label: 'Property management state', status: 'Active', tone: 'green' as const },
            { label: 'Backend API & database', status: 'Not connected', tone: 'gray' as const },
            { label: 'Payment gateway', status: 'Not connected', tone: 'gray' as const },
            { label: 'Key card encoder', status: 'Not connected', tone: 'gray' as const },
            { label: 'User management & roles', status: 'Prototype', tone: 'amber' as const }].
            map((item) =>
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
              
                <span className="text-[12px] text-ink">{item.label}</span>
                <StatusPill tone={item.tone}>{item.status}</StatusPill>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>);

}