import { EnvKeyWrapper, KeyWrapper } from './crypto';
import { GoogleGateway, RealGoogleGateway } from './google';
import { DraftGenerator, GeminiDraftGenerator } from './drafts';

let wrapper: KeyWrapper | undefined;
let google: GoogleGateway | undefined;
let drafter: DraftGenerator | undefined;

export const getWrapper = (): KeyWrapper => (wrapper ??= new EnvKeyWrapper());
export const getGoogle = (): GoogleGateway => (google ??= new RealGoogleGateway());
export const getDrafter = (): DraftGenerator => (drafter ??= new GeminiDraftGenerator());

/** Test seam. */
export function setDependencies(d: { wrapper?: KeyWrapper; google?: GoogleGateway; drafter?: DraftGenerator }) {
  wrapper = d.wrapper;
  google = d.google;
  drafter = d.drafter;
}

export function baseUrl(): string {
  const u = process.env.REVIEWS_BASE_URL;
  if (!u) throw new Error('REVIEWS_BASE_URL is not set');
  return u.replace(/\/$/, '');
}
