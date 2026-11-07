// Shared shingle hashing for the copy guard (see build-guard.mjs).
import { createHash } from 'node:crypto';

export const N = 8;
export const normWords = (s) => (s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
const h = (s) => createHash('sha1').update(s).digest('hex').slice(0, 10);

export function shingles(text, n = N) {
  const w = normWords(text), out = [];
  for (let i = 0; i + n <= w.length; i++) out.push(h(w.slice(i, i + n).join(' ')));
  return out;
}

// Return the first offending n-word run in `text` whose hash is in `set`, or null.
export function firstHit(text, set, n = N) {
  const w = normWords(text);
  for (let i = 0; i + n <= w.length; i++) {
    const run = w.slice(i, i + n).join(' ');
    if (set.has(h(run))) return run;
  }
  return null;
}
