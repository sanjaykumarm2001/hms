import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HotelProvider } from './contexts/HotelContext';
import { AppShell } from './components/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FrontDesk } from './pages/FrontDesk';
import { Reservations } from './pages/Reservations';
import { ReservationDetails } from './pages/ReservationDetails';
import { Rooms } from './pages/Rooms';
import { Guests } from './pages/Guests';
import { GuestProfile } from './pages/GuestProfile';
import { Housekeeping } from './pages/Housekeeping';
import { Maintenance } from './pages/Maintenance';
import { Billing } from './pages/Billing';
import { InvoiceDetails } from './pages/InvoiceDetails';
import { Reports } from './pages/Reports';
import { Staff } from './pages/Staff';
import { Settings } from './pages/Settings';

interface AppProps {
  startAuthenticated?: boolean;
}

export function App({ startAuthenticated = true }: AppProps) {
  return (
    <HotelProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={startAuthenticated ? '/dashboard' : '/login'} replace />} />
          
          <Route path="/login" element={<Login />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/front-desk" element={<FrontDesk />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/reservations/:reservationId" element={<ReservationDetails />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/guests" element={<Guests />} />
            <Route path="/guests/:guestId" element={<GuestProfile />} />
            <Route path="/housekeeping" element={<Housekeeping />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/billing/:reservationId" element={<InvoiceDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            border: '1px solid #e6e8e3',
            borderRadius: '10px',
            color: '#111417',
            fontSize: '13px'
          }
        }} />
      
    </HotelProvider>);

}