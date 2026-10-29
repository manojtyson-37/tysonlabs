import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Wraps and unwraps per-connection data keys. Production uses Cloud KMS (see docs/reviews-service-design.md §5);
 * until that is provisioned, EnvKeyWrapper holds the key-encryption key in REVIEWS_KEK.
 */
export interface KeyWrapper {
  readonly version: string;
  wrap(dataKey: Buffer, aad: string): Promise<string>;
  unwrap(wrapped: string, aad: string): Promise<Buffer>;
}

const b64 = (b: Buffer) => b.toString('base64');

// AAD binds each ciphertext to the row it belongs to, so copying one tenant's encrypted token onto another fails.
function gcmEncrypt(key: Buffer, plain: Buffer, aad: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
  c.setAAD(Buffer.from(aad));
  const ct = Buffer.concat([c.update(plain), c.final()]);
  return [b64(iv), b64(c.getAuthTag()), b64(ct)].join('.');
}

function gcmDecrypt(key: Buffer, payload: string, aad: string): Buffer {
  const [iv, tag, ct] = payload.split('.');
  if (!iv || !tag || !ct) throw new Error('Malformed ciphertext');
  const d = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'), { authTagLength: 16 });
  d.setAAD(Buffer.from(aad));
  d.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(ct, 'base64')), d.final()]);
}

export class EnvKeyWrapper implements KeyWrapper {
  readonly version = 'env-v1';
  private readonly kek: Buffer;
  constructor(kekBase64 = process.env.REVIEWS_KEK) {
    if (!kekBase64) throw new Error('REVIEWS_KEK is not set');
    this.kek = Buffer.from(kekBase64, 'base64');
    if (this.kek.length !== 32) throw new Error('REVIEWS_KEK must be 32 bytes, base64');
  }
  async wrap(dataKey: Buffer, aad: string) {
    return gcmEncrypt(this.kek, dataKey, aad);
  }
  async unwrap(wrapped: string, aad: string) {
    return gcmDecrypt(this.kek, wrapped, aad);
  }
}

export interface SealedSecret {
  ciphertext: string;
  wrappedDataKey: string;
  keyVersion: string;
}

/** Envelope encryption: a fresh data key per secret encrypts it, and the wrapper protects the data key. */
export async function seal(wrapper: KeyWrapper, plain: string, aad: string): Promise<SealedSecret> {
  const dataKey = randomBytes(32);
  return {
    ciphertext: gcmEncrypt(dataKey, Buffer.from(plain, 'utf8'), aad),
    wrappedDataKey: await wrapper.wrap(dataKey, aad),
    keyVersion: wrapper.version,
  };
}

export async function open(wrapper: KeyWrapper, sealed: Pick<SealedSecret, 'ciphertext' | 'wrappedDataKey'>, aad: string): Promise<string> {
  const dataKey = await wrapper.unwrap(sealed.wrappedDataKey, aad);
  return gcmDecrypt(dataKey, sealed.ciphertext, aad).toString('utf8');
}

export function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export function hmac(pepper: string, value: string): Buffer {
  return createHmac('sha256', pepper).update(value).digest();
}

export function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}
