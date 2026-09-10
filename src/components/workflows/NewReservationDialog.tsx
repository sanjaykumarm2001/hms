import React, { useMemo, useState } from 'react';
import { addDays, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Field, Modal, PrimaryButton, SecondaryButton, SelectInput, TextArea, TextInput } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import type { BookingSource, RoomTypeName } from '../../types/hotel';
import { isoDate, money0, nightsBetween } from '../../utils/format';

const SOURCES: BookingSource[] = [
'Direct',
'Website',
'Phone',
'Booking.com',
'Expedia',
'Corporate',
'Travel Agent'];


export function NewReservationDialog({
  open,
  mode,
  onClose,
  onCreated





}: {open: boolean;mode: 'reservation' | 'walk-in';onClose: () => void;onCreated?: (reservationId: string) => void;}) {
  const { guests, rooms, ops, settings, tickets, createGuest, createReservation, createWalkIn, today } =
    useHotel();
  const walkIn = mode === 'walk-in';

  const [guestMode, setGuestMode] = useState<'existing' | 'new'>('existing');
  const [guestId, setGuestId] = useState('');
  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: ''
  });
  const [roomType, setRoomType] = useState<RoomTypeName>('Standard');
  const [roomId, setRoomId] = useState('');
  const [arrival, setArrival] = useState(today);
  const [departure, setDeparture] = useState(isoDate(addDays(parseISO(today), 1)));
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rate, setRate] = useState(settings.roomTypes[0].baseRate);
  const [source, setSource] = useState<BookingSource>(walkIn ? 'Direct' : 'Website');
  const [bookingStatus, setBookingStatus] = useState<'confirmed' | 'tentative'>('confirmed');
  const [requests, setRequests] = useState('');
  const [error, setError] = useState('');

  const availableRooms = useMemo(
    () =>
      rooms
        .filter((room) => ops.statusByRoom[room.id] === 'available' && room.type === roomType)
        .filter((room) => !tickets.some((t) => t.roomId === room.id && t.status !== 'resolved'))
        .sort((a, b) => a.number.localeCompare(b.number)),
    [ops.statusByRoom, roomType, rooms, tickets]
  );

  function handleTypeChange(next: RoomTypeName) {
    setRoomType(next);
    setRoomId('');
    const config = settings.roomTypes.find((t) => t.name === next);
    if (config) setRate(config.baseRate);
  }

  function reset() {
    setGuestMode('existing');
    setGuestId('');
    setNewGuest({ firstName: '', lastName: '', email: '', phone: '', country: '' });
    setRoomType('Standard');
    setRoomId('');
    setArrival(today);
    setDeparture(isoDate(addDays(parseISO(today), 1)));
    setAdults(1);
    setChildren(0);
    setRate(settings.roomTypes[0].baseRate);
    setRequests('');
    setError('');
  }

  function handleSubmit() {
    if (guestMode === 'existing' && !guestId) {
      setError('Select an existing guest or create a new guest profile.');
      return;
    }
    if (guestMode === 'new' && (!newGuest.firstName.trim() || !newGuest.lastName.trim())) {
      setError('A new guest needs at least a first and last name.');
      return;
    }
    if (departure <= arrival) {
      setError('Departure must be after arrival.');
      return;
    }
    if (walkIn && !roomId) {
      setError('A walk-in requires a room to be selected.');
      return;
    }
    const occupancy = adults + children;
    const selectedRoom = rooms.find((r) => r.id === roomId);
    if (selectedRoom && occupancy > selectedRoom.maxOccupancy) {
      setError(`Room ${selectedRoom.number} takes a maximum of ${selectedRoom.maxOccupancy} guests.`);
      return;
    }

    const guest =
    guestMode === 'new' ?
    createGuest({
      firstName: newGuest.firstName,
      lastName: newGuest.lastName,
      email: newGuest.email,
      phone: newGuest.phone,
      country: newGuest.country
    }) :
    guests.find((g) => g.id === guestId);

    if (!guest) {
      setError('Guest could not be resolved.');
      return;
    }

    const payload = {
      guestId: guest.id,
      roomType,
      roomId: roomId || null,
      arrival: walkIn ? today : arrival,
      departure,
      adults,
      children,
      rate,
      source,
      status: bookingStatus,
      requests
    };

    const reservation = walkIn ? createWalkIn(payload) : createReservation(payload);
    if (walkIn) {
      toast.message('Room charge posted', {
        description: `${nightsBetween(payload.arrival, payload.departure)} night(s) at ${money0(rate)}.`
      });
    }
    reset();
    onClose();
    onCreated?.(reservation.id);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={walkIn ? 'Walk-in check-in' : 'New reservation'}
      subtitle={
      walkIn ?
      'Creates an in-house reservation, posts the room charge, and occupies the room.' :
      'Creates a confirmed reservation in the system.'
      }
      width="max-w-[720px]"
      footer={
      <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit}>
            {walkIn ? 'Create walk-in' : 'Create reservation'}
          </PrimaryButton>
        </>
      }>
      
      <div className="space-y-5">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">Guest</h3>
            <div className="inline-flex rounded-lg border border-line bg-white p-1">
              {(['existing', 'new'] as const).map((value) =>
              <button
                key={value}
                type="button"
                onClick={() => setGuestMode(value)}
                className={[
                'rounded-md px-3 py-1 text-[12px] font-semibold transition-colors duration-150',
                guestMode === value ?
                'bg-brand-600 text-white' :
                'text-ink-soft hover:bg-canvas hover:text-ink'].
                join(' ')}>
                
                  {value === 'existing' ? 'Existing guest' : 'New guest'}
                </button>
              )}
            </div>
          </div>

          {guestMode === 'existing' ?
          <Field label="Select guest">
              <SelectInput value={guestId} onChange={(event) => setGuestId(event.target.value)}>
                <option value="">Choose a guest…</option>
                {guests.map((guest) =>
              <option key={guest.id} value={guest.id}>
                    {guest.firstName} {guest.lastName} · {guest.tier} · {guest.email}
                  </option>
              )}
              </SelectInput>
            </Field> :

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="First name">
                <TextInput
                value={newGuest.firstName}
                onChange={(event) => setNewGuest({ ...newGuest, firstName: event.target.value })} />
              
              </Field>
              <Field label="Last name">
                <TextInput
                value={newGuest.lastName}
                onChange={(event) => setNewGuest({ ...newGuest, lastName: event.target.value })} />
              
              </Field>
              <Field label="Email">
                <TextInput
                type="email"
                value={newGuest.email}
                onChange={(event) => setNewGuest({ ...newGuest, email: event.target.value })} />
              
              </Field>
              <Field label="Phone">
                <TextInput
                value={newGuest.phone}
                onChange={(event) => setNewGuest({ ...newGuest, phone: event.target.value })} />
              
              </Field>
              <Field label="Country" className="sm:col-span-2">
                <TextInput
                value={newGuest.country}
                onChange={(event) => setNewGuest({ ...newGuest, country: event.target.value })} />
              
              </Field>
            </div>
          }
        </section>

        <section>
          <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">
            Stay details
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Room type">
              <SelectInput
                value={roomType}
                onChange={(event) => handleTypeChange(event.target.value as RoomTypeName)}>
                
                {settings.roomTypes.map((type) =>
                <option key={type.name} value={type.name}>
                    {type.name} · {money0(type.baseRate)}
                  </option>
                )}
              </SelectInput>
            </Field>
            <Field
              label={walkIn ? 'Room (required)' : 'Room (optional)'}
              hint={`${availableRooms.length} available`}>
              
              <SelectInput value={roomId} onChange={(event) => setRoomId(event.target.value)}>
                <option value="">{walkIn ? 'Select a room…' : 'Assign later'}</option>
                {availableRooms.map((room) =>
                <option key={room.id} value={room.id}>
                    {room.number} · {room.housekeeping} · {money0(room.rate)}
                  </option>
                )}
              </SelectInput>
            </Field>
            <Field label="Rate per night">
              <TextInput
                type="number"
                min={0}
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))} />
              
            </Field>
            <Field label="Arrival">
              <TextInput
                type="date"
                value={walkIn ? today : arrival}
                disabled={walkIn}
                onChange={(event) => setArrival(event.target.value)} />
              
            </Field>
            <Field
              label="Departure"
              hint={
              departure > arrival ?
              `${nightsBetween(walkIn ? today : arrival, departure)} night(s)` :
              undefined
              }>
              
              <TextInput
                type="date"
                value={departure}
                onChange={(event) => setDeparture(event.target.value)} />
              
            </Field>
            <Field label="Booking source">
              <SelectInput
                value={source}
                onChange={(event) => setSource(event.target.value as BookingSource)}>
                
                {SOURCES.map((item) =>
                <option key={item} value={item}>
                    {item}
                  </option>
                )}
              </SelectInput>
            </Field>
            <Field label="Adults">
              <TextInput
                type="number"
                min={1}
                value={adults}
                onChange={(event) => setAdults(Math.max(1, Number(event.target.value)))} />
              
            </Field>
            <Field label="Children">
              <TextInput
                type="number"
                min={0}
                value={children}
                onChange={(event) => setChildren(Math.max(0, Number(event.target.value)))} />
              
            </Field>
          </div>
          <Field label="Booking status" className="mt-3">
            <SelectInput
              value={bookingStatus}
              onChange={(e) => setBookingStatus(e.target.value as 'confirmed' | 'tentative')}
            >
              <option value="confirmed">Confirmed</option>
              <option value="tentative">Tentative</option>
            </SelectInput>
          </Field>
          <Field label="Guest requests" className="mt-3">
            <TextArea
              rows={2}
              value={requests}
              onChange={(event) => setRequests(event.target.value)}
              placeholder="Late arrival, high floor, cot required…" />
          </Field>
        </section>

        {error ?
        <p role="alert" className="rounded-lg bg-[#fdeceb] px-3 py-2 text-[12px] font-semibold text-[#b3312a]">
            {error}
          </p> :
        null}
      </div>
    </Modal>);

}