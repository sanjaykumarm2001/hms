import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BedDoubleIcon,
  CreditCardIcon,
  KeyRoundIcon,
  MinusIcon,
  PlusIcon,
  ScanLineIcon,
  UserCheckIcon } from
'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { Card, Page, PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Field, Input, Select } from '../components/ui/Field';
import { Badge, HousekeepingBadge } from '../components/ui/Badge';
import { RoomPicker } from '../components/workflows/RoomPicker';
import { longDate, money, nights } from '../utils/format';
import { paymentMethods, property, roomTypeName } from '../data/property';
import type { PaymentMethod } from '../types';

const idTypes = ['Passport', 'National ID', "Driver's License", 'Residence Permit'];

export function CheckIn() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { reservationById, guestById, roomById, folio, checkIn } = useHotel();
  const reservation = reservationById(id);
  const guest = reservation ? guestById(reservation.guestId) : undefined;

  const [roomId, setRoomId] = useState<string | null>(reservation?.roomId ?? null);
  const [firstName, setFirstName] = useState(guest?.firstName ?? '');
  const [lastName, setLastName] = useState(guest?.lastName ?? '');
  const [phone, setPhone] = useState(guest?.phone ?? '');
  const [email, setEmail] = useState(guest?.email ?? '');
  const [idType, setIdType] = useState(guest?.idType ?? 'Passport');
  const [idNumber, setIdNumber] = useState(guest?.idNumber ?? '');
  const [regForm, setRegForm] = useState<'standard' | 'form_c'>('standard');
  const [keyCards, setKeyCards] = useState(reservation?.keyCards ?? 1);
  const [companion, setCompanion] = useState('');
  const [accompanying, setAccompanying] = useState<string[]>(
    reservation?.accompanying ?? []
  );
  const [deposit, setDeposit] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>('visa');

  if (!reservation || !guest) {
    return (
      <Page>
        <PageHeader title="Reservation not found" />
        <Link to="/front-desk">
          <Button variant="primary">Back to front desk</Button>
        </Link>
      </Page>);

  }

  const room = roomById(roomId);
  const f = folio(reservation.id);
  const stay = nights(reservation.arrival, reservation.departure);
  const roomTotal = reservation.rate * stay;
  const dueNow = f.chargeTotal > 0 ? f.balance : roomTotal - f.paidTotal;
  const ready =
  room && (room.housekeeping === 'inspected' || room.housekeeping === 'clean');
  const missingId = !idNumber.trim();

  const complete = () => {
    if (!roomId) {
      toast.error('Assign a room before completing check-in');
      return;
    }
    if (missingId) {
      toast.error('Capture the guest ID document to continue');
      return;
    }
    checkIn({
      reservationId: reservation.id,
      roomId,
      keyCards,
      accompanying,
      depositAmount: deposit,
      method,
      idType,
      idNumber: idNumber.trim()
    });
    navigate(`/bookings/${reservation.id}`);
  };

  return (
    <Page>
      <PageHeader
        eyebrow="Front desk operations"
        title="Express Check-In"
        subtitle={`Arrival window opens ${property.checkIn} · ${roomTypeName(reservation.roomType)}`}
        actions={
        <>
            <Button onClick={() => toast.success('Reservation barcode scanned')}>
              <ScanLineIcon className="h-4 w-4" /> Scan reservation
            </Button>
            <Button
            onClick={() => {
              setIdNumber(`SCN${Math.floor(100000 + Math.random() * 899999)}`);
              toast.success('ID document captured from scanner');
            }}>
            
              <UserCheckIcon className="h-4 w-4" /> Scan ID
            </Button>
          </>
        } />
      

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-4 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-ink-muted">
              <BedDoubleIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                #{reservation.confirmation}
                <Badge tone="neutral">{reservation.source.toUpperCase()}</Badge>
              </p>
              <p className="text-[12px] text-ink-muted">
                {roomTypeName(reservation.roomType)} ·{' '}
                {room ? `Room ${room.number}` : 'Room not assigned'} · {stay} night
                {stay > 1 ? 's' : ''}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[11px] font-medium text-ink-faint">Arrival</p>
              <p className="text-[13px] font-semibold text-ink">
                {longDate(reservation.arrival)}, {property.checkIn}
              </p>
            </div>
          </div>

          <Card
            title="Guest identity"
            action={
            missingId ?
            <Badge tone="red">Missing ID</Badge> :

            <Badge tone="green">Verified</Badge>

            }>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" required>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} />
                
              </Field>
              <Field label="Last name" required>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)} />
                
              </Field>
              <Field label="Phone number">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} />
                
              </Field>
              <Field label="ID document type" required>
                <Select value={idType} onChange={(e) => setIdType(e.target.value)}>
                  {idTypes.map((t) =>
                  <option key={t} value={t}>
                      {t}
                    </option>
                  )}
                </Select>
              </Field>
              <Field label="ID number" required>
                <Input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Scan or enter manually" />
                
              </Field>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Regulatory report">
              <div className="space-y-2">
                {[
                {
                  id: 'standard' as const,
                  label: 'Standard (Domestic)',
                  detail: 'Standard reporting guidelines'
                },
                {
                  id: 'form_c' as const,
                  label: 'Form-C (Foreign National)',
                  detail: 'Requires visa entry details'
                }].
                map((option) =>
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRegForm(option.id)}
                  aria-pressed={regForm === option.id}
                  className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors duration-150 ease-out ${
                  regForm === option.id ?
                  'border-brand-500 bg-brand-50' :
                  'border-line hover:bg-slate-50'}`
                  }>
                  
                    <span
                    className={`mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                    regForm === option.id ?
                    'border-brand-600 bg-brand-600' :
                    'border-line bg-white'}`
                    }>
                    
                      {regForm === option.id &&
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    }
                    </span>
                    <span>
                      <span className="block text-[13px] font-medium text-ink">
                        {option.label}
                      </span>
                      <span className="block text-[11px] text-ink-faint">
                        {option.detail}
                      </span>
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-4 border-t border-line pt-4">
                <Field label="Accompanying guests">
                  <div className="flex gap-2">
                    <Input
                      value={companion}
                      onChange={(e) => setCompanion(e.target.value)}
                      placeholder="Full name" />
                    
                    <Button
                      onClick={() => {
                        if (!companion.trim()) return;
                        setAccompanying((prev) => [...prev, companion.trim()]);
                        setCompanion('');
                      }}>
                      
                      Add
                    </Button>
                  </div>
                </Field>
                {accompanying.length > 0 &&
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {accompanying.map((name) =>
                  <button
                    key={name}
                    type="button"
                    onClick={() =>
                    setAccompanying((prev) => prev.filter((n) => n !== name))
                    }
                    className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-slate-200">
                    
                        {name} ×
                      </button>
                  )}
                  </div>
                }
              </div>
            </Card>

            <Card
              title="Advance payment"
              action={
              dueNow > 0 ?
              <Badge tone="amber">Pending</Badge> :

              <Badge tone="green">Prepaid</Badge>

              }>
              
              <dl className="space-y-2">
                <div className="flex justify-between text-[13px]">
                  <dt className="text-ink-muted">Room &amp; tax</dt>
                  <dd className="tabular font-medium text-ink">{money(roomTotal)}</dd>
                </div>
                <div className="flex justify-between text-[13px]">
                  <dt className="text-ink-muted">Payments on file</dt>
                  <dd className="tabular font-medium text-emerald-700">
                    −{money(f.paidTotal)}
                  </dd>
                </div>
              </dl>
              <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
                <span className="text-[12px] text-ink-muted">Total due</span>
                <span className="tabular text-[24px] font-semibold text-ink">
                  {money(Math.max(0, dueNow))}
                </span>
              </div>
              <Field label="Deposit to collect now" className="mt-3">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))} />
                
              </Field>
              <div className="mt-3 flex gap-2">
                {(
                [
                { id: 'visa', label: 'Card' },
                { id: 'cash', label: 'Cash' },
                { id: 'bank_transfer', label: 'Digital' }] as
                {id: PaymentMethod;label: string;}[]).
                map((option) =>
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMethod(option.id)}
                  aria-pressed={method === option.id}
                  className={`flex-1 rounded-lg border px-3 py-2 text-[12px] font-medium transition-colors duration-150 ease-out ${
                  method === option.id ?
                  'border-brand-500 bg-brand-50 text-brand-700' :
                  'border-line text-ink-muted hover:bg-slate-50'}`
                  }>
                  
                    {option.label}
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] text-ink-faint">
                Settlement method:{' '}
                {paymentMethods.find((m) => m.id === method)?.label}
              </p>
            </Card>
          </div>

          <Card
            title="Room assignment"
            action={
            room ?
            <div className="flex items-center gap-2">
                  <HousekeepingBadge status={room.housekeeping} />
                  {!ready && <Badge tone="amber">Not ready</Badge>}
                </div> :

            <Badge tone="red">No room</Badge>

            }>
            
            <RoomPicker
              preferredType={reservation.roomType}
              selectedRoomId={roomId}
              onSelect={setRoomId} />
            
          </Card>
        </div>

        {/* Key encoder — the terminal-side device panel. */}
        <aside className="space-y-4">
          <section className="rounded-xl bg-slate-900 p-4 text-white shadow-card">
            <header className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-[13px] font-semibold">
                <KeyRoundIcon className="h-4 w-4" /> Key encoder
              </h2>
              <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> USB active
              </span>
            </header>

            <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <div className="h-24 w-36 rounded-lg bg-white/90 p-2">
                <div className="h-2 w-10 rounded bg-slate-300" />
                <div className="mt-2 h-1.5 w-16 rounded bg-slate-200" />
                <div className="mt-6 flex justify-end">
                  <span className="h-6 w-9 rounded bg-amber-300" />
                </div>
              </div>
            </div>

            <p className="mt-4 text-[12px] text-white/70">
              {room ?
              `Ready to encode card for room ${room.number}` :
              'Assign a room to enable encoding'}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12px] text-white/70">Copies</span>
              <div className="flex items-center gap-2 rounded-lg bg-white/10 p-1">
                <button
                  type="button"
                  aria-label="Fewer keycards"
                  onClick={() => setKeyCards((v) => Math.max(1, v - 1))}
                  className="rounded p-1 text-white/80 transition-colors duration-150 ease-out hover:bg-white/10">
                  
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <span className="tabular w-5 text-center text-[13px] font-semibold">
                  {keyCards}
                </span>
                <button
                  type="button"
                  aria-label="More keycards"
                  onClick={() => setKeyCards((v) => Math.min(4, v + 1))}
                  className="rounded p-1 text-white/80 transition-colors duration-150 ease-out hover:bg-white/10">
                  
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="mt-4 w-full"
              disabled={!room}
              onClick={() =>
              toast.success(
                `${keyCards} keycard${keyCards > 1 ? 's' : ''} encoded for room ${room?.number}`
              )
              }>
              
              <CreditCardIcon className="h-4 w-4" /> Encode keycard
            </Button>
          </section>

          <Card title="Complete check-in">
            <ul className="space-y-2 text-[12px]">
              {[
              { label: 'Room assigned', done: Boolean(roomId) },
              { label: 'Room ready for arrival', done: Boolean(ready) },
              { label: 'ID document captured', done: !missingId },
              { label: 'Payment method selected', done: true }].
              map((step) =>
              <li key={step.label} className="flex items-center gap-2">
                  <span
                  className={`h-1.5 w-1.5 rounded-full ${
                  step.done ? 'bg-emerald-500' : 'bg-amber-500'}`
                  } />
                
                  <span className={step.done ? 'text-ink-muted' : 'text-ink'}>
                    {step.label}
                  </span>
                </li>
              )}
            </ul>
            <Button
              variant="primary"
              size="lg"
              className="mt-4 w-full"
              onClick={complete}>
              
              Complete check-in
            </Button>
            <Link to={`/bookings/${reservation.id}`} className="mt-2 block">
              <Button className="w-full">Back to reservation</Button>
            </Link>
          </Card>
        </aside>
      </div>
    </Page>);

}