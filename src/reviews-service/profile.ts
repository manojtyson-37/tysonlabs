import { AuthedClient } from './apikeys';
import { getGoogle } from './container';
import { rateLimit, withScope } from './db';
import { DAYS, GoogleError, type GoogleProfile, type PerformanceReport, type ProfileChange } from './google';
import { ServiceError, accessTokenFor, audit, resolveTenant } from './service';

/**
 * The business listing on Google, shown and (for a few safe fields) edited from the dashboard.
 * Name, address and categories are read only here: changing them on a live listing can trigger re-verification or suspension.
 */
async function firstLocation(a: AuthedClient, tenantRef: string) {
  const tenantId = await resolveTenant(a, tenantRef);
  const link = await withScope({ clientId: a.clientId, tenantId }, async (db) =>
    (await db.query('SELECT google_location_id FROM location_links WHERE tenant_id = $1 ORDER BY created_at LIMIT 1', [tenantId])).rows[0] as { google_location_id: string } | undefined,
  );
  if (!link) throw new ServiceError(409, 'NOT_CONNECTED');
  return { tenantId, locationId: link.google_location_id, token: await accessTokenFor(a, tenantId) };
}

function mapGoogle(err: unknown): never {
  if (err instanceof ServiceError) throw err;
  if (err instanceof GoogleError) {
    if (err.kind === 'unauthorized') throw new ServiceError(409, 'NEEDS_REAUTH');
    if (err.kind === 'invalid_change') throw new ServiceError(422, 'GOOGLE_REJECTED_CHANGE');
    if (err.kind === 'api_not_enabled') throw new ServiceError(503, 'API_NOT_ENABLED');
  }
  throw new ServiceError(502, 'GOOGLE_ERROR');
}

export async function getProfile(a: AuthedClient, tenantRef: string): Promise<GoogleProfile> {
  const { locationId, token } = await firstLocation(a, tenantRef);
  try { return await getGoogle().getLocation(token, locationId); } catch (e) { return mapGoogle(e); }
}

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE = /^\+?[0-9 ()-]{7,20}$/;

/** Turns whatever the caller sent into a clean change, or throws a specific error. Unknown fields are ignored. */
export function cleanChange(raw: unknown): ProfileChange {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: ProfileChange = {};
  if (r.primaryPhone !== undefined) {
    if (typeof r.primaryPhone !== 'string' || !PHONE.test(r.primaryPhone.trim())) throw new ServiceError(400, 'INVALID_PHONE');
    out.primaryPhone = r.primaryPhone.trim();
  }
  if (r.websiteUri !== undefined) {
    let ok = false;
    try { const u = new URL(String(r.websiteUri)); ok = u.protocol === 'https:' || u.protocol === 'http:'; } catch { /* invalid */ }
    if (!ok || String(r.websiteUri).length > 300) throw new ServiceError(400, 'INVALID_WEBSITE');
    out.websiteUri = String(r.websiteUri).trim();
  }
  if (r.description !== undefined) {
    if (typeof r.description !== 'string' || r.description.trim().length > 750) throw new ServiceError(400, 'INVALID_DESCRIPTION');
    out.description = r.description.trim();
  }
  if (r.hours !== undefined) {
    if (!Array.isArray(r.hours) || r.hours.length > 7) throw new ServiceError(400, 'INVALID_HOURS');
    const seen = new Set<string>();
    out.hours = r.hours.map((h) => {
      const x = (h ?? {}) as Record<string, unknown>;
      const day = String(x.day);
      if (!(DAYS as readonly string[]).includes(day) || seen.has(day) || !HHMM.test(String(x.open)) || !HHMM.test(String(x.close)) || String(x.open) >= String(x.close)) throw new ServiceError(400, 'INVALID_HOURS');
      seen.add(day);
      return { day: day as (typeof DAYS)[number], open: String(x.open), close: String(x.close) };
    });
  }
  if (!Object.keys(out).length) throw new ServiceError(400, 'NO_CHANGES');
  return out;
}

/** Asks Google to check the change without applying it. */
export async function previewProfile(a: AuthedClient, tenantRef: string, raw: unknown) {
  const change = cleanChange(raw);
  const { locationId, token } = await firstLocation(a, tenantRef);
  try { await getGoogle().patchLocation(token, locationId, change, true); } catch (e) { mapGoogle(e); }
  return { ok: true, fields: Object.keys(change) };
}

export async function updateProfile(a: AuthedClient, tenantRef: string, raw: unknown, approvedBy: string) {
  const change = cleanChange(raw);
  const { tenantId, locationId, token } = await firstLocation(a, tenantRef);
  if (!(await rateLimit(`profile:${tenantId}`, 20))) throw new ServiceError(429, 'RATE_LIMITED');
  try { await getGoogle().patchLocation(token, locationId, change, false); } catch (e) { mapGoogle(e); }
  // The audit row records which fields changed and who approved, never the values.
  await withScope({ clientId: a.clientId, tenantId }, (db) => audit(db, a, a.clientId, tenantId, 'profile.updated', `${Object.keys(change).join(',')} by ${approvedBy}`.slice(0, 200)));
  return { ok: true, fields: Object.keys(change) };
}

export async function getPerformance(a: AuthedClient, tenantRef: string, days = 30): Promise<{ available: true; report: PerformanceReport } | { available: false; reason: string }> {
  const { locationId, token } = await firstLocation(a, tenantRef);
  try {
    return { available: true, report: await getGoogle().fetchPerformance(token, locationId, Math.min(Math.max(Math.floor(days) || 30, 7), 90)) };
  } catch (e) {
    if (e instanceof GoogleError && e.kind === 'api_not_enabled') return { available: false, reason: 'NOT_ENABLED' };
    return mapGoogle(e);
  }
}
