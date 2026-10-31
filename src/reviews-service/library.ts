import { createHash } from 'node:crypto';
import type { DraftInput } from './drafts';

/**
 * Reply library: replies are assembled from pre-written parts (opener + topic line + closer), chosen by the review's rating
 * and by topics found in its text. No review text leaves our systems and no AI provider is involved, so every sentence a
 * clinic can post was written and checked in advance. The assembled reply still passes replySafety() before approval.
 *
 * Matching is by topic only (staff, cleanliness, waiting time, value, place, expertise). Health and treatment words in a
 * review are deliberately not mapped to anything, so a reply never echoes them.
 */

export type Tier = 'pos' | 'mid' | 'neg';
export type Topic = 'staff' | 'clean' | 'wait' | 'value' | 'place' | 'expertise' | 'general';
export const TOPICS: Topic[] = ['staff', 'clean', 'wait', 'value', 'place', 'expertise', 'general'];

const LEXICON: Record<Exclude<Topic, 'general'>, RegExp> = {
  staff: /\b(staff|team|reception\w*|friendly|polite|courteous|welcoming|helpful)\b/,
  clean: /\b(clean|hygien\w*|tidy|spotless|sanitis\w*)\b/,
  wait: /\b(prompt|punctual|on time|quick|quickly|smooth|smoothly)\b/,
  value: /\b(price|prices|pricing|reasonable|affordable|fair|good value)\b/,
  place: /\b(parking|ambience|ambiance|atmosphere|facilities|comfortable)\b/,
  expertise: /\b(professional|knowledgeable|skilled|attentive|thorough|listened|explained)\b/,
};

// If the text carries any negative cue or negation, topic matching is switched off: a reply must never praise something
// the reviewer complained about. The cue list is deliberately broad; a false alarm just gives the neutral wording.
const NEGATIVE_CUES = /\b(not|no|never|n't|nt|without|but|however|although|though|rude|slow|delay\w*|late|wait|waited|waiting|long|expensive|overpriced|costly|dirty|noisy|crowded|bad|poor|worst|terrible|awful|horrible|disappoint\w*|unprofessional|ignored|careless|mess\w*|smell\w*|only|unfortunately|sadly|problem\w*|issue\w*|complain\w*|hope|should|could|would|wish)\b/;

export const tierFor = (rating: number): Tier => (rating >= 4 ? 'pos' : rating === 3 ? 'mid' : 'neg');

/** Praise topics present in a positive review, most mentioned first. Always ends with 'general'. */
export function detectTopics(comment?: string | null): Topic[] {
  const text = (comment ?? '').toLowerCase().replace(/[\u2018\u2019]/g, "'");
  if (NEGATIVE_CUES.test(text)) return ['general'];
  const hits = (Object.keys(LEXICON) as Exclude<Topic, 'general'>[])
    .map((t) => ({ t, n: (text.match(new RegExp(LEXICON[t].source, 'g')) ?? []).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .map((x) => x.t);
  return [...hits, 'general'];
}

// Wording rules: nothing that confirms the reviewer visited or was a patient (no "again", "welcome back", "community"),
// nothing that concedes the specifics of a complaint, nothing that promises or offers anything.
const OPENERS: Record<Tier, string[]> = {
  pos: [
    'Thank you for taking the time to leave a review.',
    'Thank you so much for your review.',
    'We really appreciate you sharing your thoughts.',
    'Thank you for the kind review.',
    'It was good to read your review, and thank you for writing it.',
    'Thank you for your generous review.',
    'We are grateful that you took a moment to write this.',
    'Thank you for your feedback and your rating.',
  ],
  mid: [
    'Thank you for your honest review.',
    'Thank you for sharing your feedback with us.',
    'We appreciate you taking the time to review us.',
    'Thank you for your review and your candid thoughts.',
    'Thank you for letting us know how we did.',
    'We value your honest feedback.',
    'Thank you for taking a moment to write this.',
    'Thanks for your review.',
  ],
  neg: [
    'Thank you for sharing your feedback. We take it seriously.',
    'We are sorry to read this, and thank you for telling us.',
    'Thank you for your honest feedback. We are sorry you were disappointed.',
    'Thank you for raising this with us.',
    'We are sorry to hear you were disappointed.',
    'Thank you for your review. We take every piece of feedback seriously.',
    'We appreciate you being open about this, and we are sorry to read it.',
    'Thank you for letting us know.',
  ],
};

const POS_TOPIC_LINES: Record<Exclude<Topic, 'general'>, string[]> = {
  staff: ['It means a lot to us that you felt welcomed by our team.', 'We are delighted our team made a good impression.', 'Our team will be happy to hear your kind words.', 'Thank you for the kind words about our team.'],
  clean: ['We are glad you found the place clean and tidy.', 'Thank you for noticing how much we value a clean space.', 'It is good to hear the space felt clean and fresh.', 'We work hard to keep things spotless, so this means a lot.'],
  wait: ['We are glad things ran smoothly for you.', 'Thank you for noticing that we try to respect your time.', 'Running on time matters to us, so thank you for saying so.', 'It is good to hear it all went smoothly.'],
  value: ['We are glad you felt it was fairly priced.', 'Thank you for your kind words about our fair approach.', 'It is good to know you found our pricing reasonable.', 'We try to be fair and clear, so this is lovely to hear.'],
  place: ['We are glad you found the place comfortable.', 'It is good to hear you liked the setting.', 'Thank you for your kind words about our space.', 'We are glad the surroundings felt comfortable.'],
  expertise: ['We are glad you found the team professional and attentive.', 'Thank you for noticing how thoroughly our team listens and explains.', 'It is good to hear you felt listened to.', 'We are happy that our team came across as knowledgeable.'],
};

const GENERAL_LINES: Record<Tier, string[]> = {
  pos: ['Your support means a great deal to our whole team.', 'Words like these keep our team motivated.', 'We are glad it was a good experience overall.', 'Feedback like yours makes our day.'],
  mid: ['We are always looking for ways to do better.', 'Your comments help us see what we can do better.', 'We would like every experience to be a five-star one.', 'We always aim to do better.'],
  neg: ['We would like to understand what happened.', 'We take every piece of feedback seriously.', 'We would like the chance to look into this properly.', 'We want to understand your concerns.'],
};

const CLOSERS: Record<Tier, string[]> = {
  pos: [
    'Wishing you all the best.',
    'Thank you once more for your support.',
    'With thanks from all of us.',
    'Your support is truly appreciated.',
    'We are grateful for your kindness.',
    'Best wishes from our team.',
    'Warm wishes from all of us.',
    'We truly appreciate it.',
  ],
  mid: [
    'Please do get in touch if there is anything we can do better.',
    'We would welcome the chance to hear more from you.',
    'Thank you again for your feedback.',
    'We will keep working to do better.',
    'You are welcome to contact us directly with any thoughts.',
    'We appreciate your time.',
    'Thank you again for helping us do better.',
    'Your feedback is noted and appreciated.',
  ],
  neg: [
    'Please contact us directly so we can look into this.',
    'We would like to hear more, so please get in touch with us directly.',
    'Please reach out to us directly and we will listen.',
    'We would value the chance to speak with you directly.',
    'Please contact us directly so we can understand what happened.',
    'We hope you will reach out to us directly.',
    'Please get in touch with us directly. We want to understand.',
    'Your feedback matters and we hope to hear from you directly.',
  ],
};

const topicLines = (tier: Tier, topic: Topic): string[] => (tier === 'pos' && topic !== 'general' ? POS_TOPIC_LINES[topic] : GENERAL_LINES[tier]);

const pick = <T,>(items: T[], seed: string, salt: string): T => items[createHash('sha256').update(`${seed}|${salt}`).digest().readUInt32BE(0) % items.length];

/**
 * Deterministic for a given seed; different seeds give different wording. Only positive reviews get a topic line, and only
 * when the text has no negative cue. Everything else gets neutral wording that concedes nothing.
 */
export function buildReply({ rating, comment, seed = '' }: DraftInput & { seed?: string }): string {
  const tier = tierFor(rating);
  const topic = tier === 'pos' ? detectTopics(comment)[0] : 'general';
  return [pick(OPENERS[tier], seed, 'o'), pick(topicLines(tier, topic), seed, 't'), pick(CLOSERS[tier], seed, 'c')].join(' ');
}

/** Every reply the library can produce. Used by tests to prove each one passes the safety check. */
export function allReplies(): string[] {
  const out: string[] = [];
  for (const tier of ['pos', 'mid', 'neg'] as Tier[])
    for (const topic of tier === 'pos' ? TOPICS : (['general'] as Topic[]))
      for (const o of OPENERS[tier]) for (const t of topicLines(tier, topic)) for (const c of CLOSERS[tier]) out.push(`${o} ${t} ${c}`);
  return [...new Set(out)];
}

export class LibraryDraftGenerator {
  readonly kind = 'library' as const;
  async generate(input: DraftInput & { seed?: string }): Promise<string> {
    return buildReply(input);
  }
}
