import { redirect } from 'next/navigation';
import { authorise, currentSession, dashboardClientId, type DashSession } from '@/reviews-service/dash-session';
import { listTenants } from '@/reviews-service/reviews';
import type { AuthedClient } from '@/reviews-service/apikeys';

export const box = 'rounded-xl border border-black/[0.08] dark:border-[#30333B] p-4';
export const btn = 'rounded-lg border border-black/20 dark:border-white/20 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10';
export const primary = 'rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-semibold';
export const input = 'w-full rounded-lg border border-black/20 dark:border-white/20 bg-transparent p-2 text-sm';

const MESSAGES: Record<string, string> = {
  UNSAFE_REPLY: 'That reply was refused: it mentions health or treatment, a phone number, a link, or names the reviewer. Reword it in general terms.',
  ALREADY_HAS_REPLY: 'This review already has a reply on Google. Posting would replace it, so it was refused.',
  ALREADY_REPLIED_OR_KEY_USED: 'A reply for this review is already posted or in progress.',
  TICK_THE_BOX_TO_APPROVE: 'Tick the approval box first. Nothing is posted without it.',
  NEEDS_REAUTH: 'Google access was lost. Connect Google again.',
  NOT_CONNECTED: 'This business is not connected to Google yet.',
  RATE_LIMITED: 'Slow down a little and try again in a minute.',
  GOOGLE_ERROR: 'Google did not accept that. Try again shortly.',
  IN_PROGRESS: 'That reply is already being posted. Refresh in a moment.',
  OWNER_ONLY: 'Only the business owner can connect or reconnect Google.',
  LOCATION_UNAVAILABLE: 'That location cannot be linked here.',
  LOCATION_NOT_AVAILABLE: 'That location is not on the connected Google account.',
  INVALID_BUSINESS_NAME: 'Business name: 2 to 61 characters, lowercase letters, numbers and dashes.',
  INVALID_EMAIL: 'That email address does not look right.',
  TENANT_LIMIT_REACHED: 'The limit of businesses has been reached.',
  ERROR: 'Something went wrong. Try again.',
};
// Looks messages up by an allowlist, so nothing from the address bar is ever shown back.
export const messageFor = (code?: string) => (code && Object.hasOwn(MESSAGES, code) ? MESSAGES[code] : code ? MESSAGES.ERROR : null);
const OK: Record<string, string> = { posted: 'Reply posted to Google.', synced: 'Synced.', linked: 'Location linked. Run a sync to bring in its reviews.', added: 'Saved.' };
export const okFor = (code?: string) => (code && Object.hasOwn(OK, code) ? OK[code] : null);

export function Notices({ err, ok }: { err?: string; ok?: string }) {
  const e = messageFor(err);
  const o = okFor(ok);
  return (
    <>
      {e && <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{e}</p>}
      {o && <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">{o}</p>}
    </>
  );
}

type T = Awaited<ReturnType<typeof listTenants>>[number] & { clientId: string };
export interface Ctx {
  session: DashSession;
  tenants: T[];
  tenant: T | undefined;
  client: AuthedClient | null;
}

/** Signed-in person, the businesses they may see, and the one selected by ?t= (checked against that list, never trusted). */
export async function loadContext(sp: Record<string, string | undefined>): Promise<Ctx> {
  const session = await currentSession();
  if (!session) redirect('/login');
  const clientIds = new Set(session.memberships.map((m) => m.clientId));
  if (session.isAdmin) clientIds.add(dashboardClientId());
  const all = (await Promise.all([...clientIds].map(async (clientId) => (await listTenants({ clientId, apiKeyId: 'dash', scopes: [] })).map((t) => ({ ...t, clientId }))))).flat();
  const tenants = session.isAdmin ? all : all.filter((t) => session.memberships.some((m) => m.ref === t.ref && m.clientId === t.clientId));
  const tenant = tenants.find((t) => t.ref === sp.t) ?? tenants[0];
  return { session, tenants, tenant, client: tenant ? authorise(session, tenant.ref, tenant.clientId) : null };
}

export function TenantTabs({ ctx, path }: { ctx: Ctx; path: string }) {
  if (ctx.tenants.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {ctx.tenants.map((x) => (
        <a key={x.ref} href={`${path}?t=${encodeURIComponent(x.ref)}`} className={`${btn} ${x.ref === ctx.tenant?.ref ? 'bg-black/10 dark:bg-white/15' : ''}`}>
          {x.ref}{x.unreplied ? <span className="text-zinc-500"> · {x.unreplied} unreplied</span> : null}
        </a>
      ))}
    </div>
  );
}
