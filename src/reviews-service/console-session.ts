import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AuthedClient } from './apikeys';
import { sha256 } from './crypto';

/**
 * Sign-in for the demo console (src/app/console). One shared password (CONSOLE_PASSWORD) and an HMAC-signed, httpOnly cookie that
 * expires after 8 hours. The console acts as one client (CONSOLE_CLIENT_ID). This is a demo gate, not a user system.
 * Sessions are stateless: Sign out only removes the browser's cookie, and a stolen cookie stays valid until it expires or
 * CONSOLE_SESSION_SECRET is changed (which signs everyone out).
 */
export const COOKIE = 'tl_console';
export const SESSION_HOURS = 8;

function secret(): string {
  const p = process.env.CONSOLE_SESSION_SECRET;
  if (!p || p.length < 24) throw new Error('CONSOLE_SESSION_SECRET is not set or too short'); // dedicated key, not the API-key pepper
  return p;
}
const sign = (v: string) => createHmac('sha256', secret()).update(v).digest('base64url');

export function makeSession(now = Date.now()): string {
  const exp = String(now + SESSION_HOURS * 3600_000);
  return `${exp}.${sign(exp)}`;
}

export function verifySession(value: string | undefined | null, now = Date.now()): boolean {
  if (!value) return false;
  const parts = value.split('.');
  if (parts.length !== 2) return false;
  const [exp, sig] = parts;
  if (!exp || !sig || !/^\d{10,}$/.test(exp)) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp));
  return a.length === b.length && timingSafeEqual(a, b) && Number(exp) > now;
}

let warned = false;
export function passwordOk(input: string): boolean {
  const p = process.env.CONSOLE_PASSWORD;
  if (!p || p.length < 12) {
    if (!warned) { warned = true; console.error('[console] CONSOLE_PASSWORD is missing or shorter than 12 characters: nobody can sign in'); }
    return false; // refuses to work with a short or missing password
  }
  return timingSafeEqual(sha256(input), sha256(p));
}

export function consoleClient(): AuthedClient {
  const clientId = process.env.CONSOLE_CLIENT_ID;
  if (!clientId) throw new Error('CONSOLE_CLIENT_ID is not set');
  return { clientId, apiKeyId: 'console', scopes: ['connect', 'read', 'write'] };
}
