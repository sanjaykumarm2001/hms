import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HotelProvider } from './contexts/HotelContext';
import { AppShell } from './components/layout/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { FrontDesk } from './pages/FrontDesk';
import { Bookings } from './pages/Bookings';
import { ReservationDetail } from './pages/ReservationDetail';
import { CheckIn } from './pages/CheckIn';
import { CheckOut } from './pages/CheckOut';
import { RoomRack } from './pages/RoomRack';
import { Housekeeping } from './pages/Housekeeping';
import { Maintenance } from './pages/Maintenance';
import { Guests } from './pages/Guests';
import { GuestProfile } from './pages/GuestProfile';
import { GuestActivity } from './pages/GuestActivity';
import { Billing } from './pages/Billing';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Reports } from './pages/Reports';
import { Staff } from './pages/Staff';
import { Config } from './pages/Config';

export function App() {
  const [signedIn, setSignedIn] = useState(false);

  return (
    <HotelProvider>
      <Toaster position="bottom-right" richColors closeButton />
      {signedIn ?
      <BrowserRouter>
          <Routes>
            <Route element={<AppShell onSignOut={() => setSignedIn(false)} />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/front-desk" element={<FrontDesk />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/bookings/:id" element={<ReservationDetail />} />
              <Route path="/check-in/:id" element={<CheckIn />} />
              <Route path="/check-out/:id" element={<CheckOut />} />
              <Route path="/room-rack" element={<RoomRack />} />
              <Route path="/housekeeping" element={<Housekeeping />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/guests" element={<Guests />} />
              <Route path="/guests/:id" element={<GuestProfile />} />
              <Route path="/guest-activity" element={<GuestActivity />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/:id" element={<InvoiceDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/config" element={<Config />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter> :

      <Login onSignIn={() => setSignedIn(true)} />
      }
    </HotelProvider>);

}