import React, { useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '../../contexts/HotelContext';
import { bookingSources, roomTypes } from '../../data/property';
import type { RoomTypeId } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { RoomPicker } from './RoomPicker';

type GuestMode = 'existing' | 'new';

export function BookingModal({
  open,
  onClose,
  walkIn = false




}: {open: boolean;onClose: () => void;walkIn?: boolean;}) {
  const { guests, createGuest, createReservation, today } = useHotel();
  const navigate = useNavigate();

  const [guestMode, setGuestMode] = useState<GuestMode>('existing');
  const [guestId, setGuestId] = useState(guests[0]?.id ?? '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roomType, setRoomType] = useState<RoomTypeId>('deluxe_king');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [arrival, setArrival] = useState(today);
  const [departure, setDeparture] = useState(
    format(addDays(new Date(), walkIn ? 1 : 2), 'yyyy-MM-dd')
  );
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [source, setSource] = useState(walkIn ? 'Walk-In' : 'Direct');
  const [requests, setRequests] = useState('');

  const typeRate = useMemo(
    () => roomTypes.find((t) => t.id === roomType)?.rate ?? 260,
    [roomType]
  );
  const [rate, setRate] = useState(typeRate);

  const submit = () => {
    if (departure <= arrival) {
      toast.error('Departure must be after arrival');
      return;
    }
    if (walkIn && !roomId) {
      toast.error('Walk-ins require a room');
      return;
    }
    let finalGuestId = guestId;
    if (guestMode === 'new') {
      if (!firstName.trim() || !lastName.trim()) {
        toast.error('Guest first and last name are required');
        return;
      }
      finalGuestId = createGuest({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: 'United States',
        segment: 'leisure',
        tier: 'standard'
      }).id;
    }
    if (!finalGuestId) {
      toast.error('Select a guest');
      return;
    }
    const reservation = createReservation({
      guestId: finalGuestId,
      roomId,
      roomType,
      arrival,
      departure,
      adults,
      children,
      rate,
      source,
      requests,
      walkIn
    });
    onClose();
    navigate(`/bookings/${reservation.id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-3xl"
      title={walkIn ? 'Walk-in check-in' : 'New booking'}
      description={
      walkIn ?
      'Creates an in-house reservation, posts the room charge and occupies the room immediately.' :
      'Creates a confirmed reservation in the arrivals pipeline.'
      }
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>
            {walkIn ? 'Create walk-in' : 'Create reservation'}
          </Button>
        </>
      }>
      
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[12px] font-semibold text-ink">Guest</p>
            <div className="mb-3 inline-flex rounded-lg border border-line bg-slate-50 p-0.5">
              {(['existing', 'new'] as GuestMode[]).map((mode) =>
              <button
                key={mode}
                type="button"
                onClick={() => setGuestMode(mode)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out ${
                guestMode === mode ?
                'bg-white text-ink shadow-card' :
                'text-ink-muted hover:text-ink'}`
                }>
                
                  {mode === 'existing' ? 'Existing guest' : 'New guest'}
                </button>
              )}
            </div>
            {guestMode === 'existing' ?
            <Field label="Guest profile" required>
                <Select value={guestId} onChange={(e) => setGuestId(e.target.value)}>
                  {guests.map((g) =>
                <option key={g.id} value={g.id}>
                      {g.firstName} {g.lastName} — {g.email}
                    </option>
                )}
                </Select>
              </Field> :

            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="First name" required>
                  <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Eleanor" />
                
                </Field>
                <Field label="Last name" required>
                  <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Vance" />
                
                </Field>
                <Field label="Email">
                  <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.vance@example.com" />
                
                </Field>
                <Field label="Phone">
                  <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-8233" />
                
                </Field>
              </div>
            }
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Room type" required>
              <Select
                value={roomType}
                onChange={(e) => {
                  const next = e.target.value as RoomTypeId;
                  setRoomType(next);
                  setRate(roomTypes.find((t) => t.id === next)?.rate ?? rate);
                  setRoomId(null);
                }}>
                
                {roomTypes.map((t) =>
                <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                )}
              </Select>
            </Field>
            <Field label="Nightly rate" required>
              <Input
                type="number"
                min={0}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))} />
              
            </Field>
            <Field label="Arrival" required>
              <Input
                type="date"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)} />
              
            </Field>
            <Field label="Departure" required>
              <Input
                type="date"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)} />
              
            </Field>
            <Field label="Adults">
              <Input
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))} />
              
            </Field>
            <Field label="Children">
              <Input
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))} />
              
            </Field>
            <Field label="Booking source" className="sm:col-span-2">
              <Select value={source} onChange={(e) => setSource(e.target.value)}>
                {bookingSources.map((s) =>
                <option key={s} value={s}>
                    {s}
                  </option>
                )}
              </Select>
            </Field>
          </div>

          <Field label="Guest requests">
            <Textarea
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              placeholder="High floor, late arrival, allergies…" />
            
          </Field>
        </div>

        <div className="rounded-xl border border-line bg-slate-50 p-3">
          <p className="mb-2 text-[12px] font-semibold text-ink">
            Room assignment{' '}
            <span className="font-normal text-ink-faint">
              {walkIn ? '(required)' : '(optional — can be assigned later)'}
            </span>
          </p>
          <RoomPicker
            preferredType={roomType}
            selectedRoomId={roomId}
            onSelect={(id) => setRoomId(id === roomId ? '' : id)} />
          
        </div>
      </div>
    </Modal>);

}