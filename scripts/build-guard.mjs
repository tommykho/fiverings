// Build data/guard/fingerprints.json: hashed 8-word shingles of copyrighted English texts about the book
// (modern translations and commercial summaries). Only truncated SHA-1 hashes are stored, never text, so the
// repository holds nothing readable from those works. validate-content.mjs uses the hashes to reject any
// project text that shares an 8-word run with them.
// Usage: node scripts/build-guard.mjs <text-file> [<text-file> ...]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { shingles } from './guard-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node scripts/build-guard.mjs <text-file> ...'); process.exit(1); }
const set = new Set();
for (const f of files) for (const h of shingles(readFileSync(f, 'utf8'))) set.add(h);
mkdirSync(join(root, 'data/guard'), { recursive: true });
writeFileSync(join(root, 'data/guard/fingerprints.json'), JSON.stringify({
  note: 'Truncated SHA-1 of normalised 8-word shingles from copyrighted translations/summaries. Not reversible. Used only to block copying.',
  n: 8,
  hashes: [...set].sort().join(' '),
}) + '\n');
console.log(`OK: ${set.size} fingerprints from ${files.length} file(s)`);
