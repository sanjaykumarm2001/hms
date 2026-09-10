import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  AtSignIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  ShieldCheckIcon } from
'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('alex.rivera@meridianhotels.com');
  const [password, setPassword] = useState('sentinel-2024');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Enter your username and password to continue.');
      return;
    }
    setError('');
    setSubmitting(true);
    window.setTimeout(() => navigate('/dashboard'), 650);
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-y-auto bg-brand-gradient px-6 py-10">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-white shadow-panel">
            <svg viewBox="0 0 20 20" className="h-7 w-7" aria-hidden="true">
              <path
                d="M10 2.5 17 6v5.2c0 3.2-2.8 5.6-7 6.3-4.2-.7-7-3.1-7-6.3V6l7-3.5Z"
                fill="#25b84f" />
              
              <path d="M10 6.5 13.2 12H6.8L10 6.5Z" fill="#f2f9e6" />
            </svg>
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[22px] font-bold tracking-tight text-white">Sentinel</span>
            <span className="text-[13px] font-semibold text-white/80">ProPMS</span>
          </div>
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Hospitality Operations OS
          </p>
        </div>

        <div className="mt-7 rounded-[12px] bg-white p-7 shadow-panel">
          <h1 className="text-center text-[20px] font-bold tracking-tight text-ink">Login</h1>
          <p className="mt-1 text-center text-[12px] text-ink-muted">
            Sign in to your ProPMS Sentinel account
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="username"
                className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                
                Username
              </label>
              <div className="relative mt-2">
                <AtSignIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                
                <input
                  id="username"
                  type="email"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-11 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] text-ink focus:border-brand-500 focus:outline-none" />
                
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                  
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-brand-700 hover:text-brand-800">
                  
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-2">
                <KeyRoundIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-lg border border-line bg-white pl-9 pr-10 text-[13px] text-ink focus:border-brand-500 focus:outline-none" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-muted transition-colors duration-150 hover:text-ink">
                  
                  {showPassword ?
                  <EyeOffIcon aria-hidden="true" className="h-4 w-4" /> :

                  <EyeIcon aria-hidden="true" className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 text-[12px] text-ink-soft">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500" />
              
              Keep me signed in on this device
            </label>

            {error ?
            <p
              role="alert"
              className="rounded-md bg-[#fdeceb] px-3 py-2 text-[12px] font-medium text-[#b3312a]">
              
                {error}
              </p> :
            null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient text-[14px] font-semibold text-white transition-[filter,opacity] duration-150 hover:brightness-[1.06] disabled:opacity-70">
              
              {submitting ? 'Signing in…' : 'Login'}
              {!submitting ? <ArrowRightIcon aria-hidden="true" className="h-4 w-4" /> : null}
            </button>
          </form>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
            <ShieldCheckIcon aria-hidden="true" className="h-3.5 w-3.5 text-brand-600" />
            End-to-End Encrypted Session
          </p>
        </div>

        <p className="mt-7 text-center text-[10.5px] text-white/80">
          © 2024 Meridian Hotel Management Group. All rights reserved. · Protected by Sentinel Access
          Layer v2.4
        </p>
      </div>
    </div>);

}