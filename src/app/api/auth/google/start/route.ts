import { NextResponse } from 'next/server';
import { limitByIp } from '@/reviews-service/apikeys';
import { OAUTH_COOKIE, startSignIn } from '@/reviews-service/signin';
import { handleError } from '@/reviews-service/http';
import { onDashboardHost } from '@/reviews-service/dash-host';

// Sends the browser to Google's sign-in (openid + email only) with PKCE and a signed state cookie.
export async function GET(request: Request) {
  if (!onDashboardHost(request)) return new NextResponse(null, { status: 404 });
  try {
    await limitByIp(request, 'signin', 30);
    const { url, cookie } = startSignIn();
    const res = NextResponse.redirect(url, { status: 303 });
    res.cookies.set(OAUTH_COOKIE, cookie, { httpOnly: true, secure: true, sameSite: 'lax', path: '/api/auth', maxAge: 600 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err) {
    return handleError(err);
  }
}
