'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AuthedClient } from '@/reviews-service/apikeys';
import { SESSION_COOKIE, authorise, currentSession, dashboardClientId, type DashSession } from '@/reviews-service/dash-session';
import { provisionBusiness } from '@/reviews-service/members';
import { createConnectSession, linkLocation, ServiceError } from '@/reviews-service/service';
import { createDraft, getDraft, postReply, syncNow } from '@/reviews-service/reviews';

const base = () => (process.env.DASHBOARD_BASE_URL ?? 'https://reviews.tysonlabs.in').replace(/\/$/, '');
const text = (f: FormData, k: string) => (typeof f.get(k) === 'string' ? (f.get(k) as string).trim() : '');
const back = (path: string, tenant: string, extra: Record<string, string> = {}) => `${path}?${new URLSearchParams({ t: tenant, ...extra })}`;
const codeOf = (e: unknown) => (e instanceof ServiceError ? e.code : 'ERROR'); // only a short code ever goes in a URL

/** Every action starts here: who is this, and may they act on this business? The business name from the form is only a request. */
async function authorised(tenant: string): Promise<{ client: AuthedClient; session: DashSession }> {
  const session = await currentSession();
  if (!session) redirect('/login');
  const client = authorise(session, tenant);
  if (!client) redirect('/');
  return { client, session };
}

export async function logout() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: '/' });
  redirect('/login');
}

export async function syncAction(form: FormData) {
  const tenant = text(form, 'tenant');
  const { client } = await authorised(tenant);
  let err = '';
  try { await syncNow(client, tenant); } catch (e) { err = codeOf(e); }
  redirect(back(text(form, 'from') === 'reviews' ? '/reviews' : '/', tenant, err ? { err } : { ok: 'synced' }));
}

export async function suggestAction(form: FormData) {
  const tenant = text(form, 'tenant');
  const review = text(form, 'review');
  const { client } = await authorised(tenant);
  let draft = '';
  let err = '';
  try { draft = (await createDraft(client, tenant, review)).draftId; } catch (e) { err = codeOf(e); }
  redirect(back('/reviews', tenant, err ? { err } : { review, draft }));
}

export async function postAction(form: FormData) {
  const tenant = text(form, 'tenant');
  const review = text(form, 'review');
  const draftId = text(form, 'draft');
  const { client, session } = await authorised(tenant);
  if (form.get('confirm') !== 'yes') redirect(back('/reviews', tenant, { review, draft: draftId, err: 'TICK_THE_BOX_TO_APPROVE' }));
  let err = '';
  try {
    const reply = text(form, 'reply');
    const original = await getDraft(client, tenant, review, draftId);
    const input = original && original.text.trim() === reply ? { draftId } : { text: reply };
    // The approver is the signed-in person, not something typed into the form.
    await postReply(client, tenant, review, { ...input, approvedBy: session.email, idempotencyKey: text(form, 'idem') });
  } catch (e) { err = codeOf(e); }
  redirect(back('/reviews', tenant, err ? { review, draft: draftId, err } : { ok: 'posted' }));
}

export async function connectAction(form: FormData) {
  const tenant = text(form, 'tenant');
  const { client } = await authorised(tenant);
  if (!client.scopes.includes('connect')) redirect(back('/connect', tenant, { err: 'OWNER_ONLY' }));
  let url = '';
  let err = '';
  try { url = (await createConnectSession(client, { tenantRef: tenant, returnUrl: `${base()}/connect?t=${encodeURIComponent(tenant)}` })).url; } catch (e) { err = codeOf(e); }
  if (err) redirect(back('/connect', tenant, { err }));
  redirect(url);
}

export async function linkAction(form: FormData) {
  const tenant = text(form, 'tenant');
  const { client } = await authorised(tenant);
  if (!client.scopes.includes('connect')) redirect(back('/connect', tenant, { err: 'OWNER_ONLY' }));
  let err = '';
  try { await linkLocation(client, tenant, text(form, 'location')); } catch (e) { err = codeOf(e); }
  redirect(back('/connect', tenant, err ? { err } : { ok: 'linked' }));
}

export async function adminAddAction(form: FormData) {
  const session = await currentSession();
  if (!session?.isAdmin) redirect('/');
  let err = '';
  try {
    const client: AuthedClient = { clientId: dashboardClientId(), apiKeyId: `dash:${session.email}`.slice(0, 100), scopes: ['connect', 'read', 'write'] };
    await provisionBusiness(client, { ref: text(form, 'ref'), ownerEmail: text(form, 'email'), role: text(form, 'role') === 'staff' ? 'staff' : 'owner' }, session.email);
  } catch (e) { err = codeOf(e); }
  redirect(`/admin?${new URLSearchParams(err ? { err } : { ok: 'added' })}`);
}
