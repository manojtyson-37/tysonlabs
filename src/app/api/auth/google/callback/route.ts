import { NextResponse, type NextRequest } from 'next/server';
import { limitByIp } from '@/reviews-service/apikeys';
import { OAUTH_COOKIE, finishSignIn } from '@/reviews-service/signin';
import { membershipsFor, recordLogin } from '@/reviews-service/members';
import { onDashboardHost } from '@/reviews-service/dash-host';
import { verifyToken } from '@/reviews-service/signed';
import { GET as appCallback } from '../../app/callback/route';
import { SESSION_COOKIE, SESSION_HOURS, makeSessionCookie } from '@/reviews-service/dash-session';

const base = () => (process.env.DASHBOARD_BASE_URL ?? 'https://reviews.tysonlabs.in').replace(/\/$/, '');
const to = (path: string) => {
  const res = NextResponse.redirect(`${base()}${path}`, { status: 303 });
  res.headers.set('Cache-Control', 'no-store');
  res.cookies.set(OAUTH_COOKIE, '', { path: '/api/auth', maxAge: 0 }); // the start cookie is single use
  return res;
};
const adminEmails = () => (process.env.DASHBOARD_ADMIN_EMAILS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

// Google sends the browser back here. Only a verified email with access to at least one business (or a TysonLabs admin) gets a session.
export async function GET(request: NextRequest) {
  // The separate reviews app signs in through this same registered redirect address; its start cookie says so.
  let appFlow = false;
  try { appFlow = verifyToken<{ flow?: string }>(request.cookies.get(OAUTH_COOKIE)?.value, 'oauth-start')?.flow === 'app'; } catch { /* secret missing: fall through to the normal error handling */ }
  if (appFlow) return appCallback(request);
  if (!onDashboardHost(request)) return new NextResponse(null, { status: 404 });
  try {
    await limitByIp(request, 'signin', 30);
  } catch {
    return to('/login?e=busy');
  }
  const q = request.nextUrl.searchParams;
  if (q.get('error')) return to('/login?e=denied');
  const email = await finishSignIn(q.get('code'), q.get('state'), request.cookies.get(OAUTH_COOKIE)?.value);
  if (!email) return to('/login?e=failed');
  try {
    let allowed = adminEmails().includes(email);
    if (!allowed) allowed = (await membershipsFor(email)).length > 0;
    if (!allowed) return to('/login?e=no_access'); // same answer whether the email is unknown or just has no business
    await recordLogin(email).catch(() => undefined);
  } catch {
    return to('/login?e=failed'); // a database problem must not become a raw 500 or leave the start cookie behind
  }
  const res = to('/');
  res.cookies.set(SESSION_COOKIE, makeSessionCookie(email), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_HOURS * 3600 });
  return res;
}
