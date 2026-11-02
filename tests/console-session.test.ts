import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { makeSession, passwordOk, verifySession } from '@/reviews-service/console-session';

beforeAll(() => {
  process.env.CONSOLE_SESSION_SECRET = 'test-console-session-secret-0123456789';
});
afterEach(() => {
  delete process.env.CONSOLE_PASSWORD;
});

describe('console session cookie', () => {
  it('accepts a fresh signed value and rejects empty, malformed, tampered and expired ones', () => {
    const v = makeSession();
    expect(verifySession(v)).toBe(true);
    expect(verifySession(undefined)).toBe(false);
    expect(verifySession('')).toBe(false);
    expect(verifySession('garbage')).toBe(false);
    const [exp, sig] = v.split('.');
    expect(verifySession(`${Number(exp) + 1000}.${sig}`)).toBe(false); // extending the expiry breaks the signature
    expect(verifySession(`${exp}.${sig.slice(0, -2)}xx`)).toBe(false);
    expect(verifySession(v, Number(exp) + 1)).toBe(false); // expired
  });

  it('a value signed with a different secret is rejected', () => {
    const v = makeSession();
    process.env.CONSOLE_SESSION_SECRET = 'a-different-secret-value-0123456789';
    expect(verifySession(v)).toBe(false);
    process.env.CONSOLE_SESSION_SECRET = 'test-console-session-secret-0123456789';
    expect(verifySession(`${v}.junk`)).toBe(false); // exactly two parts
  });
});

describe('console password', () => {
  it('needs a configured password of at least 12 characters, and matches it exactly', () => {
    expect(passwordOk('anything')).toBe(false); // not configured
    process.env.CONSOLE_PASSWORD = 'short';
    expect(passwordOk('short')).toBe(false); // too short to be trusted
    process.env.CONSOLE_PASSWORD = 'a-long-console-password';
    expect(passwordOk('a-long-console-password')).toBe(true);
    expect(passwordOk('a-long-console-passwor')).toBe(false);
    expect(passwordOk('')).toBe(false);
  });
});
