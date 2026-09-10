import React, { useState } from 'react';
import { toast } from 'sonner';
import { useHotel } from '../../contexts/HotelContext';
import type { Reservation } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Textarea } from '../ui/Field';
import { RoomPicker } from './RoomPicker';

export function AssignRoomModal({
  open,
  onClose,
  reservation




}: {open: boolean;onClose: () => void;reservation: Reservation;}) {
  const { assignRoom } = useHotel();
  const [roomId, setRoomId] = useState<string | null>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-xl"
      title="Assign room"
      description={`Vacant rooms for #${reservation.confirmation}.`}
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
          variant="primary"
          onClick={() => {
            if (!roomId) {
              toast.error('Select a room to assign');
              return;
            }
            assignRoom(reservation.id, roomId);
            onClose();
          }}>
          
            Assign room
          </Button>
        </>
      }>
      
      <RoomPicker
        preferredType={reservation.roomType}
        selectedRoomId={roomId}
        onSelect={setRoomId} />
      
    </Modal>);

}

export function ChangeRoomModal({
  open,
  onClose,
  reservation




}: {open: boolean;onClose: () => void;reservation: Reservation;}) {
  const { changeRoom } = useHotel();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="max-w-xl"
      title="Change room"
      description="The previous room is released to housekeeping as dirty with high priority."
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
          variant="primary"
          onClick={() => {
            if (!roomId) {
              toast.error('Select the new room');
              return;
            }
            changeRoom(reservation.id, roomId, reason.trim());
            onClose();
          }}>
          
            Confirm room change
          </Button>
        </>
      }>
      
      <RoomPicker
        preferredType={reservation.roomType}
        excludeRoomId={reservation.roomId}
        selectedRoomId={roomId}
        onSelect={setRoomId} />
      
      <Field label="Reason for move" className="mt-4">
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Guest requested a quieter room…" />
        
      </Field>
    </Modal>);

}

export function ExtendStayModal({
  open,
  onClose,
  reservation




}: {open: boolean;onClose: () => void;reservation: Reservation;}) {
  const { extendStay } = useHotel();
  const [departure, setDeparture] = useState(reservation.departure);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Extend stay"
      description={`Current departure: ${reservation.departure}`}
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
          variant="primary"
          onClick={() => {
            if (departure <= reservation.arrival) {
              toast.error('Departure must be after arrival');
              return;
            }
            extendStay(reservation.id, departure);
            onClose();
          }}>
          
            Update departure
          </Button>
        </>
      }>
      
      <Field label="New departure date" required>
        <Input
          type="date"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)} />
        
      </Field>
    </Modal>);

}

export function CancelReservationModal({
  open,
  onClose,
  reservation




}: {open: boolean;onClose: () => void;reservation: Reservation;}) {
  const { cancelReservation } = useHotel();
  const [reason, setReason] = useState('');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel reservation"
      description={`#${reservation.confirmation} will be released and the room returned to inventory.`}
      footer={
      <>
          <Button onClick={onClose}>Keep reservation</Button>
          <Button
          variant="primary"
          className="bg-red-600 hover:bg-red-700"
          onClick={() => {
            if (!reason.trim()) {
              toast.error('A cancellation reason is required');
              return;
            }
            cancelReservation(reservation.id, reason.trim());
            onClose();
          }}>
          
            Cancel reservation
          </Button>
        </>
      }>
      
      <Field label="Cancellation reason" required>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Guest changed travel plans…" />
        
      </Field>
    </Modal>);

}