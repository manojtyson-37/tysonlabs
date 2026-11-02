import type { AuthedClient } from './apikeys';
import { unscoped, withScope } from './db';
import { audit, resolveTenant, ServiceError } from './service';

export interface Membership {
  clientId: string;
  tenantId: string;
  ref: string;
  role: 'owner' | 'staff';
}

export const normaliseEmail = (e: string) => e.trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Every business this verified Google email may open. Empty means no access. */
export async function membershipsFor(email: string): Promise<Membership[]> {
  const e = normaliseEmail(email);
  if (!EMAIL_RE.test(e)) return [];
  const rows = await unscoped(async (db) => (await db.query('SELECT * FROM auth_member_tenants($1)', [e])).rows);
  return rows.map((r) => ({ clientId: r.client_id as string, tenantId: r.tenant_id as string, ref: r.external_ref as string, role: r.role as 'owner' | 'staff' }));
}

export async function recordLogin(email: string) {
  await unscoped((db) => db.query('SELECT auth_member_login($1)', [normaliseEmail(email)]));
}

/** Creates the business (if it does not exist yet) and gives an email access to it. Used by the admin page. */
export async function provisionBusiness(a: AuthedClient, input: { ref: string; ownerEmail: string; role?: 'owner' | 'staff' }, invitedBy: string) {
  const ref = (input.ref ?? '').trim();
  const email = normaliseEmail(input.ownerEmail ?? '');
  if (!/^[a-z0-9][a-z0-9-]{1,60}$/.test(ref)) throw new ServiceError(400, 'INVALID_BUSINESS_NAME');
  if (!EMAIL_RE.test(email)) throw new ServiceError(400, 'INVALID_EMAIL');
  const role = input.role === 'staff' ? 'staff' : 'owner';
  return withScope({ clientId: a.clientId }, async (db) => {
    const cap = await db.query('SELECT max_tenants, (SELECT count(*)::int FROM tenants WHERE client_id = $1) AS n, EXISTS (SELECT 1 FROM tenants WHERE client_id = $1 AND external_ref = $2) AS exists FROM clients WHERE id = $1', [a.clientId, ref]);
    if (!cap.rows[0].exists && cap.rows[0].n >= cap.rows[0].max_tenants) throw new ServiceError(429, 'TENANT_LIMIT_REACHED');
    const t = await db.query('INSERT INTO tenants (client_id, external_ref) VALUES ($1,$2) ON CONFLICT (client_id, external_ref) DO UPDATE SET external_ref = EXCLUDED.external_ref RETURNING id', [a.clientId, ref]);
    await db.query(
      'INSERT INTO tenant_members (client_id, tenant_id, email, role, invited_by) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (tenant_id, email) DO UPDATE SET role = EXCLUDED.role',
      [a.clientId, t.rows[0].id, email, role, invitedBy.slice(0, 200)],
    );
    await audit(db, a, a.clientId, t.rows[0].id as string, 'member.added', `${role}`);
    return { ref, email, role };
  });
}

export async function listMembers(a: AuthedClient, tenantRef: string) {
  const tenantId = await resolveTenant(a, tenantRef);
  return withScope({ clientId: a.clientId, tenantId }, async (db) =>
    (await db.query('SELECT email, role, last_login_at FROM tenant_members WHERE tenant_id = $1 ORDER BY created_at', [tenantId])).rows as { email: string; role: string; last_login_at: Date | null }[],
  );
}
