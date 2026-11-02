'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { clientIp } from '@/reviews-service/apikeys';
import { rateLimit } from '@/reviews-service/db';
import { COOKIE, SESSION_HOURS, consoleClient, makeSession, passwordOk, verifySession } from '@/reviews-service/console-session';
import { createDraft, getDraft, postReply, syncNow } from '@/reviews-service/reviews';
import { ServiceError } from '@/reviews-service/service';

async function requireSession() {
  if (!verifySession((await cookies()).get(COOKIE)?.value)) redirect('/console');
}
const text = (f: FormData, k: string) => (typeof f.get(k) === 'string' ? (f.get(k) as string).trim() : '');
const back = (tenant: string, extra: Record<string, string> = {}) => `/console?${new URLSearchParams({ t: tenant, ...extra })}`;
// Only a short code is put in the URL, never review text.
const codeOf = (e: unknown) => (e instanceof ServiceError ? e.code : 'ERROR');

export async function login(_prev: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  const ip = clientIp(new Request('https://x', { headers: await headers() })) ?? 'unknown';
  try {
    // Per caller, plus one global bucket so rotating a client IP header cannot dodge the limit.
    if (!(await rateLimit(`console-login:${ip}`, 8)) || !(await rateLimit('console-login:all', 60))) return { error: 'Too many attempts. Wait a minute.' };
  } catch (e) {
    console.error('[console] login rate limit failed', e instanceof Error ? e.name : 'unknown');
    return { error: 'Service unavailable.' };
  }
  if (!passwordOk(text(form, 'password'))) return { error: 'Wrong password.' };
  (await cookies()).set(COOKIE, makeSession(), { httpOnly: true, secure: true, sameSite: 'strict', path: '/console', maxAge: SESSION_HOURS * 3600 });
  redirect('/console');
}

export async function logout() {
  (await cookies()).delete({ name: COOKIE, path: '/console' });
  redirect('/console');
}

export async function syncAction(form: FormData) {
  await requireSession();
  const tenant = text(form, 'tenant');
  let err = '';
  try {
    await syncNow(consoleClient(), tenant);
  } catch (e) {
    err = codeOf(e);
  }
  redirect(back(tenant, err ? { err } : { ok: 'synced' }));
}

export async function suggestAction(form: FormData) {
  await requireSession();
  const tenant = text(form, 'tenant');
  const review = text(form, 'review');
  let draftId = '';
  let err = '';
  try {
    draftId = (await createDraft(consoleClient(), tenant, review)).draftId;
  } catch (e) {
    err = codeOf(e);
  }
  redirect(back(tenant, err ? { err } : { review, draft: draftId }));
}

export async function postAction(form: FormData) {
  await requireSession();
  const tenant = text(form, 'tenant');
  const review = text(form, 'review');
  const draftId = text(form, 'draft');
  const reply = text(form, 'reply');
  const approvedBy = text(form, 'approvedBy');
  const idem = text(form, 'idem');
  if (form.get('confirm') !== 'yes') redirect(back(tenant, { review, draft: draftId, err: 'TICK_THE_BOX_TO_APPROVE' }));
  let err = '';
  try {
    const c = consoleClient();
    const original = await getDraft(c, tenant, review, draftId);
    // Unchanged text posts the draft itself; edited text is checked and stored as an edited draft.
    const input = original && original.text.trim() === reply ? { draftId } : { text: reply };
    await postReply(c, tenant, review, { ...input, approvedBy, idempotencyKey: idem });
  } catch (e) {
    err = codeOf(e);
  }
  redirect(back(tenant, err ? { review, draft: draftId, err } : { ok: 'posted' }));
}
