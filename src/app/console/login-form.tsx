'use client';

import { useActionState } from 'react';
import { login } from './actions';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="max-w-sm space-y-3">
      <h1 className="font-display font-bold text-2xl text-zinc-950 dark:text-[#F4F3F8]">Review Manager console</h1>
      <p className="text-sm text-zinc-500">Sign in to read reviews and approve replies.</p>
      <input type="password" name="password" autoComplete="current-password" placeholder="Console password" required className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-transparent p-2 text-sm" />
      {state?.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
      <button disabled={pending} className="rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold">{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
