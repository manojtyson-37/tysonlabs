import { NextResponse, type NextRequest } from 'next/server';
import { limitByIp } from '@/reviews-service/apikeys';
import { OAUTH_COOKIE, finishSignIn } from '@/reviews-service/signin';
import { recordLogin } from '@/reviews-service/members';
import { sessionFor } from '@/reviews-service/dash-session';
import { appBaseUrl, makeHandoffToken } from '@/reviews-service/app-auth';
import { verifyToken } from '@/reviews-service/signed';

const to = (path: string) => {
  const res = NextResponse.redirect(`${appBaseUrl()}${path}`, { status: 303 });
  res.headers.set('Cache-Control', 'no-store');
  res.cookies.set(OAUTH_COOKIE, '', { path: '/api/auth', maxAge: 0 }); // the start cookie is single use
  return res;
};

// Google sends the browser back here. A verified email with access to at least one business (or a TysonLabs admin) is handed to the
// app in a signed token that lives two minutes; the app then sets its own session.
export async function GET(request: NextRequest) {
  try {
    await limitByIp(request, 'signin', 30);
  } catch {
    return to('/login?e=busy');
  }
  const q = request.nextUrl.searchParams;
  if (q.get('error')) return to('/login?e=denied');
  const nonce = verifyToken<{ n?: string }>(request.cookies.get(OAUTH_COOKIE)?.value, 'oauth-start')?.n;
  if (!nonce) return to('/login?e=failed');
  const email = await finishSignIn(q.get('code'), q.get('state'), request.cookies.get(OAUTH_COOKIE)?.value, process.env.GOOGLE_APP_SIGNIN_REDIRECT_URI);
  if (!email) return to('/login?e=failed');
  try {
    if (!(await sessionFor(email))) return to('/login?e=no_access'); // same answer whether the email is unknown or has no business
    await recordLogin(email).catch(() => undefined);
    return to(`/auth/handoff?token=${encodeURIComponent(makeHandoffToken(email, nonce))}`);
  } catch {
    return to('/login?e=failed');
  }
}
