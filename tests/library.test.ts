import { describe, expect, it } from 'vitest';
import { allReplies, buildReply, detectTopics, tierFor } from '@/reviews-service/library';
import { replySafety } from '@/reviews-service/drafts';

describe('reply library', () => {
  const all = allReplies();

  it('offers thousands of distinct replies, and every one passes the safety check', () => {
    expect(new Set(all).size).toBeGreaterThanOrEqual(2000);
    const bad = all.filter((r) => !replySafety(r).ok);
    expect(bad.slice(0, 3)).toEqual([]);
  });

  it('is deterministic per seed and varies between seeds', () => {
    const input = { rating: 5, comment: 'Lovely staff', seed: 'review-1:0' };
    expect(buildReply(input)).toBe(buildReply(input));
    const variants = new Set(Array.from({ length: 30 }, (_, i) => buildReply({ ...input, seed: `review-1:${i}` })));
    expect(variants.size).toBeGreaterThan(10);
  });

  it('matches on topic words in the review, most mentioned first', () => {
    expect(detectTopics('The staff were friendly and the team was helpful')[0]).toBe('staff');
    expect(detectTopics('Very clean and hygienic')[0]).toBe('clean');
    expect(detectTopics('Very reasonable pricing')[0]).toBe('value');
    expect(detectTopics('Too expensive for what you get')).toEqual(['general']); // a complaint switches topic matching off
    expect(detectTopics('nothing specific')).toEqual(['general']);
  });

  it('uses a topic line only for a positive review that praises that topic', () => {
    for (let i = 0; i < 10; i++) expect(buildReply({ rating: 5, comment: 'so clean and tidy', seed: `x${i}` })).toMatch(/clean|tidy|spotless|fresh|space|spotless/i);
  });

  it.each([
    [4, 'The staff were rude and it was a bit expensive'],
    [4, 'long delay but friendly team'],
    [5, 'not very clean, though the staff were friendly'],
    [2, 'friendly staff but a long wait'],
    [1, 'the team was friendly and welcoming'],
    [3, 'professional and on time'],
  ])('never praises or concedes a detail that contradicts the review (%i stars: %s)', (rating, comment) => {
    for (let i = 0; i < 25; i++) {
      const r = buildReply({ rating, comment, seed: `p${i}` }).toLowerCase();
      expect(r).not.toMatch(/friendly|welcomed|welcoming|on time|smoothly|reasonabl|fairly priced|clean|tidy|comfortable|professional|wait|behind|rude/);
    }
  });

  it('does not say anything that confirms a visit or relationship', () => {
    expect(all.filter((r) => /\bagain\b.*(see|welcom)|see you|welcom\w* you|community|come back|visit/i.test(r))).toEqual([]);
  });

  it('never echoes health or treatment words from the review', () => {
    for (let i = 0; i < 40; i++) {
      const r = buildReply({ rating: i % 2 ? 5 : 1, comment: 'My knee pain treatment with the doctor and physiotherapy was great', seed: `s${i}` });
      expect(r.toLowerCase()).not.toMatch(/knee|pain|treatment|doctor|physio|patient/);
      expect(replySafety(r).ok).toBe(true);
    }
  });

  it('asks unhappy reviewers to get in touch, and keeps positive replies free of that', () => {
    for (let i = 0; i < 20; i++) {
      expect(buildReply({ rating: 1, seed: `n${i}` }).toLowerCase()).toMatch(/contact|reach out|get in touch|speak with|hear from you|hear more/);
    }
    expect(tierFor(5)).toBe('pos');
    expect(tierFor(3)).toBe('mid');
    expect(tierFor(2)).toBe('neg');
  });
});
