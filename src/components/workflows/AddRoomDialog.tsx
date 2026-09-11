import React, { useState } from 'react';
import { Field, Modal, PrimaryButton, SecondaryButton, SelectInput, TextInput } from '../ui';
import { useHotel } from '../../contexts/HotelContext';
import type { HousekeepingStatus, RoomTypeName } from '../../types/hotel';

const ROOM_TYPES: RoomTypeName[] = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Accessible'];
const HOUSEKEEPING_STATUSES: HousekeepingStatus[] = ['clean', 'inspected', 'dirty', 'cleaning'];
const VIEWS = ['City View', 'Ocean View', 'Garden View', 'Courtyard View', 'Pool View', 'Mountain View'];
const BEDS_OPTIONS = ['1 King', '2 Queen', '1 Queen', '2 Twin', '1 Suite King'];

export function AddRoomDialog({
  open,
  onClose,
  onRoomCreated
}: {
  open: boolean;
  onClose: () => void;
  onRoomCreated?: (roomId: string, floor: number) => void;
}) {
  const { rooms, createRoom } = useHotel();
  const [number, setNumber] = useState('');
  const [floor, setFloor] = useState<number | string>(1);
  const [type, setType] = useState<RoomTypeName>('Standard');
  const [beds, setBeds] = useState('2 Queen');
  const [maxOccupancy, setMaxOccupancy] = useState<number | string>(2);
  const [rate, setRate] = useState<number | string>(150);
  const [view, setView] = useState('City View');
  const [housekeeping, setHousekeeping] = useState<HousekeepingStatus>('clean');
  const [error, setError] = useState('');

  // Extract existing floors list
  const existingFloors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  function handleTypeChange(nextType: RoomTypeName) {
    setType(nextType);
    if (nextType === 'Suite') {
      setBeds('1 Suite King');
      setMaxOccupancy(4);
      setRate(280);
    } else if (nextType === 'Executive') {
      setBeds('1 King');
      setMaxOccupancy(2);
      setRate(220);
    } else if (nextType === 'Deluxe') {
      setBeds('1 King');
      setMaxOccupancy(2);
      setRate(180);
    } else {
      setBeds('2 Queen');
      setMaxOccupancy(2);
      setRate(150);
    }
  }

  function handleSubmit() {
    const trimmedNum = number.trim();
    if (!trimmedNum) {
      setError('Please enter a room number.');
      return;
    }
    if (rooms.some((r) => r.number.toLowerCase() === trimmedNum.toLowerCase())) {
      setError(`Room number ${trimmedNum} already exists.`);
      return;
    }
    const numFloor = Number(floor);
    if (floor === '' || isNaN(numFloor) || numFloor < 1) {
      setError('Please specify a valid floor number.');
      return;
    }
    const numRate = Number(rate);
    if (rate === '' || isNaN(numRate) || numRate <= 0) {
      setError('Please enter a valid nightly rate.');
      return;
    }
    const numOccupancy = Number(maxOccupancy);
    if (maxOccupancy === '' || isNaN(numOccupancy) || numOccupancy < 1) {
      setError('Please enter a valid max occupancy (at least 1 guest).');
      return;
    }

    const created = createRoom({
      number: trimmedNum,
      floor: numFloor,
      type,
      beds,
      maxOccupancy: numOccupancy,
      rate: numRate,
      view,
      housekeeping
    });

    // Reset form state
    setNumber('');
    setFloor(1);
    setType('Standard');
    setBeds('2 Queen');
    setMaxOccupancy(2);
    setRate(150);
    setError('');
    onClose();
    if (onRoomCreated) {
      onRoomCreated(created.id, created.floor);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Room to Inventory"
      subtitle="Create a new room specifying the floor, room type, pricing, and initial housekeeping status."
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handleSubmit}>Create Room</PrimaryButton>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Room Number" hint="Unique number (e.g. 105, 204)">
          <TextInput
            value={number}
            onChange={(e) => {
              setNumber(e.target.value);
              setError('');
            }}
            placeholder="105"
            autoFocus
          />
        </Field>

        <Field label="Floor Number">
          <div className="flex gap-2">
            <TextInput
              type="number"
              min={1}
              value={floor}
              onChange={(e) => {
                setFloor(e.target.value);
                setError('');
              }}
              placeholder="1"
              className="w-full"
            />
            {existingFloors.length > 0 && (
              <SelectInput
                value={floor !== '' && existingFloors.includes(Number(floor)) ? Number(floor) : ''}
                onChange={(e) => e.target.value && setFloor(Number(e.target.value))}
                className="!w-auto shrink-0"
                title="Select from existing floor"
              >
                <option value="">Existing Floors...</option>
                {existingFloors.map((fl) => (
                  <option key={fl} value={fl}>
                    Floor {fl}
                  </option>
                ))}
              </SelectInput>
            )}
          </div>
        </Field>

        <Field label="Room Type">
          <SelectInput value={type} onChange={(e) => handleTypeChange(e.target.value as RoomTypeName)}>
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Bed Configuration">
          <SelectInput value={beds} onChange={(e) => setBeds(e.target.value)}>
            {BEDS_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Nightly Rate">
          <TextInput
            type="number"
            min={0}
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              setError('');
            }}
            placeholder="150"
          />
        </Field>

        <Field label="Max Occupancy (Guests)">
          <TextInput
            type="number"
            min={1}
            max={10}
            value={maxOccupancy}
            onChange={(e) => {
              setMaxOccupancy(e.target.value);
              setError('');
            }}
          />
        </Field>

        <Field label="View / Location">
          <SelectInput value={view} onChange={(e) => setView(e.target.value)}>
            {VIEWS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Initial Housekeeping">
          <SelectInput
            value={housekeeping}
            onChange={(e) => setHousekeeping(e.target.value as HousekeepingStatus)}
          >
            {HOUSEKEEPING_STATUSES.map((hkStatus) => (
              <option key={hkStatus} value={hkStatus}>
                {hkStatus.charAt(0).toUpperCase() + hkStatus.slice(1)}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-[12px] font-semibold text-[#b3312a]">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
