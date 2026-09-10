import React, { useState } from 'react';
import { Card, PageHeader, PrimaryButton, ProgressBar, SecondaryButton } from '../components/ui';

const ratePlans = [
{ code: 'BAR', name: 'Best Available Rate', rate: 245, channels: 'All channels', active: true },
{ code: 'CORP-MER', name: 'Meridian Corporate', rate: 199, channels: 'Direct, GDS', active: true },
{ code: 'ADV-14', name: 'Advance Purchase 14', rate: 178, channels: 'OTA', active: true },
{ code: 'GRP-WED', name: 'Wedding Group Block', rate: 165, channels: 'Direct', active: false }];


const integrations = [
{ name: 'Booking.com', detail: 'Channel manager · 2-way sync', enabled: true },
{ name: 'Agoda', detail: 'Channel manager · rates only', enabled: true },
{ name: 'Assa Abloy Locks', detail: 'Keycard encoding service', enabled: true },
{ name: 'Stripe Terminal', detail: 'Card present payments', enabled: false }];


export function Config() {
  const [enabled, setEnabled] = useState(integrations.map((i) => i.enabled));

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Property Configuration"
        subtitle="Rate plans, room inventory, and connected operational services."
        actions={
        <>
            <SecondaryButton>Discard</SecondaryButton>
            <PrimaryButton>Save changes</PrimaryButton>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_296px]">
        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <div className="px-5 py-4">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Rate Plans</h2>
              <p className="mt-0.5 text-[12px] text-ink-muted">Applied to all 120 rooms unless overridden.</p>
            </div>
            <table className="w-full border-t border-line text-left">
              <thead>
                <tr className="bg-[#fafbf8] text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  <th scope="col" className="py-2.5 pl-5 pr-3 font-semibold">Code</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Plan</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Channels</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-2.5 pr-5 text-right font-semibold">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ratePlans.map((plan) =>
                <tr key={plan.code} className="transition-colors duration-150 hover:bg-[#fafbf8]">
                    <td className="py-3 pl-5 pr-3 text-[12px] font-bold text-ink">{plan.code}</td>
                    <td className="px-3 py-3 text-[12px] text-ink-soft">{plan.name}</td>
                    <td className="px-3 py-3 text-[12px] text-ink-soft">{plan.channels}</td>
                    <td className="px-3 py-3">
                      <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      plan.active ? 'bg-brand-50 text-brand-800' : 'bg-[#f1f2ef] text-ink-soft'}`
                      }>
                      
                        <span className={`h-1.5 w-1.5 rounded-full ${plan.active ? 'bg-brand-600' : 'bg-[#9ca3af]'}`} />
                        {plan.active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="tabular px-3 py-3 pr-5 text-right text-[13px] font-bold text-ink">${plan.rate}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Connected Services</h2>
            <ul className="mt-4 divide-y divide-line">
              {integrations.map((integration, index) =>
              <li key={integration.name} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{integration.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">{integration.detail}</p>
                  </div>
                  <button
                  type="button"
                  role="switch"
                  aria-checked={enabled[index]}
                  aria-label={`Toggle ${integration.name}`}
                  onClick={() =>
                  setEnabled((prev) => prev.map((value, i) => i === index ? !value : value))
                  }
                  className={[
                  'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150',
                  enabled[index] ? 'bg-brand-600' : 'bg-[#dfe2db]'].
                  join(' ')}>
                  
                    <span
                    className={[
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform duration-150 ease-out',
                    enabled[index] ? 'translate-x-[22px]' : 'translate-x-0.5'].
                    join(' ')} />
                  
                  </button>
                </li>
              )}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="relative overflow-hidden bg-brand-wash p-5 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand-gradient-v">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Inventory Health</h2>
            <p className="mt-2 text-[12px] text-ink-soft">117 of 120 rooms sellable today.</p>
            <ProgressBar className="mt-4" value={97.5} label="Sellable inventory" />
            <p className="mt-3 text-[11px] text-ink-muted">3 rooms out of order — HVAC works on Floor 1.</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Property Details</h2>
            <dl className="mt-4 space-y-3 text-[12px]">
              {[
              ['Property', 'Meridian Grand · 04'],
              ['Time zone', 'GMT-05:00 (EST)'],
              ['Check-in', '15:00'],
              ['Check-out', '11:00'],
              ['Currency', 'USD ($)']].
              map(([label, value]) =>
              <div key={label} className="flex justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="font-semibold text-ink">{value}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </div>);

}