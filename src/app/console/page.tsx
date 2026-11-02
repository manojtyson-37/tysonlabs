import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { COOKIE, consoleClient, verifySession } from '@/reviews-service/console-session';
import { getDraft, listReviews, listTenants, summary } from '@/reviews-service/reviews';
import { randomBytes } from 'node:crypto';
import { LoginForm } from './login-form';
import { SubmitButton } from './submit-button';
import { logout, postAction, suggestAction, syncAction } from './actions';

export const metadata: Metadata = { title: 'Review Manager console', robots: { index: false, follow: false } };

const box = 'rounded-xl border border-black/[0.08] dark:border-[#30333B] p-4';
const btn = 'rounded-lg border border-black/20 dark:border-white/20 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10';
const primary = 'rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold';

const MESSAGES: Record<string, string> = {
  UNSAFE_REPLY: 'That reply was refused: it mentions health or treatment, a phone number, a link, or names the reviewer. Reword it in general terms.',
  ALREADY_HAS_REPLY: 'This review already has a reply on Google. Posting would replace it, so it was refused.',
  ALREADY_REPLIED_OR_KEY_USED: 'A reply for this review is already posted or in progress.',
  TICK_THE_BOX_TO_APPROVE: 'Tick the approval box first. Nothing is posted without it.',
  APPROVED_BY_REQUIRED: 'Enter who is approving this reply.',
  NEEDS_REAUTH: 'Google access was lost. Connect Google again for this business.',
  NOT_CONNECTED: 'This business is not connected to Google.',
  RATE_LIMITED: 'Slow down a little and try again in a minute.',
  GOOGLE_ERROR: 'Google did not accept that. Try again shortly.',
  IN_PROGRESS: 'That reply is already being posted. Refresh in a moment.',
  ERROR: 'Something went wrong. Try again.',
};
const messageFor = (code?: string) => (code && Object.hasOwn(MESSAGES, code) ? MESSAGES[code] : code ? MESSAGES.ERROR : null); // never echoes the query string

export default function ConsolePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 space-y-6">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <Console searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Console({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  if (!verifySession((await cookies()).get(COOKIE)?.value)) return <LoginForm />;

  const c = consoleClient();
  const tenants = await listTenants(c);
  const t = tenants.find((x) => x.ref === sp.t) ?? tenants[0];
  const err = messageFor(sp.err);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-zinc-950 dark:text-[#F4F3F8]">Review Manager console</h1>
        <form action={logout}><button className={btn}>Sign out</button></form>
      </div>
      {err && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{err}</p>}
      {sp.ok === 'posted' && <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">Reply posted to Google.</p>}
      {sp.ok === 'synced' && <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">Synced.</p>}

      <div className="flex flex-wrap gap-2">
        {tenants.map((x) => (
          <a key={x.ref} href={`/console?t=${encodeURIComponent(x.ref)}`} className={`${btn} ${x.ref === t?.ref ? 'bg-black/10 dark:bg-white/15' : ''}`}>
            {x.ref} <span className="text-zinc-500">· {x.reviews} reviews{x.unreplied ? `, ${x.unreplied} unreplied` : ''}</span>
          </a>
        ))}
        {tenants.length === 0 && <p className="text-sm text-zinc-500">No businesses connected yet.</p>}
      </div>

      {t && <Tenant tenant={t} sp={sp} />}
    </>
  );
}

async function Tenant({ tenant, sp }: { tenant: Awaited<ReturnType<typeof listTenants>>[number]; sp: Record<string, string | undefined> }) {
  const c = consoleClient();
  const [s, list] = await Promise.all([summary(c, tenant.ref), listReviews(c, tenant.ref, { limit: 50 })]);
  const draft = sp.review && sp.draft ? await getDraft(c, tenant.ref, sp.review, sp.draft) : null;

  return (
    <section className="space-y-4">
      <div className={`${box} flex flex-wrap items-center justify-between gap-3`}>
        <div className="text-sm text-zinc-600 dark:text-[#A6A8B3]">
          <p><b className="text-zinc-950 dark:text-white">{tenant.ref}</b> · {tenant.status === 'ACTIVE' ? `connected as ${tenant.googleEmail ?? 'unknown'}` : tenant.status}</p>
          <p>{s.total} reviews · average {s.average || '–'} · {s.unreplied} unreplied{tenant.lastSyncedAt ? ` · last sync ${new Date(tenant.lastSyncedAt).toUTCString()}` : ''}</p>
        </div>
        <form action={syncAction}><input type="hidden" name="tenant" value={tenant.ref} /><SubmitButton className={btn}>Sync now</SubmitButton></form>
      </div>

      {list.reviews.length === 0 && <p className="text-sm text-zinc-500">No reviews yet. New reviews can take a few minutes to appear after they are posted on Google; press Sync now to check.</p>}

      {list.reviews.map((r) => {
        const open = sp.review === r.id && draft;
        return (
          <article key={String(r.id)} className={box}>
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-zinc-950 dark:text-white">{String(r.reviewerName ?? 'A Google user')} <span className="text-amber-400">{'★'.repeat(Number(r.rating))}</span></p>
              <p className="text-xs text-zinc-500">{new Date(String(r.createdAt)).toLocaleDateString('en-GB')}</p>
            </div>
            {r.comment ? <p className="mt-2 text-sm text-zinc-700 dark:text-[#C9CAD3] whitespace-pre-line">{String(r.comment)}</p> : <p className="mt-2 text-sm italic text-zinc-500">No text.</p>}
            {r.replyText ? (
              <p className="mt-3 rounded-lg bg-black/5 dark:bg-white/5 p-3 text-sm"><span className="text-xs font-mono uppercase text-zinc-500">Your reply</span><br />{String(r.replyText)}</p>
            ) : open && draft ? (
              <form action={postAction} className="mt-3 space-y-3">
                <input type="hidden" name="tenant" value={tenant.ref} />
                <input type="hidden" name="review" value={String(r.id)} />
                <input type="hidden" name="draft" value={draft.id} />
                <input type="hidden" name="idem" value={`console-${randomBytes(12).toString('hex')}`} />
                <label className="block text-xs font-mono uppercase text-zinc-500">Suggested reply (edit it if you like)</label>
                <textarea name="reply" defaultValue={draft.text} rows={4} className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-transparent p-3 text-sm" />
                <input name="approvedBy" placeholder="Approved by (your name)" required className="w-full rounded-lg border border-black/20 dark:border-white/20 bg-transparent p-2 text-sm" />
                <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" className="mt-1" /> I have read this reply and approve posting it publicly on Google as this business.</label>
                <div className="flex gap-2"><SubmitButton className={primary}>Approve and post</SubmitButton><a href={`/console?t=${encodeURIComponent(tenant.ref)}`} className={btn}>Cancel</a></div>
              </form>
            ) : (
              <form action={suggestAction} className="mt-3">
                <input type="hidden" name="tenant" value={tenant.ref} /><input type="hidden" name="review" value={String(r.id)} />
                <SubmitButton className={btn}>Suggest a reply</SubmitButton>
              </form>
            )}
          </article>
        );
      })}
    </section>
  );
}
