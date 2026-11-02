import { Suspense } from 'react';
import { listReviews, summary } from '@/reviews-service/reviews';
import { Ctx, Notices, TenantTabs, box, btn, loadContext } from './_ui/shared';
import { SubmitButton } from '../console/submit-button';
import { syncAction } from './actions';

type SP = Promise<Record<string, string | undefined>>;

export default function Overview({ searchParams }: { searchParams: SP }) {
  return <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}><Body searchParams={searchParams} /></Suspense>;
}

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await loadContext(sp);
  return (
    <>
      <Notices err={sp.err} ok={sp.ok} />
      <TenantTabs ctx={ctx} path="/" />
      {ctx.tenant && ctx.client ? <Tenant ctx={ctx} /> : <p className="text-sm text-zinc-500">No businesses to show yet.</p>}
    </>
  );
}

async function Tenant({ ctx }: { ctx: Ctx }) {
  const t = ctx.tenant!;
  const c = ctx.client!;
  const [s, recent] = await Promise.all([summary(c, t.ref), listReviews(c, t.ref, { limit: 5 })]);
  const max = Math.max(1, ...Object.values(s.byRating));
  return (
    <section className="space-y-4">
      <h1 className="font-display font-bold text-2xl text-zinc-950 dark:text-[#F4F3F8]">{t.ref}</h1>
      {t.status !== 'ACTIVE' && (
        <p className={`${box} text-sm`}>Google is {t.status === 'NONE' ? 'not connected' : 'not connected right now'} for this business. <a className="underline" href={`/connect?t=${encodeURIComponent(t.ref)}`}>Connect Google</a> to bring in its reviews.</p>
      )}
      <div className="grid gap-3 sm:grid-cols-4">
        {[['Reviews', s.total], ['Average rating', s.average || '–'], ['Waiting for a reply', s.unreplied], ['Last sync', t.lastSyncedAt ? new Date(t.lastSyncedAt).toLocaleString('en-GB') : 'never']].map(([k, v]) => (
          <div key={String(k)} className={box}><p className="text-xs font-mono uppercase text-zinc-500">{k}</p><p className="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">{v}</p></div>
        ))}
      </div>
      <div className={box}>
        <p className="mb-3 text-xs font-mono uppercase text-zinc-500">Ratings</p>
        {[5, 4, 3, 2, 1].map((n) => (
          <div key={n} className="flex items-center gap-3 text-sm">
            <span className="w-6 text-amber-400">{n}★</span>
            <div className="h-2 flex-1 rounded bg-black/10 dark:bg-white/10"><div className="h-2 rounded bg-amber-400" style={{ width: `${(s.byRating[n as 1 | 2 | 3 | 4 | 5] / max) * 100}%` }} /></div>
            <span className="w-8 text-right text-zinc-500">{s.byRating[n as 1 | 2 | 3 | 4 | 5]}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <a href={`/reviews?t=${encodeURIComponent(t.ref)}`} className={btn}>Open reviews</a>
        <form action={syncAction}><input type="hidden" name="tenant" value={t.ref} /><SubmitButton className={btn}>Sync now</SubmitButton></form>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-mono uppercase text-zinc-500">Latest reviews</p>
        {recent.reviews.length === 0 && <p className="text-sm text-zinc-500">No reviews yet.</p>}
        {recent.reviews.map((r) => (
          <p key={String(r.id)} className={`${box} text-sm`}><span className="text-amber-400">{'★'.repeat(Number(r.rating))}</span> {String(r.reviewerName ?? 'A Google user')} · {r.replyText ? 'replied' : <b>needs a reply</b>}<br /><span className="text-zinc-600 dark:text-[#C9CAD3]">{String(r.comment ?? '').slice(0, 160) || 'No text'}</span></p>
        ))}
      </div>
    </section>
  );
}
