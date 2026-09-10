import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppShell({ onSignOut }: {onSignOut: () => void;}) {
  return (
    <div className="flex h-full w-full bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onSignOut={onSignOut} />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>);

}