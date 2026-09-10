import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { RoomRack } from './pages/RoomRack';
import { Bookings } from './pages/Bookings';
import { GuestActivity } from './pages/GuestActivity';
import { Housekeeping } from './pages/Housekeeping';
import { Config } from './pages/Config';
import { FrontDesk } from './pages/FrontDesk';

interface AppProps {
  startAuthenticated?: boolean;
}

export function App({ startAuthenticated = false }: AppProps) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={startAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/room-rack" element={<RoomRack />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/guest-activity" element={<GuestActivity />} />
          <Route path="/housekeeping" element={<Housekeeping />} />
          <Route path="/config" element={<Config />} />
          <Route path="/setup" element={<FrontDesk />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>);

}