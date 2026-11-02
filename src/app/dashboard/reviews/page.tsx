import { Suspense } from 'react';
import { randomBytes } from 'node:crypto';
import { getDraft, listReviews } from '@/reviews-service/reviews';
import { Notices, TenantTabs, box, btn, input, loadContext, primary } from '../_ui/shared';
import { SubmitButton } from '../../console/submit-button';
import { postAction, suggestAction, syncAction } from '../actions';

type SP = Promise<Record<string, string | undefined>>;

export default function ReviewsPage({ searchParams }: { searchParams: SP }) {
  return <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}><Body searchParams={searchParams} /></Suspense>;
}

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await loadContext(sp);
  const t = ctx.tenant;
  const c = ctx.client;
  if (!t || !c) return <p className="text-sm text-zinc-500">No businesses to show yet.</p>;
  const list = await listReviews(c, t.ref, { limit: 50 });
  const draft = sp.review && sp.draft ? await getDraft(c, t.ref, sp.review, sp.draft) : null;
  return (
    <>
      <Notices err={sp.err} ok={sp.ok} />
      <TenantTabs ctx={ctx} path="/reviews" />
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-zinc-950 dark:text-[#F4F3F8]">Reviews · {t.ref}</h1>
        <form action={syncAction}><input type="hidden" name="tenant" value={t.ref} /><input type="hidden" name="from" value="reviews" /><SubmitButton className={btn}>Sync now</SubmitButton></form>
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
                <input type="hidden" name="tenant" value={t.ref} /><input type="hidden" name="review" value={String(r.id)} /><input type="hidden" name="draft" value={draft.id} />
                <input type="hidden" name="idem" value={`dash-${randomBytes(12).toString('hex')}`} />
                <label className="block text-xs font-mono uppercase text-zinc-500">Suggested reply (edit it if you like)</label>
                <textarea name="reply" defaultValue={draft.text} rows={4} className={input} />
                <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" className="mt-1" /> I have read this reply and approve posting it publicly on Google as this business. It will be recorded as approved by {ctx.session.email}.</label>
                <div className="flex gap-2"><SubmitButton className={primary}>Approve and post</SubmitButton><a href={`/reviews?t=${encodeURIComponent(t.ref)}`} className={btn}>Cancel</a></div>
              </form>
            ) : (
              <form action={suggestAction} className="mt-3"><input type="hidden" name="tenant" value={t.ref} /><input type="hidden" name="review" value={String(r.id)} /><SubmitButton className={btn}>Suggest a reply</SubmitButton></form>
            )}
          </article>
        );
      })}
    </>
  );
}
