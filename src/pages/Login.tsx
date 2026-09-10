import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldCheckIcon,
  UserIcon } from
'lucide-react';
import { property } from '../data/property';
import { Button } from '../components/ui/Button';

export function Login({ onSignIn }: {onSignIn: () => void;}) {
  const [username, setUsername] = useState('alex.rivera@meridianhotels.com');
  const [password, setPassword] = useState('sentinel-demo');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-canvas px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[420px]">
        
        <div className="mb-7 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-[15px] font-bold text-white">
            S
          </span>
          <p className="text-[19px] font-semibold tracking-tight text-ink">
            Sentinel{' '}
            <span className="text-[13px] font-semibold text-brand-600">ProPMS</span>
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            Hospitality Operations OS
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSignIn();
          }}
          className="rounded-2xl border border-line bg-white p-6 shadow-card">
          
          <h1 className="text-center text-[20px] font-semibold text-ink">Login</h1>
          <p className="mb-6 mt-1 text-center text-[13px] text-ink-muted">
            Sign in to your ProPMS Sentinel account
          </p>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Username
            </span>
            <span className="relative block">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] text-ink transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none" />
              
            </span>
          </label>

          <label className="mb-4 block">
            <span className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                Password
              </span>
              <span className="text-[11px] font-medium text-brand-600">
                Forgot password?
              </span>
            </span>
            <span className="relative block">
              <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-10 text-[13px] text-ink transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none" />
              
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-ink-faint transition-colors duration-150 ease-out hover:text-ink">
                
                {showPassword ?
                <EyeOffIcon className="h-4 w-4" /> :

                <EyeIcon className="h-4 w-4" />
                }
              </button>
            </span>
          </label>

          <label className="mb-5 flex items-center gap-2 text-[12px] text-ink-muted">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-line text-brand-600 focus:ring-brand-500" />
            
            Keep me signed in on this device
          </label>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Login <ArrowRightIcon className="h-4 w-4" />
          </Button>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-ink-faint">
            <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
            End-to-End Encrypted Session
          </p>
        </form>

        <p className="mt-6 text-center text-[11px] text-ink-faint">
          © 2026 {property.group}. All rights reserved. · Protected by Sentinel Access
          Layer v2.4
        </p>
      </motion.div>
    </div>);

}