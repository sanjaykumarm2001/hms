import React, { useEffect, useMemo, useState } from 'react';
import {
  BedDoubleIcon,
  CheckCircle2Icon,
  KeyIcon,
  PlusIcon,
  QrCodeIcon,
  UserCheckIcon,
  XIcon
} from 'lucide-react';
import {
  Field,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SelectInput,
  StatusPill,
  TextInput
} from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import type { PaymentMethod } from '../../types/hotel';
import { housekeepingLabel, housekeepingTone } from '../../utils/tone';
import { money, money0, nightsBetween } from '../../utils/format';

export function CheckInDialog({
  open,
  reservationId,
  onClose
}: {
  open: boolean;
  reservationId: string | null;
  onClose: () => void;
}) {
  const { getReservation, getGuest, rooms, ops, checkIn, updateGuest, folio } = useHotel();
  const reservation = reservationId ? getReservation(reservationId) : undefined;
  const guest = reservation ? getGuest(reservation.guestId) : undefined;

  // Guest Identity State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState('Passport');
  const [idNumber, setIdNumber] = useState('');

  // Regulatory & Accompanying State
  const [regulatoryReport, setRegulatoryReport] = useState<'standard' | 'form-c'>('standard');
  const [accompanying, setAccompanying] = useState<string[]>([]);
  const [accompanyingDraft, setAccompanyingDraft] = useState('');

  // Room Assignment State
  const [roomId, setRoomId] = useState<string>('');
  const [matchRoomType, setMatchRoomType] = useState(true);

  // Payment & Deposit State
  const [collectAdvance, setCollectAdvance] = useState(true);
  const [keyCards] = useState(2);
  const [deposit, setDeposit] = useState(0);
  const [paymentCategory, setPaymentCategory] = useState<'Card' | 'Cash' | 'Digital'>('Card');
  const [method, setMethod] = useState<PaymentMethod>('Visa');
  const [error, setError] = useState('');

  // Populate guest form values when dialog opens
  useEffect(() => {
    if (guest && open) {
      setFirstName(guest.firstName || '');
      setLastName(guest.lastName || '');
      setPhone(guest.phone || '');
      setEmail(guest.email || '');
      setIdType(guest.idType || 'Passport');
      setIdNumber(guest.idNumber || '');
    }
  }, [guest, open]);

  const activeRoomId = roomId || reservation?.roomId || '';
  const room = rooms.find((r) => r.id === activeRoomId);
  const roomReady = room ? room.housekeeping === 'clean' || room.housekeeping === 'inspected' : false;

  const candidates = useMemo(
    () =>
      rooms
        .filter(
          (r) =>
            ops.statusByRoom[r.id] === 'available' &&
            (!reservation || !matchRoomType || r.type === reservation.roomType || r.id === reservation.roomId)
        )
        .sort((a, b) => a.number.localeCompare(b.number)),
    [matchRoomType, ops.statusByRoom, reservation, rooms]
  );

  const nights = reservation ? nightsBetween(reservation.arrival, reservation.departure) : 0;
  const estimate = reservation ? reservation.rate * nights : 0;
  const currentFolio = reservation ? folio(reservation.id) : { paidTotal: 0, balance: 0 };
  const paidTotal = currentFolio.paidTotal;
  const balance = Math.max(0, estimate - paidTotal);

  if (!reservation || !guest) {
    return (
      <Modal open={open} onClose={onClose} title="Check-in">
        <p className="text-[13px] text-ink-soft">Reservation not found.</p>
      </Modal>
    );
  }

  function complete() {
    if (!reservation || !guest) return;
    if (!activeRoomId) {
      setError('Select a room assignment before completing check-in.');
      return;
    }

    // 1. Sync & update guest details in central Guest List
    updateGuest(guest.id, {
      firstName: firstName.trim() || guest.firstName,
      lastName: lastName.trim() || guest.lastName,
      phone: phone.trim() || guest.phone,
      email: email.trim() || guest.email,
      idType: idType || guest.idType,
      idNumber: idNumber.trim() || guest.idNumber,
      idVerified: Boolean(idNumber.trim() || guest.idNumber)
    });

    // 2. Perform check-in operation
    checkIn(reservation.id, {
      roomId: activeRoomId,
      accompanying,
      keyCards,
      depositAmount: deposit,
      method,
      idVerified: Boolean(idNumber.trim() || guest.idNumber),
      registrationSigned: true
    });

    setError('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      width="max-w-[760px]"
    >
      <div className="space-y-5 py-1">
        {/* Express Check-In Header & Actions */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              FRONT DESK OPERATIONS
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Express Check-In</h1>
            <p className="mt-0.5 text-[12px] text-gray-500">
              Arrival window opens 14:00 · {reservation.roomType} King
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SecondaryButton className="gap-1.5 px-3 py-2 text-[12px]">
              <QrCodeIcon aria-hidden="true" className="h-4 w-4 text-gray-600" />
              Scan reservation
            </SecondaryButton>
            <SecondaryButton className="gap-1.5 px-3 py-2 text-[12px]">
              <UserCheckIcon aria-hidden="true" className="h-4 w-4 text-gray-600" />
              Scan ID
            </SecondaryButton>
          </div>
        </div>

        {/* Booking Card Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <BedDoubleIcon aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-bold text-gray-900">#{reservation.code}</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 uppercase">
                  {reservation.source}
                </span>
              </div>
              <p className="text-[12px] font-medium text-gray-500">
                {reservation.roomType} King · Room {room?.number ?? 'Unassigned'} · {nights} night
                {nights > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-gray-400">Arrival</p>
            <p className="text-[13px] font-bold text-gray-800">
              Thu, Sep 10 2026, 14:00
            </p>
          </div>
        </div>

        {/* Guest Identity Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-900">Guest identity</h2>
            {idNumber.trim() ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                ID Verified
              </span>
            ) : (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                Missing ID
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name *">
              <TextInput
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="h-10"
              />
            </Field>

            <Field label="Last name *">
              <TextInput
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="h-10"
              />
            </Field>

            <Field label="Phone number">
              <TextInput
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-10"
              />
            </Field>

            <Field label="Email">
              <TextInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="h-10"
              />
            </Field>

            <Field label="ID document type *">
              <SelectInput
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="h-10"
              >
                <option value="Passport">Passport</option>
                <option value="National ID">National ID</option>
                <option value="Driver's License">Driver's License</option>
              </SelectInput>
            </Field>

            <Field label="ID number *">
              <TextInput
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="Scan or enter manually"
                className="h-10"
              />
            </Field>
          </div>
        </div>

        {/* Regulatory Report Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-[15px] font-bold text-gray-900">Regulatory report</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRegulatoryReport('standard')}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                regulatoryReport === 'standard'
                  ? 'border-brand-500 bg-blue-50/40 ring-1 ring-brand-500'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="regulatory"
                checked={regulatoryReport === 'standard'}
                onChange={() => setRegulatoryReport('standard')}
                className="mt-0.5 h-4 w-4 text-brand-600"
              />
              <div>
                <p className="text-[13px] font-bold text-gray-900">Standard (Domestic)</p>
                <p className="text-[11px] text-gray-500">Standard reporting guidelines</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRegulatoryReport('form-c')}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                regulatoryReport === 'form-c'
                  ? 'border-brand-500 bg-blue-50/40 ring-1 ring-brand-500'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="regulatory"
                checked={regulatoryReport === 'form-c'}
                onChange={() => setRegulatoryReport('form-c')}
                className="mt-0.5 h-4 w-4 text-brand-600"
              />
              <div>
                <p className="text-[13px] font-bold text-gray-900">Form-C (Foreign National)</p>
                <p className="text-[11px] text-gray-500">Requires visa entry details</p>
              </div>
            </button>
          </div>

          <div className="pt-2">
            <p className="mb-1.5 text-[12px] font-semibold text-gray-600">Accompanying guests</p>
            <div className="flex gap-2">
              <TextInput
                value={accompanyingDraft}
                onChange={(e) => setAccompanyingDraft(e.target.value)}
                placeholder="Full name"
                className="h-10 flex-1"
              />
              <SecondaryButton
                onClick={() => {
                  if (!accompanyingDraft.trim()) return;
                  setAccompanying([...accompanying, accompanyingDraft.trim()]);
                  setAccompanyingDraft('');
                }}
                className="h-10 px-4"
              >
                <PlusIcon aria-hidden="true" className="h-4 w-4" />
                Add
              </SecondaryButton>
            </div>
            {accompanying.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {accompanying.map((name, index) => (
                  <span
                    key={`${name}-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => setAccompanying(accompanying.filter((_, i) => i !== index))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XIcon aria-hidden="true" className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Advance Payment Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-900">Advance payment</h2>
            {balance <= 0 ? (
              <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                Prepaid
              </span>
            ) : (
              <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">
                Payment due
              </span>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-[13px] font-semibold text-gray-800 transition-all hover:bg-gray-100/80">
            <input
              type="checkbox"
              checked={collectAdvance}
              onChange={(e) => {
                const checked = e.target.checked;
                setCollectAdvance(checked);
                if (!checked) {
                  setDeposit(0);
                } else {
                  setDeposit(balance > 0 ? balance : 0);
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <span>Collect advance payment / deposit at check-in</span>
          </label>

          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between text-gray-600">
              <span>Room & tax</span>
              <span className="font-semibold text-gray-900">{money(estimate)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payments on file</span>
              <span className="font-semibold text-emerald-600">
                {paidTotal > 0 ? `-${money(paidTotal)}` : money(0)}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between items-baseline">
              <span className="text-[13px] font-medium text-gray-500">Total due</span>
              <span className="text-3xl font-extrabold text-gray-900">{money(balance)}</span>
            </div>
          </div>

          {collectAdvance && (
            <div className="pt-2 space-y-3">
              <Field label="Deposit to collect now">
                <TextInput
                  type="number"
                  min={0}
                  value={deposit}
                  onChange={(e) => setDeposit(Math.max(0, Number(e.target.value)))}
                  className="h-10"
                />
              </Field>

              <div className="grid grid-cols-3 gap-2">
                {(['Card', 'Cash', 'Digital'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setPaymentCategory(cat);
                      setMethod(cat === 'Card' ? 'Visa' : cat === 'Cash' ? 'Cash' : 'Bank Transfer');
                    }}
                    className={`rounded-xl border py-2.5 text-[13px] font-semibold transition-all ${
                      paymentCategory === cat
                        ? 'border-brand-500 bg-blue-50/50 text-brand-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">Settlement method: {method}</p>
            </div>
          )}
        </div>

        {/* Room Assignment Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-gray-900">Room assignment</h2>
            {roomReady ? (
              <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                Inspected
              </span>
            ) : (
              <span className="rounded-md bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">
                Not Ready
              </span>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={matchRoomType}
              onChange={(e) => setMatchRoomType(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            Match booked room type ({reservation.roomType} King)
          </label>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {candidates.map((cand) => {
              const isSelected = cand.id === activeRoomId;
              return (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => setRoomId(cand.id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-blue-50/30 ring-1 ring-brand-500'
                      : 'border-gray-200/80 bg-white hover:border-gray-300'
                  }`}
                >
                  <div>
                    <span className="text-[18px] font-bold text-gray-900">{cand.number}</span>
                    <span className="ml-3 text-[13px] font-bold text-gray-700">
                      {cand.type} King
                    </span>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Floor {cand.floor} · {cand.view} view · {money0(cand.rate)}/night
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill tone={housekeepingTone[cand.housekeeping]}>
                      {housekeepingLabel[cand.housekeeping]}
                    </StatusPill>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Encoder Dark Theme Container */}
        <div className="rounded-2xl bg-[#0f172a] p-5 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyIcon aria-hidden="true" className="h-5 w-5 text-gray-300" />
              <h2 className="text-[15px] font-bold text-white">Key encoder</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              USB active
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-800/60 py-6 text-center">
            <div className="relative flex h-24 w-36 items-center justify-center rounded-xl bg-gray-200 shadow-md">
              <div className="h-4 w-10 rounded bg-gray-300" />
              <div className="absolute bottom-2 right-2 h-6 w-8 rounded bg-amber-400" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[12px] text-slate-300">
              Ready to encode card for room{' '}
              <span className="font-bold text-white">{room?.number ?? 'Unassigned'}</span>
            </p>

            {error && (
              <p role="alert" className="rounded-lg bg-red-500/20 px-3 py-2 text-[12px] font-semibold text-red-300">
                {error}
              </p>
            )}

            <PrimaryButton
              onClick={complete}
              className="w-full justify-center py-3 text-[14px] font-bold bg-brand-600 hover:bg-brand-500"
            >
              Complete Check-in
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}