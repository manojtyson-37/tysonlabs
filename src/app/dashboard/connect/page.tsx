import { Suspense } from 'react';
import { availableLocations, getConnection } from '@/reviews-service/service';
import { Notices, TenantTabs, box, btn, loadContext, primary } from '../_ui/shared';
import { SubmitButton } from '../../console/submit-button';
import { connectAction, linkAction } from '../actions';
import { withScope } from '@/reviews-service/db';
import { resolveTenant } from '@/reviews-service/service';

type SP = Promise<Record<string, string | undefined>>;
const RESULT: Record<string, string> = {
  connected: 'Google is connected. Now choose the location to bring in.',
  no_business_profile: 'You signed in, but that Google account does not manage a Business Profile. Connect again with the account that manages your business.',
  denied: 'Connecting was cancelled.',
  insufficient_permission: 'Google did not give the permission we need. Connect again and allow it.',
  error: 'Connecting did not complete. Please try again.',
};

export default function ConnectPage({ searchParams }: { searchParams: SP }) {
  return <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}><Body searchParams={searchParams} /></Suspense>;
}

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await loadContext(sp);
  const t = ctx.tenant;
  const c = ctx.client;
  if (!t || !c) return <p className="text-sm text-zinc-500">No businesses to show yet.</p>;
  const conn = await getConnection(c, t.ref);
  const tenantId = await resolveTenant(c, t.ref);
  const linked = await withScope({ clientId: c.clientId, tenantId }, async (db) => (await db.query('SELECT google_location_id, name FROM location_links WHERE tenant_id = $1 ORDER BY name', [tenantId])).rows as { google_location_id: string; name: string }[]);
  const available = conn.connected ? await availableLocations(c, t.ref).catch(() => []) : [];
  const result = sp.status && Object.hasOwn(RESULT, sp.status) ? RESULT[sp.status] : null;
  const unlinked = available.filter((l) => !linked.some((x) => x.google_location_id === l.googleLocationId));
  return (
    <>
      <Notices err={sp.err} ok={sp.ok} />
      {result && <p className="rounded-lg border border-black/20 dark:border-white/20 p-3 text-sm">{result}</p>}
      <TenantTabs ctx={ctx} path="/connect" />
      <h1 className="font-display font-bold text-2xl text-zinc-950 dark:text-[#F4F3F8]">Google connection · {t.ref}</h1>
      <div className={`${box} space-y-3 text-sm`}>
        <p>{conn.connected ? <>Connected as <b>{conn.googleEmail ?? 'unknown'}</b>.</> : conn.status === 'NEEDS_REAUTH' ? 'Google access was lost. Connect again.' : 'Not connected.'}</p>
        <form action={connectAction}><input type="hidden" name="tenant" value={t.ref} /><SubmitButton className={conn.connected ? btn : primary}>{conn.connected ? 'Reconnect Google' : 'Connect Google'}</SubmitButton></form>
        <p className="text-xs text-zinc-500">Sign in with the Google account that owns or manages your Business Profile. We ask only to read your reviews and to post replies that you approve. To disconnect or delete your data, contact TysonLabs.</p>
      </div>
      {linked.length > 0 && (
        <div className={`${box} text-sm`}><p className="mb-2 text-xs font-mono uppercase text-zinc-500">Connected locations</p>{linked.map((l) => <p key={l.google_location_id}>{l.name}</p>)}</div>
      )}
      {unlinked.length > 0 && (
        <div className={`${box} space-y-2 text-sm`}>
          <p className="text-xs font-mono uppercase text-zinc-500">Locations on this Google account</p>
          {unlinked.map((l) => (
            <form action={linkAction} key={l.googleLocationId} className="flex items-center justify-between gap-3">
              <span>{l.name}{l.address ? <span className="text-zinc-500"> · {l.address}</span> : null}</span>
              <input type="hidden" name="tenant" value={t.ref} /><input type="hidden" name="location" value={l.googleLocationId} /><SubmitButton className={btn}>Use this location</SubmitButton>
            </form>
          ))}
        </div>
      )}
    </>
  );
}
