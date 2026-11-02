import { Suspense } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { currentSession } from '@/reviews-service/dash-session';
import { logout } from './actions';
import { SubmitButton } from '../console/submit-button';

export const metadata: Metadata = { title: 'Reviews dashboard · TysonLabs', robots: { index: false, follow: false } };

// The dashboard exists only on its own host. On tysonlabs.in/dashboard it does not exist.
async function HostGuard({ children }: { children: React.ReactNode }) {
  const host = ((await headers()).get('host') ?? '').toLowerCase();
  const allowed = (process.env.DASHBOARD_HOST ?? 'reviews.tysonlabs.in').toLowerCase();
  const local = process.env.NODE_ENV !== 'production' && /^localhost(:\d+)?$/.test(host);
  if (host !== allowed && !local) notFound();
  return <>{children}</>;
}

async function Nav() {
  const s = await currentSession();
  if (!s) return null;
  return (
    <header className="border-b border-black/[0.08] dark:border-[#30333B]">
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-sm">
        <a href="/" className="font-display font-bold text-zinc-950 dark:text-[#F4F3F8]">Reviews</a>
        <nav className="flex gap-4 text-zinc-600 dark:text-[#A6A8B3]">
          <a href="/" className="hover:underline">Overview</a>
          <a href="/reviews" className="hover:underline">Reviews</a>
          <a href="/connect" className="hover:underline">Google connection</a>
          {s.isAdmin && <a href="/admin" className="hover:underline">Businesses</a>}
        </nav>
        <form action={logout} className="ml-auto flex items-center gap-3"><span className="text-xs text-zinc-500">{s.email}</span><SubmitButton className="rounded-lg border border-black/20 dark:border-white/20 px-3 py-1 text-xs">Sign out</SubmitButton></form>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-zinc-500">Loading…</p>}>
      <HostGuard>
        <Nav />
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">{children}</div>
      </HostGuard>
    </Suspense>
  );
}
