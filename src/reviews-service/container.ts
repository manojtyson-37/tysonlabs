import { EnvKeyWrapper, KeyWrapper } from './crypto';
import { GoogleGateway, RealGoogleGateway } from './google';
import { DraftGenerator, GeminiDraftGenerator } from './drafts';
import { LibraryDraftGenerator } from './library';

let wrapper: KeyWrapper | undefined;
let google: GoogleGateway | undefined;
let drafter: DraftGenerator | undefined;

export const getWrapper = (): KeyWrapper => (wrapper ??= new EnvKeyWrapper());
export const getGoogle = (): GoogleGateway => (google ??= new RealGoogleGateway());
// Default is the built-in reply library (no review text leaves our systems). AI drafting needs three things on purpose:
// DRAFTS_MODE=ai, a Gemini key, and AI_DRAFTS_POLICY_ACK=policy-updated (a reminder that the privacy and terms pages say review
// text is not sent to an AI provider and must be changed first).
export const getDrafter = (): DraftGenerator => {
  if (!drafter) {
    const ai = process.env.DRAFTS_MODE === 'ai' && process.env.AI_DRAFTS_POLICY_ACK === 'policy-updated' && !!process.env.GEMINI_API_KEY;
    if (ai) console.warn('[reviews-service] AI drafting is ON: review text is sent to the Gemini API');
    drafter = ai ? new GeminiDraftGenerator() : new LibraryDraftGenerator();
  }
  return drafter;
};

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
