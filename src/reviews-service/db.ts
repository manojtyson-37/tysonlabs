import { Pool, PoolClient } from 'pg';

let pool: Pool | undefined;

/** Pool for the restricted application role. Never connect this service as the owner role. */
export function getPool(): Pool {
  if (!pool) {
    const url = process.env.REVIEWS_DATABASE_URL;
    if (!url) throw new Error('REVIEWS_DATABASE_URL is not set');
    pool = new Pool({ connectionString: url, max: 5 });
    verified = assertRestrictedRole(pool);
  }
  return pool;
}

let verified: Promise<void> | undefined;

/** Fails loudly if REVIEWS_DATABASE_URL points at a role that could bypass row-level security. */
async function assertRestrictedRole(p: Pool): Promise<void> {
  const r = await p.query(
    `SELECT r.rolsuper, r.rolbypassrls,
            EXISTS (SELECT 1 FROM pg_class c WHERE c.relowner = r.oid AND c.relkind = 'r' AND c.relnamespace = 'public'::regnamespace) AS owns_tables
     FROM pg_roles r WHERE r.rolname = current_user`,
  );
  const row = r.rows[0];
  if (!row || row.rolsuper || row.rolbypassrls || row.owns_tables) {
    throw new Error('REVIEWS_DATABASE_URL must use the restricted app role (not superuser, no BYPASSRLS, owns no tables)');
  }
}

/** True while `bucket` is within `limit` hits per window. Shared across serverless instances via the database. */
export async function rateLimit(bucket: string, limit: number, windowSeconds = 60): Promise<boolean> {
  const r = await getPool().query('SELECT rate_limit_hit($1,$2,$3) AS ok', [bucket, limit, windowSeconds]);
  return r.rows[0].ok as boolean;
}

export function setPool(p: Pool | undefined) {
  pool = p;
  verified = p ? assertRestrictedRole(p) : undefined;
}

export interface Scope {
  clientId: string;
  tenantId?: string;
}

/**
 * The only way routes touch tenant data. Runs fn in a transaction with app.client_id / app.tenant_id set,
 * so row-level security restricts every query to the caller's rows. Without a scope nothing is visible.
 */
export async function withScope<T>(scope: Scope, fn: (db: PoolClient) => Promise<T>): Promise<T> {
  if (!scope.clientId) throw new Error('withScope requires a clientId');
  const p = getPool();
  await verified;
  const db = await p.connect();
  try {
    await db.query('BEGIN');
    await db.query("SELECT set_config('app.client_id', $1, true), set_config('app.tenant_id', $2, true)", [
      scope.clientId,
      scope.tenantId ?? '',
    ]);
    const out = await fn(db);
    await db.query('COMMIT');
    return out;
  } catch (err) {
    await db.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    db.release();
  }
}

/** For the pre-authentication SECURITY DEFINER functions only (no scope exists yet). */
export async function unscoped<T>(fn: (db: PoolClient) => Promise<T>): Promise<T> {
  const p = getPool();
  await verified;
  const db = await p.connect();
  try {
    return await fn(db);
  } finally {
    db.release();
  }
}
