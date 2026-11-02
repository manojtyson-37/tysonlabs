import { cookies } from 'next/headers';
import type { AuthedClient } from './apikeys';
import { Membership, membershipsFor } from './members';
import { signToken, verifyToken } from './signed';

export const SESSION_COOKIE = 'tl_dash';
export const SESSION_HOURS = 12;

export const makeSessionCookie = (email: string) => signToken({ email }, 'dash-session', SESSION_HOURS * 3600);
export const emailFromCookie = (v: string | undefined | null) => verifyToken<{ email: string }>(v, 'dash-session')?.email ?? null;

export interface DashSession {
  email: string;
  isAdmin: boolean; // TysonLabs staff listed in DASHBOARD_ADMIN_EMAILS: may open every business of the dashboard client
  memberships: Membership[];
}

const adminEmails = () => (process.env.DASHBOARD_ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
export const dashboardClientId = () => {
  const id = process.env.DASHBOARD_CLIENT_ID;
  if (!id) throw new Error('DASHBOARD_CLIENT_ID is not set');
  return id;
};

/** Reads the cookie and loads the person's access from the database on every request, so removing a member takes effect at once. */
export async function currentSession(): Promise<DashSession | null> {
  const email = emailFromCookie((await cookies()).get(SESSION_COOKIE)?.value);
  if (!email) return null;
  const memberships = await membershipsFor(email);
  const isAdmin = adminEmails().includes(email);
  if (!isAdmin && memberships.length === 0) return null;
  return { email, isAdmin, memberships };
}

/** The only way the dashboard turns a business name from a URL or form into data access. */
export function authorise(s: DashSession, ref: string, clientId?: string): AuthedClient | null {
  const member = s.memberships.find((m) => m.ref === ref && (!clientId || m.clientId === clientId));
  if (!member && !s.isAdmin) return null;
  // Staff can read, sync and post approved replies; only owners (and TysonLabs admins) may connect or reconnect Google.
  const scopes = member && !s.isAdmin && member.role === 'staff' ? ['read', 'write'] : ['connect', 'read', 'write'];
  return { clientId: member?.clientId ?? dashboardClientId(), apiKeyId: `dash:${s.email}`.slice(0, 100), scopes };
}
