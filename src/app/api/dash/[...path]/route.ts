import { NextResponse } from 'next/server';
import { appSession, redeemHandoff, requireAppKey } from '@/reviews-service/app-auth';
import { authorise, dashboardClientId, type DashSession } from '@/reviews-service/dash-session';
import { handleError, noStore } from '@/reviews-service/http';
import { listMembers, provisionBusiness } from '@/reviews-service/members';
import { createDraft, exportTenant, getDraft, listReviews, listTenants, postReply, summary, syncNow, newIdempotencyKey } from '@/reviews-service/reviews';
import { audit, availableLocations, createConnectSession, getConnection, linkLocation, resolveTenant, ServiceError } from '@/reviews-service/service';
import { rateLimit, withScope } from '@/reviews-service/db';
import { adminAction, cancel as cancelSubscription, getBillingView, getSettings, subscribe, updateSettings } from '@/reviews-service/billing';
import { confirmDeletion, requestDeletion } from '@/reviews-service/deletion';
import { ensureNotifications } from '@/reviews-service/notify';
import { getPerformance, getProfile, previewProfile, updateProfile } from '@/reviews-service/profile';
import { isAllowedPushEndpoint, removeSubscription, saveSubscription, vapidPublicKey } from '@/reviews-service/push';
import type { AuthedClient } from '@/reviews-service/apikeys';

/**
 * API for the separate reviews app, called server-to-server. Every route first resolves the signed-in person's access from the
 * database (appSession), then turns the business name in the URL into data access only through authorise().
 */
type Ctx = { params: Promise<{ path: string[] }> };

const ok = (body: unknown) => NextResponse.json(body, noStore);
const body = async (request: Request): Promise<Record<string, unknown>> => {
  try { const j = await request.json(); return j && typeof j === 'object' ? (j as Record<string, unknown>) : {}; } catch { return {}; }
};
const str = (v: unknown, max = 500) => (typeof v === 'string' && v.length <= max ? v.trim() : '');

const adminClient = (s: DashSession): AuthedClient => ({ clientId: dashboardClientId(), apiKeyId: `dash:${s.email}`.slice(0, 100), scopes: ['connect', 'read', 'write'] });
function forBusiness(s: DashSession, ref: string): AuthedClient {
  const c = authorise(s, ref);
  if (!c) throw new ServiceError(403, 'FORBIDDEN');
  return c;
}

/** Owner of this exact business (a membership with the owner role). Staff and TysonLabs admins who are not members are refused: erasing a clinic's data is the owner's decision. */
function ownerOf(s: DashSession, ref: string): AuthedClient {
  const c = forBusiness(s, ref);
  // The membership must be under the same client the access came from, so one ref under two clients can never mix.
  if (!c.scopes.includes('connect') || !s.memberships.some((m) => m.ref === ref && m.clientId === c.clientId && m.role === 'owner')) throw new ServiceError(403, 'OWNER_ONLY');
  return c;
}

async function businesses(s: DashSession) {
  const clientIds = new Set(s.memberships.map((m) => m.clientId));
  if (s.isAdmin) clientIds.add(dashboardClientId());
  const all = (await Promise.all([...clientIds].map(async (clientId) => (await listTenants({ clientId, apiKeyId: 'dash', scopes: [] })).map((t) => ({ ...t, clientId }))))).flat();
  const visible = s.isAdmin ? all : all.filter((t) => s.memberships.some((m) => m.ref === t.ref && m.clientId === t.clientId));
  return visible.map((t) => ({
    ref: t.ref, role: s.isAdmin ? 'owner' : s.memberships.find((m) => m.ref === t.ref && m.clientId === t.clientId)!.role,
    member: s.memberships.some((m) => m.ref === t.ref && m.clientId === t.clientId), // false: an admin looking at a business they do not belong to (owner-only actions are refused)
    status: t.status, googleEmail: t.googleEmail, reviews: t.reviews, unreplied: t.unreplied, lastSyncedAt: t.lastSyncedAt,
  }));
}

export async function GET(request: Request, { params }: Ctx) {
  try {
    const { path } = await params;
    const s = await appSession(request);
    const url = new URL(request.url);
    if (path.length === 1 && path[0] === 'me') return ok({ email: s.email, isAdmin: s.isAdmin, businesses: await businesses(s) });

    if (path.length === 2 && path[0] === 'push' && path[1] === 'config') return ok({ publicKey: vapidPublicKey() });

    if (path.length === 2 && path[0] === 'admin' && path[1] === 'businesses') {
      if (!s.isAdmin) throw new ServiceError(403, 'FORBIDDEN');
      const c = adminClient(s);
      const tenants = await listTenants(c);
      return ok({ businesses: await Promise.all(tenants.map(async (t) => ({ ...t, members: (await listMembers(c, t.ref)).map((m) => ({ email: m.email, role: m.role, lastLoginAt: m.last_login_at })) }))) });
    }

    if (path.length === 2 && path[0] === 'admin' && path[1] === 'billing-settings') {
      if (!s.isAdmin) throw new ServiceError(403, 'FORBIDDEN');
      return ok(await getSettings());
    }

    if (path.length === 3 && path[0] === 'b') {
      const ref = path[1];
      const c = forBusiness(s, ref);
      if (path[2] === 'billing') return ok(await getBillingView(c, ref)); // any member may see it; changing it is owner only (POST)
      if (path[2] === 'overview') {
        const [sum, recent, all] = await Promise.all([summary(c, ref), listReviews(c, ref, { limit: 5 }), businesses(s)]);
        const business = all.find((b) => b.ref === ref);
        if (!business) throw new ServiceError(404, 'NOT_FOUND');
        return ok({ business, summary: sum, recent: recent.reviews });
      }
      if (path[2] === 'reviews') {
        const list = (await listReviews(c, ref, { limit: 100 })).reviews;
        return ok({ reviews: url.searchParams.get('filter') === 'unreplied' ? list.filter((r) => !r.replyText) : list });
      }
      if (path[2] === 'export') {
        const owner = ownerOf(s, ref); // the whole archive, including who approved each reply, is for the clinic's owner, not TysonLabs admins who are not members
        if (!(await rateLimit(`export:${s.email}:${ref}`, 5, 3600))) throw new ServiceError(429, 'RATE_LIMITED');
        const data = await exportTenant(owner, ref); // same data as the API key export: no tokens, keys or secrets are in it
        const tenantId = await resolveTenant(owner, ref);
        await withScope({ clientId: owner.clientId, tenantId }, (db) => audit(db, owner, owner.clientId, tenantId, 'export.downloaded', s.email.slice(0, 200)));
        const day = new Date().toISOString().slice(0, 10);
        const name = `tysonlabs-reviews-${ref.replace(/[^a-z0-9-]/gi, '')}-${day}.json`;
        return new NextResponse(JSON.stringify(data, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'no-store' } });
      }
      if (path[2] === 'profile') {
        return ok({ profile: await getProfile(c, ref), canEdit: c.scopes.includes('connect') });
      }
      if (path[2] === 'performance') {
        return ok(await getPerformance(c, ref, Number(url.searchParams.get('days')) || 30));
      }
      if (path[2] === 'connection') {
        const conn = await getConnection(c, ref);
        const tenantId = await resolveTenant(c, ref);
        const linked = await withScope({ clientId: c.clientId, tenantId }, async (db) => (await db.query('SELECT google_location_id, name FROM location_links WHERE tenant_id = $1 ORDER BY name', [tenantId])).rows as { google_location_id: string; name: string }[]);
        const available = conn.connected ? await availableLocations(c, ref).catch(() => []) : [];
        return ok({
          connected: conn.connected, status: conn.status, googleEmail: conn.googleEmail, canConnect: c.scopes.includes('connect'),
          linked: linked.map((l) => ({ id: l.google_location_id, name: l.name })),
          available: available.filter((l) => !linked.some((x) => x.google_location_id === l.googleLocationId)).map((l) => ({ id: l.googleLocationId, name: l.name, address: l.address ?? null })),
        });
      }
    }
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const { path } = await params;
    if (path.length === 1 && path[0] === 'handoff') {
      requireAppKey(request);
      const hb = await body(request);
      const email = await redeemHandoff(str(hb.token, 1000), str(hb.nonce, 100));
      return email ? ok({ email }) : NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    const s = await appSession(request);
    const b = await body(request);

    if (path.length === 2 && path[0] === 'push' && path[1] === 'subscribe') {
      const keys = (b.keys && typeof b.keys === 'object' ? b.keys : {}) as Record<string, unknown>;
      const endpoint = str(b.endpoint, 2048), p256dh = str(keys.p256dh, 256), auth = str(keys.auth, 128);
      if (!endpoint || !p256dh || !auth || !isAllowedPushEndpoint(endpoint)) throw new ServiceError(400, 'INVALID_SUBSCRIPTION');
      const saved = await saveSubscription(s.email, endpoint, p256dh, auth);
      if (saved === 'cap') throw new ServiceError(409, 'TOO_MANY_DEVICES');
      if (saved === 'taken') throw new ServiceError(409, 'ENDPOINT_IN_USE');
      return ok({ ok: true });
    }
    if (path.length === 2 && path[0] === 'push' && path[1] === 'unsubscribe') {
      const endpoint = str(b.endpoint, 2048);
      if (!endpoint) throw new ServiceError(400, 'INVALID_SUBSCRIPTION');
      await removeSubscription(s.email, endpoint);
      return ok({ ok: true });
    }

    if (path.length === 2 && path[0] === 'admin' && path[1] === 'members') {
      if (!s.isAdmin) throw new ServiceError(403, 'FORBIDDEN');
      await provisionBusiness(adminClient(s), { ref: str(b.ref, 100), ownerEmail: str(b.email, 254), role: b.role === 'staff' ? 'staff' : 'owner' }, s.email);
      return ok({ ok: true });
    }

    if (path.length === 2 && path[0] === 'admin' && path[1] === 'billing-settings') {
      if (!s.isAdmin) throw new ServiceError(403, 'FORBIDDEN');
      return ok(await updateSettings(adminClient(s), { trialDays: b.trialDays, trialRequiresCard: b.trialRequiresCard, priceInr: b.priceInr }));
    }
    if (path.length === 4 && path[0] === 'admin' && path[1] === 'b' && path[3] === 'billing') {
      if (!s.isAdmin) throw new ServiceError(403, 'FORBIDDEN');
      return ok(await adminAction(adminClient(s), path[2], { action: b.action, days: b.days, state: b.state }));
    }
    if (path.length === 4 && path[0] === 'b' && path[2] === 'billing' && path[3] === 'subscribe') return ok(await subscribe(ownerOf(s, path[1]), path[1]));
    if (path.length === 4 && path[0] === 'b' && path[2] === 'billing' && path[3] === 'cancel') return ok(await cancelSubscription(ownerOf(s, path[1]), path[1]));

    // Erasing a business: the same two-confirmation rule as the API, only for the signed-in owner's own business and only as a full erase.
    if (path.length === 3 && path[0] === 'b' && path[2] === 'deletion-requests') {
      return ok(await requestDeletion(ownerOf(s, path[1]), path[1], { action: 'erase_tenant' }));
    }
    if (path.length === 5 && path[0] === 'b' && path[2] === 'deletion-requests' && path[4] === 'confirm') {
      return ok(await confirmDeletion(ownerOf(s, path[1]), path[1], path[3], { step: b.step, token: b.token, phrase: b.phrase }));
    }

    if (path.length === 3 && path[0] === 'b') {
      const ref = path[1];
      const c = forBusiness(s, ref);
      const action = path[2];
      if (action === 'sync') { await syncNow(c, ref); return ok({ ok: true }); }
      if (action === 'drafts') {
        const d = await createDraft(c, ref, str(b.reviewId, 64));
        return ok({ draftId: d.draftId, text: d.text });
      }
      if (action === 'reply') {
        const reviewId = str(b.reviewId, 64);
        const draftId = str(b.draftId, 64);
        const text = typeof b.text === 'string' ? b.text.trim() : '';
        let input: { draftId?: string; text?: string };
        if (text) {
          const original = draftId ? await getDraft(c, ref, reviewId, draftId) : null;
          input = original && original.text.trim() === text ? { draftId } : { text }; // unchanged suggestion keeps its draft; an edit is posted as the person's own text
        } else if (draftId) input = { draftId };
        else throw new ServiceError(400, 'REPLY_REQUIRED');
        const key = str(b.idempotencyKey, 100);
        // The approver is the signed-in person, as asserted by the app and re-checked against the access list above.
        await postReply(c, ref, reviewId, { ...input, approvedBy: s.email, idempotencyKey: key.length >= 8 ? key : newIdempotencyKey() });
        return ok({ ok: true });
      }
      if (action === 'connect') {
        if (!c.scopes.includes('connect')) throw new ServiceError(403, 'OWNER_ONLY');
        return ok({ url: (await createConnectSession(c, { tenantRef: ref, returnUrl: str(b.returnUrl, 500) })).url });
      }
      if (action === 'profile-preview' || action === 'profile') {
        if (!c.scopes.includes('connect')) throw new ServiceError(403, 'OWNER_ONLY'); // editing the public listing is an owner decision
        return ok(action === 'profile' ? await updateProfile(c, ref, b.changes, s.email) : await previewProfile(c, ref, b.changes));
      }
      if (action === 'link') {
        if (!c.scopes.includes('connect')) throw new ServiceError(403, 'OWNER_ONLY');
        await linkLocation(c, ref, str(b.locationId, 200));
        await ensureNotifications(c.clientId, await resolveTenant(c, ref)).catch(() => undefined); // best effort: the 15 minute sync still runs without it
        return ok({ ok: true });
      }
    }
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  } catch (err) {
    return handleError(err);
  }
}
