import React, { useState } from 'react';
import { BedDoubleIcon, CreditCardIcon, MinusIcon, PlusIcon, ScanLineIcon, ShieldIcon, WifiIcon } from 'lucide-react';
import { Card, PageHeader, SecondaryButton } from '../components/ui';

const reportOptions = [
{ id: 'standard', title: 'Standard (Domestic)', detail: 'Standard reporting guidelines' },
{ id: 'form-c', title: 'Form-C (Foreign National)', detail: 'Requires visa details' }];


export function FrontDesk() {
  const [report, setReport] = useState('standard');
  const [copies, setCopies] = useState(1);
  const [method, setMethod] = useState('Card');
  const [encoding, setEncoding] = useState(false);

  return (
    <div>
      <PageHeader
        eyebrow="Front Desk Operations"
        title="Express Check-Out"
        actions={
        <>
            <SecondaryButton>
              <ScanLineIcon aria-hidden="true" className="h-4 w-4" />
              Scan Reservation
            </SecondaryButton>
            <SecondaryButton>
              <ShieldIcon aria-hidden="true" className="h-4 w-4" />
              Scan ID
            </SecondaryButton>
          </>
        } />
      

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_296px]">
        <div className="min-w-0 space-y-4">
          <Card className="relative overflow-hidden p-4 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand-gradient-v">
            <div className="flex flex-wrap items-center justify-between gap-4 pl-2">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                  <BedDoubleIcon aria-hidden="true" className="h-4 w-4 text-brand-700" />
                </span>
                <div>
                  <p className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-ink">
                    RES-88921-A
                    <span className="rounded bg-[#f1f2ef] px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-soft">
                      Walk-in
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">Deluxe King • Room 402 • 2 Nights</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-ink-muted">Arrival</p>
                <p className="tabular text-[13px] font-semibold text-ink">Oct 24, 14:00</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">Guest Identity</h2>
              <span className="rounded bg-[#fdeceb] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#b3312a]">
                Missing ID
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
              { id: 'first', label: 'First Name *', value: 'Eleanor' },
              { id: 'last', label: 'Last Name *', value: 'Vance' },
              { id: 'phone', label: 'Phone Number', value: '+1 (555) 019-8233' },
              { id: 'email', label: 'Email', value: 'e.vance@example.com' }].
              map((field) =>
              <div key={field.id}>
                  <label htmlFor={field.id} className="text-[11px] font-medium text-ink-soft">
                    {field.label}
                  </label>
                  <input
                  id={field.id}
                  defaultValue={field.value}
                  className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-ink focus:border-brand-500 focus:outline-none" />
                
                </div>
              )}

              <div>
                <label htmlFor="id-type" className="text-[11px] font-medium text-ink-soft">
                  ID Document Type
                </label>
                <select
                  id="id-type"
                  className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-ink focus:border-brand-500 focus:outline-none">
                  
                  <option>Passport</option>
                  <option>Driver&apos;s License</option>
                  <option>National ID</option>
                </select>
              </div>
              <div>
                <label htmlFor="id-number" className="text-[11px] font-medium text-ink-soft">
                  ID Number
                </label>
                <input
                  id="id-number"
                  placeholder="Scan or enter manually"
                  className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none" />
                
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink">
                <ShieldIcon aria-hidden="true" className="h-4 w-4 text-ink-muted" />
                Regulatory Report
              </h2>
              <fieldset className="mt-4 space-y-3">
                <legend className="sr-only">Reporting format</legend>
                {reportOptions.map((option) => {
                  const selected = report === option.id;
                  return (
                    <label
                      key={option.id}
                      className={[
                      'relative flex cursor-pointer gap-3 overflow-hidden rounded-lg border px-3 py-3 transition-colors duration-150',
                      selected ? 'border-brand-300 bg-brand-50' : 'border-line bg-white hover:bg-canvas'].
                      join(' ')}>
                      
                      {selected ? <span className="absolute inset-y-0 left-0 w-1 bg-brand-gradient-v" aria-hidden="true" /> : null}
                      <input
                        type="radio"
                        name="report"
                        value={option.id}
                        checked={selected}
                        onChange={() => setReport(option.id)}
                        className="mt-0.5 h-4 w-4 border-line text-brand-600 focus:ring-brand-500" />
                      
                      <span>
                        <span className="block text-[13px] font-semibold text-ink">{option.title}</span>
                        <span className="block text-[11px] text-ink-muted">{option.detail}</span>
                      </span>
                    </label>);

                })}
              </fieldset>
            </Card>

            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink">
                  <CreditCardIcon aria-hidden="true" className="h-4 w-4 text-ink-muted" />
                  Advance Payment
                </h2>
                <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-800">
                  Pending
                </span>
              </div>

              <dl className="mt-4 space-y-2.5 text-[12px]">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Room &amp; Tax</dt>
                  <dd className="tabular font-semibold text-ink">$450.00</dd>
                </div>
                <div className="flex justify-between border-b border-line pb-3">
                  <dt className="text-ink-soft">Incidental Hold</dt>
                  <dd className="tabular font-semibold text-ink">$100.00</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-end justify-between">
                <span className="text-[14px] font-semibold text-ink">Total Due</span>
                <span className="tabular text-[26px] font-bold leading-none tracking-tight text-ink">$550.00</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {['Card', 'Cash', 'Digital'].map((m) =>
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  aria-pressed={method === m}
                  className={[
                  'rounded-lg px-3 py-2 text-[12px] font-semibold transition-colors duration-150',
                  method === m ?
                  'bg-brand-600 text-white' :
                  'border border-line bg-white text-ink hover:bg-canvas'].
                  join(' ')}>
                  
                    {m}
                  </button>
                )}
              </div>
            </Card>
          </div>
        </div>

        <section className="h-fit rounded-card bg-panel p-5 shadow-panel">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight text-white">Key Encoder</h2>
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              USB Active
            </span>
          </div>

          <div className="mt-4 rounded-lg bg-white p-4">
            <div className="flex items-start justify-between">
              <WifiIcon aria-hidden="true" className="h-4 w-4 rotate-45 text-ink-muted" />
              <span className="flex h-6 w-8 items-center justify-center rounded bg-brand-gradient text-[8px] font-bold text-white">
                402
              </span>
            </div>
            <div className="mt-14 space-y-1.5">
              <span className="block h-1.5 w-full rounded-full bg-[#eceee8]" />
              <span className="block h-1.5 w-2/3 rounded-full bg-[#eceee8]" />
            </div>
          </div>

          <p className="mt-4 text-[12px] text-white/70">Ready to encode card for Room 402</p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12px] text-white/70">Copies</span>
            <div className="flex items-center gap-1 rounded-lg bg-white/10 p-1">
              <button
                type="button"
                aria-label="Decrease copies"
                onClick={() => setCopies((c) => Math.max(1, c - 1))}
                className="flex h-6 w-6 items-center justify-center rounded text-white/80 transition-colors duration-150 hover:bg-white/10">
                
                <MinusIcon aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
              <span className="tabular w-6 text-center text-[13px] font-semibold text-white">{copies}</span>
              <button
                type="button"
                aria-label="Increase copies"
                onClick={() => setCopies((c) => Math.min(4, c + 1))}
                className="flex h-6 w-6 items-center justify-center rounded text-white/80 transition-colors duration-150 hover:bg-white/10">
                
                <PlusIcon aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEncoding(true);
              window.setTimeout(() => setEncoding(false), 1200);
            }}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient text-[13px] font-semibold text-white transition-[filter] duration-150 hover:brightness-[1.06]">
            
            <CreditCardIcon aria-hidden="true" className="h-4 w-4" />
            {encoding ? 'Encoding…' : 'Encode Keycard'}
          </button>
        </section>
      </div>
    </div>);

}