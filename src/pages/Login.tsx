import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  AtSignIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  ShieldCheckIcon
} from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('alex.rivera@lodgelyresort.com');
  const [password, setPassword] = useState('lodgely-2026');
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#9ec437] via-[#2daf57] to-[#104526] px-4 py-10 font-sans selection:bg-[#176938] selection:text-white">
      {/* Background ambient lighting glow effects */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#d0c44e]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#104526]/40 blur-3xl" />

      <div className="relative z-10 w-full max-w-[410px]">
        {/* Header Branding */}
        <div className="flex flex-col items-center">
          <div className="rounded-2xl bg-white p-3.5 shadow-xl shadow-black/10 border border-white/40 backdrop-blur-sm">
            <img
              src="/lodgely-logo.jpg"
              alt="Lodgely Logo"
              className="h-12 w-12 rounded-xl object-contain"
            />
          </div>
          <div className="mt-4 flex items-center justify-center">
            <span className="font-fell-french text-3xl font-bold tracking-wider text-white drop-shadow-sm">
              Lodgely
            </span>
          </div>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f5f2d0] drop-shadow-xs">
            Resort & Hotel OS
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-7 rounded-3xl bg-white p-8 shadow-2xl shadow-black/15 border border-white/60">
          <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">
            Login
          </h1>
          <p className="mt-1 text-center text-xs font-medium text-slate-500">
            Sign in to your account
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="username"
                className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500"
              >
                Username
              </label>
              <div className="relative mt-2">
                <AtSignIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="username"
                  type="email"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#176938] focus:outline-none focus:ring-2 focus:ring-[#176938]/15"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#176938] hover:text-[#104526] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-2">
                <KeyRoundIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#176938] focus:outline-none focus:ring-2 focus:ring-[#176938]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOffIcon aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <EyeIcon aria-hidden="true" className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 pt-1 text-xs text-slate-600 font-medium select-none cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#176938] accent-[#176938] focus:ring-[#176938]"
              />
              Keep me signed in on this device
            </label>

            {error ? (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700 border border-red-200"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#90c838] via-[#2daf57] to-[#14542e] text-sm font-bold text-white shadow-md shadow-[#2daf57]/20 transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {submitting ? 'Signing in…' : 'Login'}
              {!submitting ? (
                <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
              ) : null}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
            <ShieldCheckIcon aria-hidden="true" className="h-4 w-4 text-[#2daf57]" />
            <span>End-to-End Encrypted Session</span>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-7 text-center text-xs font-medium text-white/80 drop-shadow-xs">
          © 2026 Meridian Hotel Management Group. All rights reserved.
        </p>
      </div>
    </div>
  );
}