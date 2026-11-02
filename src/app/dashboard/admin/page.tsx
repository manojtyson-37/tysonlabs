import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { currentSession, dashboardClientId } from '@/reviews-service/dash-session';
import { listMembers } from '@/reviews-service/members';
import { listTenants } from '@/reviews-service/reviews';
import { Notices, box, input, primary } from '../_ui/shared';
import { SubmitButton } from '../../console/submit-button';
import { adminAddAction } from '../actions';

type SP = Promise<Record<string, string | undefined>>;

export default function AdminPage({ searchParams }: { searchParams: SP }) {
  return <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}><Body searchParams={searchParams} /></Suspense>;
}

async function Body({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const s = await currentSession();
  if (!s?.isAdmin) redirect('/');
  const client = { clientId: dashboardClientId(), apiKeyId: `dash:${s.email}`.slice(0, 100), scopes: ['read'] };
  const tenants = await listTenants(client);
  const members = await Promise.all(tenants.map(async (t) => ({ t, m: await listMembers(client, t.ref) })));
  return (
    <>
      <Notices err={sp.err} ok={sp.ok} />
      <h1 className="font-display font-bold text-2xl text-zinc-950 dark:text-[#F4F3F8]">Businesses</h1>
      <form action={adminAddAction} className={`${box} space-y-3`}>
        <p className="text-sm text-zinc-500">Add a business, or give another person access to an existing one. They sign in with that Google email at this address, then choose Connect Google.</p>
        <input name="ref" placeholder="business-name (lowercase, dashes)" required className={input} />
        <input name="email" type="email" placeholder="person's Google email" required className={input} />
        <select name="role" className={input} defaultValue="owner"><option value="owner">Owner</option><option value="staff">Staff</option></select>
        <SubmitButton className={primary}>Add access</SubmitButton>
      </form>
      {members.map(({ t, m }) => (
        <div key={t.ref} className={`${box} text-sm`}>
          <p className="font-semibold text-zinc-950 dark:text-white">{t.ref} <span className="font-normal text-zinc-500">· {t.status === 'ACTIVE' ? `connected as ${t.googleEmail}` : t.status} · {t.reviews} reviews</span></p>
          <p className="mt-1 text-zinc-600 dark:text-[#A6A8B3]">{m.length ? m.map((x) => `${x.email} (${x.role}${x.last_login_at ? ', signed in' : ', not yet'})`).join(' · ') : 'No members yet'}</p>
        </div>
      ))}
    </>
  );
}
