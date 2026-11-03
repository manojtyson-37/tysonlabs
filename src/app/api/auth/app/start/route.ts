import { NextResponse } from 'next/server';
import { limitByIp } from '@/reviews-service/apikeys';
import { OAUTH_COOKIE, startSignIn } from '@/reviews-service/signin';
import { handleError } from '@/reviews-service/http';
import { appBaseUrl } from '@/reviews-service/app-auth';

// Sign-in for the separate reviews app: openid + email only, PKCE, signed state cookie. The browser comes back to the callback below.
export async function GET(request: Request) {
  try {
    await limitByIp(request, 'signin', 30);
    const redirectUri = process.env.GOOGLE_APP_SIGNIN_REDIRECT_URI;
    if (!redirectUri) throw new Error('GOOGLE_APP_SIGNIN_REDIRECT_URI is not set');
    // The app sets a secret nonce in the browser first; it rides in the start cookie, then the handoff token, and the app must show it again.
    const nonce = new URL(request.url).searchParams.get('n') ?? '';
    if (!/^[A-Za-z0-9_-]{22,64}$/.test(nonce)) return NextResponse.redirect(`${appBaseUrl()}/login?e=failed`, { status: 303 });
    const { url, cookie } = startSignIn(redirectUri, 'app', nonce);
    const res = NextResponse.redirect(url, { status: 303 });
    res.cookies.set(OAUTH_COOKIE, cookie, { httpOnly: true, secure: true, sameSite: 'lax', path: '/api/auth', maxAge: 600 });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (err) {
    return handleError(err);
  }
}
