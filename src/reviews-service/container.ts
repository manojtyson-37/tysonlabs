import { EnvKeyWrapper, KeyWrapper } from './crypto';
import { GoogleGateway, RealGoogleGateway } from './google';

let wrapper: KeyWrapper | undefined;
let google: GoogleGateway | undefined;

export const getWrapper = (): KeyWrapper => (wrapper ??= new EnvKeyWrapper());
export const getGoogle = (): GoogleGateway => (google ??= new RealGoogleGateway());

/** Test seam. */
export function setDependencies(d: { wrapper?: KeyWrapper; google?: GoogleGateway }) {
  wrapper = d.wrapper;
  google = d.google;
}

export function baseUrl(): string {
  const u = process.env.REVIEWS_BASE_URL;
  if (!u) throw new Error('REVIEWS_BASE_URL is not set');
  return u.replace(/\/$/, '');
}
